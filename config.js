'use strict';

/**
 * Retrieve the inquirer definition for xcraft-core-eventstore
 */
module.exports = [{
  type: 'confirm',
  name: 'enable',
  message: 'enable the event store',
  default: false
}, {
  type: 'input',
  name: 'dbfile',
  message: 'EventStore datafile path:',
  default: './var/xcraft-core-eventstore/events.nedb'
}];
