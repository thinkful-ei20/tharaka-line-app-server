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
  },
  acceptUserId: {
    type: mongoose.Schema.Types.ObjectId
  }
});

EventSchema.methods.serialize = function() {
  return {
    title: this.title || '',
    hours: this.hours || '',
    pay: this.pay || '',
    userId: this.userId || '',
    acceptUserId: this.acceptUserId || '',
    _id: this._id || ''
  };
};

const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};