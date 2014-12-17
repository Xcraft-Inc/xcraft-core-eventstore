'use strict';

var moduleName    = 'eventstore';
var xLog          = require ('xcraft-core-log') (moduleName);
var EventStore    = require ('./lib/eventstore.js');
var es;

exports.getInstance = function () {
  if (es) {
    return es;
  }

  var config = require ('xcraft-core-etc').load ('xcraft-core-eventstore');
  es = new EventStore (config);
  return es;
};

exports.persist= function (topic, msg) {
  if (es) {
    /* Note about EventStore and 'connected' topic */
    /* we discard connected message for two reason: */
    /* 1. eventstore don't support field name containing '.' */
    /* 2. this topic annonce all commands, and has no business value */
    if (msg && topic !== 'connected') {
      es.insert (msg.token, topic, msg.data, function (err) {
        if (err) {
          xLog.err (err);
        }
      });
    } else {
      es.insert (msg.token, topic, null , function (err) {
        if (err) {
          xLog.err (err);
        }
      });
    }
  } else {
    xLog.err ('not ready to persist');
  }
};

/**
 * Retrieve the inquirer definition for xcraft-core-eventstore
 */
exports.xcraftConfig = [{
  type: 'input',
  name: 'dbfile',
  message: 'EventStore datafile path:',
  default: './var/xcraft-core-eventstore/events.nedb'
}];
