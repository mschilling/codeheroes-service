'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const github = require('./github');
const user = require('./user');

// Firebase Auth handlers
const authNewUser = functions.auth.user().onCreate(user.createUser);

// Firebase Database handlers
const onGitHubPushEvent = functions.database.ref('/raw/github/{pushId}')
  .onWrite(github.onGitHubPushEvent);

module.exports = {
    authNewUser: authNewUser,
    onGitHubPushEvent: onGitHubPushEvent
};
