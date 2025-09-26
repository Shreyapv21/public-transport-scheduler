const Route = require('../models/Route');

// GET all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, transportType, status } = req.query;
    const filter = {};
    
    if (transportType) filter.transportType = transportType;
    if (status) filter.status = status;
    
    const routes = await Route.find(filter)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Route.countDocuments(filter);
    
    res.json({
      routes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE new route
exports.createRoute = async (req, res) => {
  try {
    const route = new Route({
      ...req.body,
      createdBy: req.user?.id
    });
    
    await route.save();
    await route.populate('createdBy', 'name email');
    
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE route
exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE route
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH routes
exports.searchRoutes = async (req, res) => {
  try {
    const { start, end, transportType, departureTime } = req.query;
    
    const filter = {};
    if (transportType) filter.transportType = transportType;
    
    if (start || end) {
      filter.$and = [];
      
      if (start) {
        filter.$and.push({
          $or: [
            { 'startPoint.name': { $regex: start, $options: 'i' } },
            { 'startPoint.address': { $regex: start, $options: 'i' } }
          ]
        });
      }
      
      if (end) {
        filter.$and.push({
          $or: [
            { 'endPoint.name': { $regex: end, $options: 'i' } },
            { 'endPoint.address': { $regex: end, $options: 'i' } }
          ]
        });
      }
    }
    
    const routes = await Route.find(filter).limit(10);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};