const createError = require('http-errors');

// Check if the user is logged in
exports.isLoggedIn = () => (req, res, next) => {
  (req.session.currentUser) ? next(): next(createError(401));
};

// Check if the user is not logged in
exports.isNotLoggedIn = () => (req, res, next) => {
  (!req.session.currentUser) ? next(): next(createError(403));
};
