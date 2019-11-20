const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');

// Middlewares
const {
  isLoggedIn
} = require('../helpers/authMiddleware');

// List Projects
router.get('/', isLoggedIn(), async (req, res, next) => {
  try {
    const projects = await Project.find({
        deleted: false
      })
      .populate('creator')
      .populate({
        path: 'issues',
        match: {
          deleted: false
        }
      });
    res.status(200).json(projects);
    return;
  } catch (error) {
    next(error);
  }
});

// Create Project
router.post('/create', isLoggedIn(), async (req, res, next) => {
  const {
    name,
    description,
    imageURL
  } = req.body;
  console.log(req.body);
  const user = req.session.currentUser;
  try {
    const newProjectDetails = {
      name: name,
      description: description,
      creator: user._id,
      image: imageURL
    };
    // Check if the name is taken by an active project
    const projectExists = await Project.findOne({
      name: name,
      deleted: false
    });
    if (!projectExists) {
      const newProject = await Project.create(newProjectDetails);
      // Add new project to the user's profile
      await User.findByIdAndUpdate(user._id, {
        $push: {
          projects: newProject._id
        }
      });
      res.status(200).json(newProject);
      return;
    } else {
      res.status(400).send('That project name is already in use');
    }
  } catch (error) {
    next(error);
  }
});

// Update Project
router.put('/:id/update', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  const {
    name,
    description
  } = req.body;
  try {
    // TODO: Check for a better way to Find and then Update if the condition is true
    const project = await Project.findById(id);
    // Check if the user is the project's creator
    if (project.creator.toString() === user._id) {
      const updateProject = await Project.findByIdAndUpdate(id, {
        $set: {
          name: name,
          description: description
        }
      }, {
        new: true
      });
      res.status(200).json(updateProject);
      return;
    } else {
      res.status(401).end("A project can only be updated by it's creator");
      return;
    }
  } catch (error) {
    next(error);
  }
});

// Delete Project
router.get('/:id/delete', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  try {
    // TODO: Check for a better way to Find and then Update if the condition is true
    const project = await Project.findById(id);
    // Check if the user is the project's creator
    if (project.creator._id.toString() === user._id) {
      const deleteProject = await Project.findByIdAndUpdate(id, {
        $set: {
          deleted: true
        }
      }, {
        new: true
      });
      res.status(200).json(deleteProject);
      return;
    } else {
      res.status(401).end("A project can only be deleted by it's creator");
      return;
    }
  } catch (error) {
    next(error);
  }
});

// Get Project details
router.get('/:id', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  try {
    const project = await Project.findById(id, {
        deleted: false
      })
      .populate({
        path: 'creator',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'issues',
        match: {
          deleted: false
        }
      });
    res.status(200).json(project);
    return;
  } catch (error) {
    next(error);
  }
});

module.exports = router;
