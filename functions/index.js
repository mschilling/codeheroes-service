'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const github = require('./github');
const jira = require('./jira');
const user = require('./user');

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

module.exports = {
    authNewUser: authNewUser,
    onGitHubPushEvent: onGitHubPushEvent,
    githubPayloadToFeed: githubPayloadToFeed,
    jiraPayloadToFeed: jiraPayloadToFeed
};
