'use strict';
const jwt = require('jsonwebtoken');
const APP_SECRET = 'GraphQL-is-RaD!';

function getUserId(context) {
  const Authorization = context.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, APP_SECRET);
    return userId;
  }
  throw new Error('Not authenticated');
}

module.exports = {
  getUserId,
  APP_SECRET
};