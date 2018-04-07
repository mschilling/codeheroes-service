'use strict';

const paths = require('./constants/firebase_paths');

function addHookToQueue(snap, context) {
  const ref = snap.ref.root;
  const args = {
    source: context.params.source,
    timestamp: (new Date()).toISOString()
  };

  const childPath = getChildPath(args.source);
  if (!childPath) {
    console.error('source is null');
    return;
  }
  return ref.child(childPath).child(context.params.pushId).set(args);
}

// generic function to handle hooks items from queue
function processHookFromQueue(snap, context) {
  // Only edit data when it is first created.
  if (snap.previous.exists()) {
    return;
  }
  // Exit when the data is deleted.
  if (!evt.data.exists()) {
    return;
  }

  const ref = snap.ref.root;
  const eventData = snap.val();
  const source = context.params.source;

  return ref.child('raw').child(source).child(snap.key).once('value')
    .then((snapshot) => {
      const data = Object.assign({}, snapshot.val());
      data._meta = eventData;
      return ref.child(paths.feedData).child(snapshot.key).set(data);
    }).then(() => snap.ref.remove())
    ;
}

function getChildPath(source) {
  if (!source) {
    console.error('source is null');
    return;
  }

  switch (source) {
    case 'github':
      return paths.githubQueue;
    case 'jira':
      return paths.jiraQueue;
    case 'jenkins':
      return paths.jenkinsQueue;
    case 'travis':
      return paths.travisQueue;
  }
  return;
}

module.exports = {
  addHookToQueue: addHookToQueue,
  processHookFromQueue: processHookFromQueue
};
