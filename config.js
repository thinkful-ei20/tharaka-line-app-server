'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/line-app';//put DATABASE_URL in heroku
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/line-app';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';




