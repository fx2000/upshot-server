const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middlewares
const {
  isLoggedIn
} = require('../helpers/authMiddleware');

// List users
router.get('/', isLoggedIn(), async (req, res, next) => {
  try {
    const users = await User.find({
      deleted: false
    });
    res.status(200).json(users);
    return;
  } catch (error) {
    next(error);
  }
});

// Update user details
router.put('/:id/update', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  const {
    firstName,
    lastName,
    email,
    avatar
  } = req.body;
  try {
    // Check if the user is the profile's owner
    if (id === user._id) {
      // Check if email is already in use
      const emailExists = await User.findOne({
        email
      }, 'email');
      if (!emailExists) {
        const updateUser = await User.findByIdAndUpdate(id, {
          $set: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            avatar: avatar
          }
        }, {
          new: true
        });
        res.status(200).json(updateUser);
        return;
      } else {
        res.status(400).end('Email is already is use');
      }
    } else {
      res.status(401).end("You can't update another user's details");
      return;
    }
  } catch (error) {
    next(error);
  }
});

// Revert to default avatar
router.get('/:id/remove-avatar', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  try {
    // Check if the user is the profile's owner
    if (id === user._id) {
      const updateUser = await User.findByIdAndUpdate(id, {
        // TODO: Find a better way to reset to the model's default value
        $set: {
          avatar: 'https://res.cloudinary.com/fx2000/image/upload/v1573725101/upshot/project-placeholder.png'
        }
      }, {
        new: true
      });
      res.status(200).json(updateUser);
      return;
    } else {
      res.status(401).end("You can't remove another user's avatar");
      return;
    }
  } catch (error) {
    next(error);
  }
});

// Get user details TODO: Review autopopulate plugin docs
router.get('/:id', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  try {
    const user = await User.findById(id, {
        deleted: false
      })
      .populate({
        path: 'issues',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'projects',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'comments',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'following',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'assignedTo',
        match: {
          deleted: false
        }
      });
    res.status(200).json(user);
    return;
  } catch (error) {
    next(error);
  }
});

module.exports = router;
