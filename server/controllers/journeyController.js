const Journey = require('../models/Journey');

exports.getAllJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({ user: req.user.id })
      .populate('routes')
      .sort({ createdAt: -1 });
    res.json(journeys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createJourney = async (req, res) => {
  try {
    const journey = new Journey({
      ...req.body,
      user: req.user.id
    });
    await journey.save();
    await journey.populate('routes');
    res.status(201).json(journey);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateJourney = async (req, res) => {
  try {
    const journey = await Journey.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('routes');
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    
    res.json(journey);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteJourney = async (req, res) => {
  try {
    const journey = await Journey.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    
    res.json({ message: 'Journey deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};