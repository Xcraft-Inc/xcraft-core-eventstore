'use strict';

exports.getInstance = function () {
  var config = require ('xcraft-core-etc').load ('xcraft-core-eventstore');
  return require ('./lib/eventstore.js')(config);
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
