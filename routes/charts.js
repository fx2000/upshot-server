const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const User = require('../models/User');
const moment = require('moment');

// Middlewares
const {
  isLoggedIn
} = require('../helpers/authMiddleware');

router.get('/prioritypie', isLoggedIn(), async (req, res, next) => {
  try {
    const issues = await Issue.find({
      deleted: false
    });
    const pieData = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    }
    issues.forEach(issue => {
      switch (issue.priority) {
        case 'Low': pieData.low++; break;
        case 'Medium': pieData.medium++; break;
        case 'High': pieData.high++; break;
        case 'Critical': pieData.critical++; break;
      }
    });
    res.status(200).json(pieData);
    return;
  } catch (error) {
    next(error);
  }
});

router.get('/bardata', isLoggedIn(), async (req, res, next) => {
  try {
    const users = await User.find({
      deleted: false
    }).lean();
    const projects = await Project.find({
      deleted: false
    }).lean();
    const issues = await Issue.find({
      deleted: false
    }).lean();
    const comments = await Comment.find({
      deleted: false
    }).lean();
    const barData = {
      users: users.length,
      projects: projects.length,
      issues: issues.length,
      comments: comments.length
    }
    res.status(200).json(barData);
    return;
  } catch (error) {
    next(error);
  }
});

module.exports = router;
