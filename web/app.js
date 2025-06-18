// app.js  ── Next Metal MVP (2025)
require('dotenv').config();

const path            = require('path');
const express         = require('express');
const session         = require('express-session');
const passport        = require('passport');
const PgPool          = require('pg').Pool;
const PgSession       = require('connect-pg-simple')(session);
const LocalStrategy   = require('passport-local').Strategy;
const bcrypt          = require('bcryptjs');

const User            = require('./models/user');
const routes          = require('./routes/index');
const authRoutes      = require('./routes/auth');
const pagesRoutes     = require('./routes/pages');
const apiRoutes       = require('./routes/api');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

/*───────────────────────────────────────────────────────────
  1.  DATABASE POOL  (shared everywhere)
───────────────────────────────────────────────────────────*/
const pool = new PgPool({
  connectionString: process.env.DATABASE_URL + '?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

/* 2.  CORE MIDDLEWARE */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    store: new PgSession({
      pool,                     // reuse pg Pool
      schemaName: 'nextmetal',  // <<< important: session table lives here
      tableName: 'session',     // default, but explicit is nice
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'nextmetal-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,      // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

/* 3.  PASSPORT LOCAL STRATEGY */
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await User.findByEmail(email.trim().toLowerCase());
        if (!(await bcrypt.compare(password, user.password_hash))) {
          return done(null, false, { message: 'Incorrect credentials' });
        }
        return done(null, user);
      } catch (err) {
        // treat “not found” as bad credentials, everything else as error
        if (/User not found/.test(err.message)) {
          return done(null, false, { message: 'Incorrect credentials' });
        }
        return done(err);
      }
    }
  )
);

passport.serializeUser((u, cb) => cb(null, u.id));
passport.deserializeUser(async (id, cb) => {
  try   { cb(null, await User.findOne(id)); }
  catch (e) { cb(e); }
});

app.use(passport.initialize());
app.use(passport.session());

/* 4.  LOCALS  (user available to every EJS view) */
app.use((req, res, next) => {
  res.locals.user = req.user ?? null;
  next();
});

/* 5.  VIEW ENGINE / STATIC */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/* 6.  REMEMBER "return to" FOR PROTECTED PAGES */
app.use((req, _res, next) => {
  const skip =
    req.path.startsWith('/members') ||
    req.path.startsWith('/auth')    ||
    req.xhr ||
    !req.accepts('html');

  if (!skip && !req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});

/* 7.  ROUTES */
app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/', pagesRoutes);
app.use('/api', apiRoutes);
app.use('/dashboard', dashboardRoutes);

/* 8.  ERROR HANDLERS */
app.use((req, res) =>
  res.status(404).render('404', { title: 'Page Not Found' })
);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error' });
});

module.exports = app;