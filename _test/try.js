'use strict';

var es = require ('xcraft-core-eventstore');
var eventstore = es.getInstance ();

/* Work in progress playground*/
eventstore.use (function () {
  var testEvent = {
    payload: 'test.test.test',
    someData: ['a', 'b', 'c']
  };

  eventstore.findAll (function (err, docs) {
    console.log (err);
    console.log ('documents:' + docs.length);
    es.persist ('test.topic', testEvent);
  });
});
