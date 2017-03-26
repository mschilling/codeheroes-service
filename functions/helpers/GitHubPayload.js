'use strict';

const eventTypes = require('../constants/github_event_types');

class GitHubPayload {

  constructor( payload ) {
    initializeObject(this, payload);
  }

  get eventType() {
    return this._eventType;
  }

  get repository() {
    return this._repository;
  }

}

function initializeObject( obj, payload ) {
    // Save raw payload
    obj._raw = payload;

    obj._eventType = parseEventType(payload);

    obj._repository = parseRepository(payload);

    obj._pusher = parsePusher(payload);

    obj._sender = parseSender(payload);

}

function parseEventType( payload ) {
  if (!payload) return eventTypes.undefined;

  if (payload.pusher) {
    return eventTypes.push;
  } else if (payload.pull_request) {
    return eventTypes.pullRequest;
  } else if (payload.issue) {
    switch (payload.action) {
      case 'opened':
        return eventTypes.issueOpened;
      case 'closed':
        return eventTypes.issueClosed;
    }
    return eventTypes.issueUndefined;
  }
  return eventTypes.undefined;
}

function parsePusher( payload ) {
  const { pusher } = payload;
  if(!pusher)
    return;
  return pusher;
}

function parseSender( payload ) {
  const { sender } = payload;
  if(!sender)
    return;
  return sender;
}

function parseRepository(payload) {
  const { name, full_name: fullName, organization, owner } = payload.repository;
  const repo = {
    name: name,
  };

  if (organization) {
    repo.organization = organization;
  } else if (owner) {
    repo.avatar = owner.avatar_url;
  }

  if (payload.organization) {
    repo.avatar = payload.organization.avatar_url;
  }

  if (fullName) {
    repo.fullName = fullName;
  }

  // if (owner) {
  //   repo.owner = {
  //     login: owner.login,
  //     name: owner.name,
  //     type: owner.type
  //   };
  // }

  return repo;
}

module.exports = GitHubPayload;
