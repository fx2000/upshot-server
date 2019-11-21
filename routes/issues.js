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

// List issues TODO: Review autopopulate() plugin docs
router.get('/', isLoggedIn(), async (req, res, next) => {
  try {
    const issues = await Issue.find({
        deleted: false
      }).lean()
      .populate({
        path: 'project',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'creator',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'assignedTo',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'followers',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'comments',
        match: {
          deleted: false
        }
      });
    issues.forEach(issue => {
      issue.relativeDate = moment(issue.createdAt).fromNow();
      issue.creationDate = moment(issue.createdAt).format('YYYY-DD-MM');
    })
    res.status(200).json(issues);
    return;
  } catch (error) {
    next(error);
  }
});

// Create Issue
router.post('/create', isLoggedIn(), async (req, res, next) => {
  const {
    title,
    content,
    project,
    priority,
    attachments
  } = req.body;
  const user = req.session.currentUser;
  try {
    const newIssueDetails = {
      title: title,
      content: content,
      project: project,
      creator: user._id,
      priority: priority,
      attachments: attachments
    };
    const newIssue = await Issue.create(newIssueDetails);
    // Add new issue to the appropriate project
    await Project.findByIdAndUpdate(project, {
      $push: {
        issues: newIssue._id
      }
    });
    // Add new issue to the user's profile
    await User.findByIdAndUpdate(user._id, {
      $push: {
        issues: newIssue._id
      }
    });
    res.status(200).json(newIssue);
    return;
  } catch (error) {
    next(error);
  }
});

// Comment on Issue
router.post('/:id/comment', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const {
    content
  } = req.body;
  const user = req.session.currentUser;
  try {
    // Create new comment
    const newComment = await Comment.create({
      user: user._id,
      issue: id,
      content: content
    });
    // Add new comment to the appropriate issue
    await Issue.findByIdAndUpdate(id, {
      $push: {
        comments: newComment._id
      }
    });
    // Add new comment to the user's profile
    await User.findByIdAndUpdate(user._id, {
      $push: {
        comments: newComment._id
      }
    });
    res.status(200).json(newComment);
    return;
  } catch (error) {
    next(error);
  }
});

// Follow Issue
router.get('/:id/follow', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  try {
    // Add new follower to issue
    const follow = await Issue.findByIdAndUpdate(id, {
      $addToSet: {
        followers: user._id
      }
    }, {
      new: true
    });
    // Add followed issue to user's profile
    await User.findByIdAndUpdate(user._id, {
      $addToSet: {
        following: id
      }
    });
    res.status(200).json(follow);
    return;
  } catch (error) {
    next(error);
  }
});

// Unfollow Issue
router.get('/:id/unfollow', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  try {
    // Remove follower from issue
    const unfollow = await Issue.findByIdAndUpdate(id, {
      $pull: {
        followers: user._id
      }
    }, {
      new: true
    });
    // Remove followed issue from user's profile
    await User.findByIdAndUpdate(user._id, {
      $pull: {
        following: id
      }
    });
    res.status(200).json(unfollow);
    return;
  } catch (error) {
    next(error);
  }
});

// Takeover Issue
router.get('/:id/takeover', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  try {
    // Add user to issue
    const takeover = await Issue.findByIdAndUpdate(id, {
      $addToSet: {
        assignedTo: user._id
      }
    }, {
      new: true
    });
    // Add issue to user
    await User.findByIdAndUpdate(user._id, {
      $addToSet: {
        assignedTo: id
      }
    });
    res.status(200).json(takeover);
    return;
  } catch (error) {
    next(error);
  }
});

// Release Issue
router.get('/:id/release', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  try {
    // Remove user from issue
    const release = await Issue.findByIdAndUpdate(id, {
      $pull: {
        assignedTo: user._id
      }
    }, {
      new: true
    });
    // Remove issue from user's profile
    await User.findByIdAndUpdate(user._id, {
      $pull: {
        assignedTo: id
      }
    });
    res.status(200).json(release);
    return;
  } catch (error) {
    next(error);
  }
});

