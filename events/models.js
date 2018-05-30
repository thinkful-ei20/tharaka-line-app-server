'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const EventSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  pay: {
    type: Number,
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};