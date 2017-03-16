const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const gh = require('./helpers/GitHubHelper');

exports.processGitHubInput = functions.database.ref('/raw/github/{pushId}')
  .onWrite(event => {
    const commits = gh.parseCommits(event.data.val());
    return commits.forEach((commit) => {
      event.data.ref.root.child('/on/commit').push(commit);
    });
  });

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
// exports.makeUppercase = functions.database.ref('/cloud_test/{pushId}/original')
//   .onWrite(event => {
//     // Grab the current value of what was written to the Realtime Database.
//     const original = event.data.val();
//     console.log('Uppercasing', event.params.pushId, original);
//     const uppercase = original.toUpperCase();
//     // You must return a Promise when performing asynchronous tasks inside a Functions such as
//     // writing to the Firebase Realtime Database.
//     // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
//     return event.data.ref.parent.child('uppercase').set(uppercase);
//   });

// exports.dummy = functions.database.ref('/raw/github/{pushId}')
//   .onWrite(event => {
//     const obj = event.data.val();
//     const targetRef = event.data.ref.root.child(`test/michael/${event.params.pushId}`);
//     console.log('processGitHubInput', event.params.pushId, obj);
//     obj.timestamp = new Date().toISOString();
//     return targetRef.set(obj);
//   });
