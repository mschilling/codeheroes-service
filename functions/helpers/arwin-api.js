'use strict';

// require('dotenv/config');

const eventTypes = require('../constants/github_event_types');

const axios = require('axios');
const BASE_URL = 'http://35.233.33.90:8080/webhook';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

class ArwinApi {
  pushGithubPayload(payload, github) {
    if(payload || github) {
      console.log('ArwinApi disabled', payload, github);
      return;
    }
    console.log('GitHub payload', payload, github);
    let customHeader = {};

    switch (github.eventType) {
      case eventTypes.push:
        customHeader = { 'x-github-event': 'push' };
        break;
      case eventTypes.pullRequestOpened:
      case eventTypes.pullRequestClosed:
        customHeader = { 'x-github-event': 'pull_request' };
        break;
      default:
        console.log('Unsupported eventType: ' + github.eventType, github.repository);
        console.dir(github, {depth:4, colors: true});
        return Promise.resolve(false);
    }

    return client.post('', payload, {
      headers: customHeader
    }).catch( (error) => {
      console.log('error', error);
    });
  }
}

module.exports = ArwinApi;
