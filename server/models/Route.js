const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  transportType: { 
    type: String, 
    enum: ['bus', 'train', 'metro', 'tram'], 
    required: true 
  },
  startPoint: {
    name: String,
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  endPoint: {
    name: String,
    coordinates: [Number],
    address: String
  },
  intermediateStops: [{
    name: String,
    coordinates: [Number],
    address: String,
    arrivalTime: String,
    departureTime: String
  }],
  schedule: {
    weekdays: [{
      departureTime: String,
      frequency: Number // minutes between services
    }],
    weekends: [{
      departureTime: String,
      frequency: Number
    }]
  },
  duration: Number, // minutes
  fare: Number,
  accessibility: Boolean,
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'delayed', 'cancelled'], 
    default: 'active' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);