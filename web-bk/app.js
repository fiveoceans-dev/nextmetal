// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const { Pool } = require('pg');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = require('./models/user');
const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Passport Setup
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findByEmail(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Middleware to make user available in templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Remember the return URL
app.use((req, res, next) => {
  const skip =
    req.path.startsWith('/members') ||
    req.path.startsWith('/auth');

  if (
    !req.isAuthenticated?.() &&
    req.method === 'GET' &&
    req.accepts('html') &&
    !req.xhr &&
    !skip
  ) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});

// Import and use routes
const authRoutes = require('./routes/auth');
const routes = require('./routes/index');
const articleRoutes = require('./routes/articles');
const pagesRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);
app.use('/', pagesRoutes);
app.use('/api', apiRoutes);

// 404 Error Handling
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// General error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error' });
});

module.exports = app;
