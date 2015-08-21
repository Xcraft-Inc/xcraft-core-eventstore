'use strict';

var moduleName    = 'eventstore';
var xLog          = require ('xcraft-core-log') (moduleName);
var busConfig     = require ('xcraft-core-etc').load ('xcraft-core-bus');
var EventStore    = require ('./lib/eventstore.js');
var axon          = require ('axon');
var subscriptions = axon.socket ('sub');
var es;

var persist = function (topic, msg) {
  if (es) {
    /* Note about EventStore and 'connected' topic */
    /* we discard connected message for two reason: */
    /* 1. eventstore don't support field name containing '.' */
    /* 2. this topic annonce all commands, and has no business value */
    if (msg && topic !== 'greathall::autoconnect.finished') {
      es.insert (msg.token, topic, msg.data, function (err) {
        if (err) {
          xLog.err (err);
        }
      });
    } else {
      es.insert (msg.token, topic, null, function (err) {
        if (err) {
          xLog.err (err);
        }
      });
    }
  } else {
    xLog.err ('not ready to persist');
  }
};

subscriptions.subscribe ('*');
subscriptions.on ('message', function (topic, msg) {
  if (topic !== 'greathall::heartbeat') {
    persist (topic, msg);
    if (topic === 'gameover') {
      subscriptions.close ();
    }
  }
});

exports.getInstance = function () {
  var config = require ('xcraft-core-etc').load ('xcraft-core-eventstore');

  if (!config.enable || es) {
    return es;
  }

  es = new EventStore (config);
  subscriptions.connect (parseInt (busConfig.notifierPort), busConfig.host);
  return es;
};
