'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const github = require('./github');
const jira = require('./jira');
const user = require('./user');
const queue = require('./queue');

// Firebase Auth handlers
const authNewUser = functions.auth.user().onCreate(user.createUser);

// Firebase Database handlers
const onGitHubPushEvent = functions.database.ref('/raw/github/{pushId}')
  .onWrite(github.onGitHubPushEvent);

// Process GitHub raw data into feed entry
const githubPayloadToFeed = functions.database.ref('/raw/github/{pushId}')
  .onWrite(github.processGitHubPayload);

// Process JIRA raw data into feed entry
const jiraPayloadToFeed = functions.database.ref('/raw/jira/{pushId}')
  .onWrite(jira.processJiraPayload);

const ProcessPayloads = functions.database.ref('/raw/{source}/{pushId}')
  .onWrite((evt) => {
    const ref = evt.data.adminRef.root;
    const data = evt.data.val();
    data._source = evt.params.source;
    data._timestamp = (new Date()).toISOString();
    return ref.child('echo/events').child(evt.params.pushId).set(data);
  });

// Add each incoming webhook to queue for further processing
const HookToQueue = functions.database.ref('/raw/{source}/{pushId}')
  .onWrite(queue.addHookToQueue);

// 1st process of queued hooks items
const ProcessHooksFromQueue = functions.database.ref('/queues/{hook}/{pushId}')
  .onWrite(queue.processHookFromQueue);

module.exports = {
    authNewUser: authNewUser,
    ProcessPayloads: ProcessPayloads,
    HookToQueue: HookToQueue,
    onGitHubPushEvent: onGitHubPushEvent,
    githubPayloadToFeed: githubPayloadToFeed,
    jiraPayloadToFeed: jiraPayloadToFeed,
    ProcessHooksFromQueue: ProcessHooksFromQueue
};
