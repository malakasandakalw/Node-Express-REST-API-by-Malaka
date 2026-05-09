require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/express_api',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_dev_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};

module.exports = config;
