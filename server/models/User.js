const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    preferredTransportTypes: [String], // bus, train, metro, tram
    maxWalkingDistance: { type: Number, default: 1000 }, // meters
    accessibilityNeeds: Boolean,
    preferredDepartureTime: String
  },
  favoriteRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);