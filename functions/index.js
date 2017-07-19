'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const github = require('./github');
const jira = require('./jira');
const user = require('./user');
const queue = require('./queue');
const vision = require('./assistant_vision');

// Firebase Auth handlers
const authNewUser = functions.auth.user().onCreate(user.createUser);

// Firebase Database handlers
const onGitHubPushEvent = functions.database.ref('/raw/github/{pushId}')
  .onCreate(github.onGitHubPushEvent);

// Process GitHub raw data into feed entry
const githubPayloadToFeed = functions.database.ref('/raw/github/{pushId}')
  .onCreate(github.processGitHubPayload);

// Process JIRA raw data into feed entry
const jiraPayloadToFeed = functions.database.ref('/raw/jira/{pushId}')
  .onCreate(jira.processJiraPayload);

// Add each incoming webhook to queue for further processing
const HookToQueue = functions.database.ref('/raw/{source}/{pushId}')
  .onCreate(queue.addHookToQueue);

// // 1st process of queued hooks items
// const ProcessHooksFromQueue = functions.database.ref('/queues/hooks/{source}/{pushId}')
//   .onWrite(queue.processHookFromQueue);

const assistant = functions.https
  .onRequest(vision.webhook);

module.exports = {
    authNewUser: authNewUser,
    HookToQueue: HookToQueue,
    onGitHubPushEvent: onGitHubPushEvent,
    githubPayloadToFeed: githubPayloadToFeed,
    jiraPayloadToFeed: jiraPayloadToFeed,
    assistant: assistant
    // ProcessHooksFromQueue: ProcessHooksFromQueue
};
