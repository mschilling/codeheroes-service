'use strict';

require('dotenv').config({ silent: true });
const config = require('../config');
const moment = require('moment');

const firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: config.firebase.serviceAccount,
  databaseURL: config.firebase.databaseURL
});

const ref = firebase.database().ref();
const REF_DASHBOARD_VIEW = 'views/dashboard';
const REF_GITHUB_RAW = 'raw/github';
const REF_JIRA_RAW = 'raw/jira';

clearData()
  .then( () => processJiraIssues())
  .then( () => console.log('Ready ;-)'));

function clearData() {
  return ref.child(REF_DASHBOARD_VIEW).remove();
}

function addToView(obj) {
  return ref.child(REF_DASHBOARD_VIEW).push(obj);
}

function processJiraIssues() {
  return ref.child(REF_JIRA_RAW).orderByChild('webhookEvent').equalTo('jira:issue_created')
                                .limitToLast(20).once('value').then((s) => {
    return s.forEach((snapshot) => {
      processJiraIssue(snapshot);
    });
  }).then( () => {
    return ref.child(REF_JIRA_RAW).orderByChild('webhookEvent').equalTo('jira:issue_updated')
                                    .limitToLast(20).once('value').then((s) => {
        return s.forEach((snapshot) => {
          processJiraIssue(snapshot);
        });
      });
  });
}

function processJiraIssue(snapshot) {
  const o = snapshot.val();
  let item = {
    timestamp: o.timestamp,
    source: 'jira',
    event: o.issue_event_type_name,
    user: {
      name: o.user.name,
      displayName: o.user.displayName,
      avatar: o.user.avatarUrls['48x48']
    },
    project: {
      name: o.issue.fields.project.name,
      avatar: o.issue.fields.project.avatarUrls['48x48']
    },
    issue: {
      summary: o.issue.fields.summary,
      eventTypeName: o.issue_event_type_name
    },
    description: o.issue.fields.summary
  };

  if(o.issue.fields.description) {
    item.issue.description = o.issue.fields.description;
  };

  console.log(o);
  return addToView(item);
}

// function onGitHubPayloadAdded(snapshot) {
//   processPayloadFromGitHub(snapshot.val());
// }

