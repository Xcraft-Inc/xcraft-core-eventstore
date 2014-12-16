'use strict';
var EventStore = require ('./lib/eventstore.js');
var es;

exports.getInstance = function () {
  if(es) {
    return es;
  }
  var config = require ('xcraft-core-etc').load ('xcraft-core-eventstore');
  es = new EventStore (config);
  return es;
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
