'use strict';

var moduleName    = 'eventstore';
var moduleVersion = '0.0.1';

var async         = require ('async');
var path          = require ('path');
var xLog          = require ('xcraft-core-log') (moduleName);
var xCraft        = require ('xcraft-core-etc').load ('xcraft');
var Datastore     = require ('nedb');
var db            = null;
var config        = null;
var nextEventId   = null;


function logErrorIfNeeded (err) {
  if (err) {
    xLog.err (JSON.stringify (err));
  }
}

function loadDatabaseIfNeeded (config, callback) {
  if (db !== null) {
    callback ();
    return;
  }

  var dbDatafile = path.join (xCraft.xcraftRoot, config.dbfile);
  xLog.info ('loading datafile: ' + dbDatafile);
  db = new Datastore ({filename: dbDatafile});
  db.loadDatabase (function (err) {
    logErrorIfNeeded (err);
    xLog.info ('loaded');
    callback ();
  });
}

function setLastEventIdIfNeeded (callback) {
  if (nextEventId !== null) {
    callback ();
    return;
  }

  db.count ({}, function (err, count) {
    logErrorIfNeeded (err);
    nextEventId = count + 1;
    callback (err);
  });
}

function createIndexIfNeeded (callback) {
  db.ensureIndex ({fieldName: 'eventId', unique: true}, function (err) {
    logErrorIfNeeded (err);
    callback (err);
  });
}

function EventStore (conf) {
  config = conf;
}

EventStore.prototype.use = function (callback) {
  async.series ([
    function (callback) {
      loadDatabaseIfNeeded (config, callback);
    },
    function (callback) {
      createIndexIfNeeded (callback);
    },
    function (callback) {
      setLastEventIdIfNeeded (callback);
    }
  ], function (err) {
    logErrorIfNeeded (err);
    callback ();
  });
};

EventStore.prototype.insert = function (event, callback) {
  if (event) {
    var document = {
      eventId: nextEventId,
      userId: event.userId,
      activityId: event.activityId,
      event: event.data,
      version: moduleVersion
    };

    db.insert (document, callback);
    nextEventId++;
  } else {
    xLog.warn ('insert(event): event is undefined');
  }
};

EventStore.prototype.findAll = function (userId, callback) {
  db.find ({userId: userId, version: moduleVersion}, callback);
};

EventStore.prototype.findAllByToken = function (token) {
  var results;

  db.find ({'event.token': token, version: moduleVersion}, function (err, docs) {
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
    // first result is the last
    result = docs[0];
  });

  return result;
};

module.exports = EventStore;
