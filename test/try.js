'use strict';

var es = require ('xcraft-core-eventstore').getInstance();

var testEvent = {
  userId: 0,
  activityId: 99,
  data: {
    payload: 'test.test.test',
    someData: ['a','b','c']
  }
};


for (var i=0;i<1000;i++) {
  es.insert (testEvent);
}
