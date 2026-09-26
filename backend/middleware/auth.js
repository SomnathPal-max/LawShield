const { auth } = require('express-oauth2-jwt-bearer');
const { store } = require('../services/dataStore');

// Safe fallback for demo simulator (since user wants Auth0 but might not have keys set up immediately)
const useAuth0 = process.env.AUTH0_ISSUER_BASE_URL && process.env.AUTH0_AUDIENCE;

const auth0Middleware = useAuth0 ? auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
}) : (req, res, next) => next();

const authenticate = (req, res, next) => {
  // If Auth0 isn't configured, bypass so the Simulator doesn't break
  if (!useAuth0) {
    console.warn('[Auth0] Missing Environment variables. Bypassing Auth0 validation for Demo Mode.');
    req.user = store.users[0]; // fallback demo user
    return next();
  }

  // Use Auth0 strict validation
  auth0Middleware(req, res, (err) => {
    if (err) return next(err);
    
    // Create a mock user object based on the Auth0 sub claim so controllers don't crash
    req.user = {
      _id: req.auth.payload.sub,
      role: req.auth.payload['https://lawshield.org/role'] || 'user',
      email: req.auth.payload['https://lawshield.org/email'] || '',
      name: 'Auth0 Verified User'
    };
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user ? req.user.role : 'unauthenticated'}' does not have permission.`
      });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };
