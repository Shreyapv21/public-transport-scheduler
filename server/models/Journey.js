const mongoose = require('mongoose');

const JourneySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startLocation: {
    name: String,
    coordinates: [Number],
    address: String
  },
  endLocation: {
    name: String,
    coordinates: [Number],
    address: String
  },
  preferredDepartureTime: Date,
  preferredArrivalTime: Date,
  routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
  totalDuration: Number,
  totalFare: Number,
  status: { 
    type: String, 
    enum: ['planned', 'active', 'completed', 'cancelled'], 
    default: 'planned' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Journey', JourneySchema);