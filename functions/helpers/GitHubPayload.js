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

  get commits() {
    return this._commits || [];
  }

  get distinctCommits() {
    return this.commits.filter( p => p.distinct );
  }
}

function initializeObject( obj, payload ) {
    // Save raw payload
    obj._raw = payload;

    obj._eventType = parseEventType(payload);

    obj._repository = parseRepository(payload);

    obj._pusher = parsePusher(payload);

    obj._sender = parseSender(payload);

    obj._commits = parseCommits(payload);
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
  if(!payload.repository) return;

  const { name, full_name: fullName, organization, owner } = payload.repository;
  const repo = {
    name: name,
  };

  if (fullName) {
    repo.fullName = fullName;
  }

  repo.avatar = owner.avatar_url;

  if (organization) {
    repo.organization = organization;
  }

  // if (payload.organization) {
  //   repo.avatar = payload.organization.avatar_url;
  //   console.log(payload.organization.avatar_url);
  // }


  // if (owner) {
  //   repo.owner = {
  //     login: owner.login,
  //     name: owner.name,
  //     type: owner.type
  //   };
  // }

  return repo;
}

function parseCommits(payload) {
  if(!payload.commits) return [];

  const commits = [];
  const repo = parseRepository(payload);

  payload.commits.forEach(payloadCommit => {
    const commit = parseCommit(payloadCommit);
    commit.repository = repo;

    if(!commit.user) {
      const { pusher } = payload;
      if(pusher) {
        commit.user = pusher.name; // work-around for now
      }
    }
    commits.push(commit);
  });
  return commits.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);
}

function parseCommit(source) {
  const commit = {};
  const { id, timestamp, message, committer, author, distinct } = source;

  if (id) {
    commit.id = id;
  }

  if (timestamp) {
    commit.timestamp = timestamp;
  }

  if (author) {
    commit.author = author;
  }

  if (committer) {
    commit.committer = committer;
  }

  if (author && author.username) {
    commit.user = author.username;
  }

  if (message) {
    commit.message = message;
  }

  commit.distinct = !!(distinct);

  return commit;
}


module.exports = GitHubPayload;
