'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const {Event} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', {session: false});

//Get events
router.get('/', (req, res) => {
  return Event.find()
    .then(events => res.json(events.map(event => event.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/user', jwtAuth, (req, res, next) => {

  return Event.find( { $or: [ {"userId": req.user._id}, {"acceptUserId": req.user._id} ] } )
  
    .then(events => res.json(events.map(event => event.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
}) 

router.patch('/:id', jsonParser, jwtAuth, (req, res, next) => {//updating not posting
  const acceptUserId = req.user._id;
  const { id } = req.params;

  const updateEvent = {//Dont create a new event create a accpeted id initial set to null and when a person accept it set it to that id
    title: req.body.title,
    hours: req.body.hours,
    pay: req.body.pay,
    userId: req.body.userId,
    acceptUserId: acceptUserId
  };

    Event.findByIdAndUpdate(id, updateEvent, {
      new: true
    })
    .then(event => {
      if (event) {
        res.json(event);
      } else {
        next();
      }
    })

  .catch(err => res.status(500).json({message: 'Internal server error'}));
}) 

router.delete('/:id', jsonParser, jwtAuth, (req, res, next) => {

  const { id } = req.params;

    Event.findByIdAndRemove(id)
    .then(result => {
      if (result) {
        res.status(204).end();
      } else {
        next();
      }
    })

  .catch(err => res.status(500).json({message: 'Internal server error'}));
}) 


// Post a new Event
router.post('/', jsonParser, jwtAuth, (req, res) => {
    // console.log(req.user);
    const userId = req.user._id;
    const requiredFields = ['title', 'hours', 'pay'];
    const missingField = requiredFields.find(field => !(field in req.body));
  
    if (missingField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField
      });
    }
  
    const stringFields = ['title', 'hours', 'pay'];
    const nonStringField = stringFields.find(
      field => field in req.body && typeof req.body[field] !== 'string'
    );
  
    if (nonStringField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Incorrect field type: expected string',
        location: nonStringField
      });
    }
 

    const event = new Event({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        hours: req.body.hours,
        pay: req.body.pay,
        userId: userId,
        acceptUserId: null
      });



    event.save().then(result => {
        console.log(result);
        res.status(201).json({
         message: 'Handling POST requests to /events',
         createEvent: result
       });
    })

  
      .catch(err => {
        res.status(500).json({code: 500, message: 'Internal server error'});
      });
  });

  module.exports = {router};