'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserEventSchema = mongoose.Schema({
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
  }//need another field to see if a user picked a job posted by another user. Check box.
});

UserEventSchema.methods.serialize = function() {
  return {
    title: this.title || '',
    hours: this.hours || '',
    pay: this.pay || '',
    userId: this.userId || '',
    _id: this._id || ''
  };
};

const UserEvent = mongoose.model('UserEvent', UserEventSchema);

module.exports = {UserEvent};