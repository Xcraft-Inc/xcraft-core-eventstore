'use strict';

var es = require ('xcraft-core-eventstore').getInstance();
var testEvent = {
  userId: 0,
  activityId: 99,
  data: {
    payload: 'test.test.test',
    someData: ['a', 'b', 'c']
  }
};

es.use (function () {
  es.findAll (0, function (err, docs) {
    console.log ('documents:' + docs.length);
    es.insert (testEvent, function () {
      es.findAll (0, function (err, docs) {
        console.log ('documents:' + docs.length);
      });
    });
  });
});
