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
    nextEventId = count;
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

EventStore.prototype.insert = function (busToken, type, data, callback) {
  if (type) {
    var document = {
      eventId: nextEventId,
      event: type,
      data: data,
      busToken: busToken,
      version: moduleVersion
    };
    db.insert (document, callback);
    nextEventId++;
  } else {
    xLog.warn ('malformed xcraft-event');
  }
};

EventStore.prototype.findAll = function (callback) {
  db.find ({version: moduleVersion}, callback);
};

EventStore.prototype.findAllByToken = function (token, callback) {
  db.find ({busToken: token, version: moduleVersion}, callback);
};

EventStore.prototype.findLastByQuery = function (key, value, callback) {
  var query     = {};
  query[key]    = value;
  query.version = moduleVersion;
  db.find (query).sort ({eventId: 1}).exec (callback);
};

module.exports = EventStore;
