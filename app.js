require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const issuesRouter = require('./routes/issues');
const projectsRouter = require('./routes/projects');
const chartsRouter = require('./routes/charts');

// Open database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE
  })
  .then(x => {
    console.log(`Connected to MongoDB! Database name: '${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Allow frontend access to API (CORS)
app.use(
  cors({
    credentials: true,
    origin: [process.env.PUBLIC_DOMAIN]
  })
);

// Session middleware
app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 // 1 day
    }),
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/charts', chartsRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Respond with error message
  res.status(err.status).json(err.message);
});

module.exports = app;
