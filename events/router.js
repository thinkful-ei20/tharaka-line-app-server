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
  
    // If the username and password aren't trimmed we give an error.  Users might
    // expect that these will work without trimming (i.e. they want the password
    // "foobar ", including the space at the end).  We need to reject such values
    // explicitly so the users know what's happening, rather than silently
    // trimming them and expecting the user to understand.
    // We'll silently trim the other fields, because they aren't credentials used
    // to log in, so it's less of a problem.
    // const explicityTrimmedFields = ['title', 'hours', 'pay'];
    // const nonTrimmedField = explicityTrimmedFields.find(
    //   field => req.body[field].trim() !== req.body[field]
    // );
  
    // if (nonTrimmedField) {
    //   return res.status(422).json({
    //     code: 422,
    //     reason: 'ValidationError',
    //     message: 'Cannot start or end with whitespace',
    //     location: nonTrimmedField
    //   });
    // }
  
    // const sizedFields = {
    //   username: {
    //     min: 1
    //   },
    //   password: {
    //     min: 10,
    //     // bcrypt truncates after 72 characters, so let's not give the illusion
    //     // of security by storing extra (unused) info
    //     max: 72
    //   }
    // };
    // const tooSmallField = Object.keys(sizedFields).find(
    //   field =>
    //     'min' in sizedFields[field] &&
    //           req.body[field].trim().length < sizedFields[field].min
    // );
    // const tooLargeField = Object.keys(sizedFields).find(
    //   field =>
    //     'max' in sizedFields[field] &&
    //           req.body[field].trim().length > sizedFields[field].max
    // );
  
    // if (tooSmallField || tooLargeField) {
    //   return res.status(422).json({
    //     code: 422,
    //     reason: 'ValidationError',
    //     message: tooSmallField
    //       ? `Must be at least ${sizedFields[tooSmallField]
    //         .min} characters long`
    //       : `Must be at most ${sizedFields[tooLargeField]
    //         .max} characters long`,
    //     location: tooSmallField || tooLargeField
    //   });
    // }
  
    // let {title, hours, pay} = req.body;

    const event = new Event({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        hours: req.body.hours,
        pay: req.body.pay,
        userId: userId,
        acceptUserId: null
      });

    // Username and password come in pre-trimmed, otherwise we throw an error
    // before this

    // title = title.trim();

    event.save().then(result => {
        console.log(result);
        res.status(201).json({
         message: 'Handling POST requests to /events',
         createEvent: result
       });
    })

  
    // return User.find({username})
    //   .count()
    //   .then(count => {
    //     if (count > 0) {
    //       // There is an existing user with the same username
    //       return Promise.reject({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: 'Username already taken',
    //         location: 'username'
    //       });
    //     }
    //     // If there is no existing user, hash the password
    //     return User.hashPassword(password);
    //   })
    //   .then(hash => {
    //     return User.create({
    //       username,
    //       password: hash,
    //       firstName,
    //       lastName,
    //       email
    //     });
    //   })
    //   .then(user => {
    //     return res.status(201).json(user.serialize());
    //   })
      .catch(err => {
        // Forward validation errors on to the client, otherwise give a 500
        // error because something unexpected has happened
        // if (err.reason === 'ValidationError') {
        //   return res.status(err.code).json(err);
        // }
        res.status(500).json({code: 500, message: 'Internal server error'});
      });
  });

  module.exports = {router};