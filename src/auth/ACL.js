var _ = require("underscore");

var createReadACL = function(user) {
  var userIDs = _.isArray(user) ? _.pluck(user, "objectId") : [user.objectId];
  var ACL = {};
  _.each(userIDs, function(userID) {
    if (!userID) return;
    ACL[userID] = { read: true };
  });

  ACL["role:Admin"] = { read: true };
  return ACL;
};
var createAdminACL = function() {
  var ACL = {};
  ACL["role:Admin"] = { read: true };
  return ACL;
};
var createWriteACL = function(user) {
  var userIDs = _.isArray(user) ? _.pluck(user, "objectId") : [user.objectId];
  var ACL = {};
  _.each(userIDs, function(userID) {
    if (!userID) return;
    ACL[userID] = { read: true, write: true };
  });

  ACL["role:Admin"] = { read: true };
  return ACL;
};

var ensureReadACL = function(user) {
  return function(item) {
    if (!item.ACL) return false;
    if (!item.ACL[user.objectId] || !item.ACL[user.objectId].read) return false;
    return true;
  };
};

var ensureWriteACL = function(user) {
  return function(item) {
    if (!item.ACL) return false;
    if (!item.ACL[user.objectId] || !item.ACL[user.objectId].write)
      return false;
    return true;
  };
};

var createPublicReadACL = function() {
  return {
    "*": {
      read: true
    }
  };
};

var createPublicWriteACL = function() {
  return {
    "*": {
      read: true,
      write: true
    }
  };
};

module.exports = {
  createWriteACL: createWriteACL,
  createReadACL: createReadACL,
  ensureWriteACL: ensureWriteACL,
  ensureReadACL: ensureReadACL,
  createPublicReadACL: createPublicReadACL,
  createPublicWriteACL: createPublicWriteACL,
  createAdminACL: createAdminACL
};
