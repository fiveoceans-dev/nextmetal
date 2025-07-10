// app.js
require('dotenv').config();

const path      = require('path');
const express   = require('express');
const session   = require('express-session');
const passport  = require('passport');
const PgPool    = require('pg').Pool;
const PgSession = require('connect-pg-simple')(session);
const LocalStrat= require('passport-local').Strategy;
const helmet    = require('helmet');
const morgan    = require('morgan');
const bcrypt    = require('bcryptjs');
const cookieParser = require('cookie-parser');

const User = require('./models/user');
const routes = require('./routes/index');
const pagesRoutes     = require('./routes/pages');
const { requireJwt } = require('./middleware/jwt');
const dashboardRoutes = require('./routes/dashboard');
const { html: authWeb, api: authApi } = require('./routes/auth');
const coreRoutes = require('./routes/core');
const app = express();


/* db pool (shared by connect-pg-simple) */
const pool = new PgPool({
  connectionString: `${process.env.DATABASE_URL}?sslmode=require`,
  ssl: { rejectUnauthorized: false }
});

/* trust proxy if behind nginx / caddy */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/* global hardening and logs */
app.use(helmet());
app.use(morgan('tiny'));
app.use(cookieParser());

/* body parsers */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* session store (schema = nextmetal) */
app.use(session({
  store: new PgSession({ pool, schemaName: 'nextmetal', tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'nextmetal-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

/* passport local → shared for HTML + JWT flows */
passport.use(new LocalStrat(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const u = await User.findByEmail(email.trim().toLowerCase());
      if (!(await bcrypt.compare(password, u.password_hash)))
        return done(null, false, { message: 'bad-creds' });
      return done(null, u);
    } catch (e) {
      if (/User not found/.test(e.message))
        return done(null, false, { message: 'bad-creds' });
      return done(e);
    }
  }
));
passport.serializeUser((u, cb) => cb(null, u.id));
passport.deserializeUser(async (id, cb) => {
  try { cb(null, await User.findOne(id)); }
  catch (e) { cb(e); }
});
app.use(passport.initialize());
app.use(passport.session());

/* make user available to all EJS templates */
app.use((req, res, next) => { res.locals.user = req.user ?? null; next(); });

/* view engine & static assets */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/* remember “return-to” for unauthenticated html GETs */
app.use((req, _res, next) => {
  const skip =  req.path.startsWith('/members') ||
                req.path.startsWith('/auth')    ||
                req.path.startsWith('/api')     ||
                req.xhr || !req.accepts('html');
  if (!skip && !req.isAuthenticated?.()) req.session.returnTo = req.originalUrl;
  next();
});

/* routes */
app.use('/',            routes);
app.use('/auth',        authWeb);
app.use('/api/auth',    authApi);
app.use('/api/core',    coreRoutes);
app.use('/api/v1', require('./routes/api.v1'));
app.use('/',            pagesRoutes);
app.use('/dashboard', requireJwt, dashboardRoutes);

/* fallbacks */
app.use((req, res) =>
  res.status(404).render('404', { title: 'Page Not Found' })
);
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error' });
});

module.exports = app;

