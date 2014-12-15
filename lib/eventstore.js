'use strict';

var moduleName    = 'eventstore';
var moduleVersion = '0.0.1';

var async         = require ('async');
var path          = require ('path');
var xLog          = require ('xcraft-core-log') (moduleName);
var xCraft        = require ('xcraft-core-etc').load('xcraft');
var Datastore     = require ('nedb');
var db            = null;
var nextEventId   = 1;

function getLastEventId (callback) {
  db.count({}, function (err, count) {
    logErrorIfNeeded (err);
    nextEventId = count
    callback (err);
  });
};

function createIndexIfNeeded (callback) {
  db.ensureIndex({ fieldName: 'eventId', unique: true }, function (err) {
    logErrorIfNeeded (err);
    callback (err);
  });
};

function logErrorIfNeeded (err) {
  if (err) {
    xLog.err (JSON.stringify (err));
  }
};

function EventStore (config) {
  var dbDatafile = path.join (xCraft.xcraftRoot, config.dbfile);
  xLog.info ('opening eventstore datafile: ' + dbDatafile);
  db = new Datastore ({ filename: dbDatafile, autoload: true });

  async.series([
    function(callback){
        // do some stuff ...
        createIndexIfNeeded (callback);
    },
    function(callback){
        // do some more stuff ...
        getLastEventId (callback);
    }
  ],
  // optional callback
  function(err, results){
    logErrorIfNeeded (err);
  });
};

EventStore.prototype.insert = function(id, event) {
  if (id && event) {
    var document = {
      eventId: nextEventId,
      userId: event.userId,
      activityId: event.activityId,
      event: event.data,
      version: moduleVersion
    };

    db.insert(document, function (err, newDoc) {
      logErrorIfNeeded (err);
      nextEventId++;
    });
  } else {
    xLog.err ('insert(id, event): a parameters is undefined');
  }
};

EventStore.prototype.findAll = function (userId) {
  var results;
  db.find({ userId: userId, version: moduleVersion }, function (err, docs) {
    logErrorIfNeeded (err);
    results = docs;
  });
  return results;
};

EventStore.prototype.findAllByToken = function (token) {
  var results;
  db.find({ 'event.token': token, version: moduleVersion }, function (err, docs) {
    logErrorIfNeeded (err);
    results = docs;
  });
  return results;
};

EventStore.prototype.findLastByActivity = function (userId, activityId) {
  var result = [];
  db.find ({
    userId: userId,
    activityId: activityId,
    version: moduleVersion
  }).sort ({eventId: 1}).exec (function (err, docs) {
    logErrorIfNeeded (err);
    //first result is the last
    results = docs[0];
  });
  return result;
};

module.exports = function (config) {
  return new EventStore (config);
}
