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
    console.log('GitHub payload', payload, github);
    let customHeader = {};

    switch (github.eventType) {
      case eventTypes.push:
        customHeader = { 'x-github-event': 'push' };

        // if(github.distinctCommits.length === 0) {
        //   console.log('Ignore Push', payload);
        //   return Promise.resolve(true);
        // }

        // for( var i = 0; i < (payload.commits || []).length; i++) {
        //   let item = payload.commits[i];
        //   if(!item.added) item.added = [];
        //   if(!item.removed) item.removed = [];
        //   if(!item.modified) item.modified = [];
        // }

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