// Assign Issue
router.post('/:id/assign', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const {
    user
  } = req.body;
  try {
    // Add user to issue
    const assign = await Issue.findByIdAndUpdate(id, {
      $addToSet: {
        assignedTo: user
      }
    }, {
      new: true
    });
    // Add issue to user's profile
    await User.findByIdAndUpdate(user, {
      $addToSet: {
        assignedTo: id
      }
    });
    res.status(200).json(assign);
    return;
  } catch (error) {
    next(error);
  }
});

// Update Issue TODO: Check if file uploads are working correctly on update, they might be overwriting previous attachments
router.put('/:id/update', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  const {
    title,
    content,
    project,
    priority,
    status,
    attachments
  } = req.body;
  try {
    // TODO: Check for a better way to Find and then Update if the condition is true
    const issue = await Issue.findById(id);
    // Check if the current user is the issue's creator
    if (issue.creator._id.toString() === user._id) {
      const updateIssue = await Issue.findOneAndUpdate(id, {
        $set: {
          title: title,
          content: content,
          project: project,
          priority: priority,
          status: status
        },
        $push: {
          attachments: attachments
        }
      }, {
        new: true
      });
      console.log(updateIssue)
      res.status(200).json(updateIssue);
      return;
    } else {
      res.status(401).end("An issue can only be updated by it's creator");
      return;
    }
  } catch (error) {
    next(error);
  }
});

// Remove issue attachments
router.put('/:id/remove-attachment/:attachment', isLoggedIn(), async (req, res, next) => {
  const {
    id,
    attachment
  } = req.params;
  const user = req.session.currentUser;
  try {
    // TODO: Check for a better way to Find and then Update if the condition is true
    const issue = await Issue.findById(id);
    // Check if the current user is the issue's creator
    if (issue.creator._id.toString() === user._id) {
      const deleteAttachment = await Issue.findOneAndUpdate(id, {
        $pull: {
          attachments: attachment
        }
      }, {
        new: true
      });
      res.status(200).json(deleteAttachment);
      return;
    } else {
      res.status(401).end("An attachment can only be deleted by it's uploader");
      return;
    }
  } catch (error) {
    next(error);
  }
});

// Delete Issue
router.get('/:id/delete', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  const user = req.session.currentUser;
  try {
    // TODO: Check for a better way to Find and then Update if the condition is true
    const issue = await Issue.findById(id);
    // Check if the current user is the issue's creator
    if (issue.creator._id.toString() === user._id) {
      const deleteIssue = await Issue.findByIdAndUpdate(id, {
        $set: {
          deleted: true
        }
      }, {
        new: true
      });
      res.status(200).json(deleteIssue);
      return;
    } else {
      res.status(401).end("An issue can only be deleted by it's creator");
      return;
    }
  } catch (error) {
    next(error);
  }
});

// Get Issue details TODO: Review autopopulate plugin docs
router.get('/:id', isLoggedIn(), async (req, res, next) => {
  const {
    id
  } = req.params;
  try {
    const issue = await Issue.findById(id, {
        deleted: false
      }).lean()
      .populate({
        path: 'project',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'creator',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'assignedTo',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'followers',
        match: {
          deleted: false
        }
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'user'
        },
        match: {
          deleted: false
        }
      });
    issue.relativeDate = moment(issue.createdAt).fromNow();
    issue.creationDate = moment(issue.createdAt).format('YYYY-DD-MM');
    issue.comments.forEach(comment => {
      comment.relativeDate = moment(comment.createdAt).fromNow();
      comment.creationDate = moment(comment.createdAt).format('YYYY-DD-MM');
    });
    res.status(200).json(issue);
    return;
  } catch (error) {
    next(error);
  }
});

module.exports = router;
