'use strict';

const githubEventTypes = require('../constants/github_event_types');

class GitHubHelper {
  static getEventType(payload) {
    if (!payload) return githubEventTypes.undefined;

    if (payload.pusher) {
      return githubEventTypes.push;
    } else if (payload.pull_request) {
      return githubEventTypes.pullRequest;
    }
    return githubEventTypes.undefined;
  }
  static parseCommits(payload) {
    if (!payload || !payload.commits) return [];

    const commits = [];
    payload.commits.forEach((commit) => {
      const author = commit.author || {};
      const committer = commit.committer || {};

      const entry = {
        id: commit.id,
        // treeId: commit.tree_id,
        timestamp: commit.timestamp,
        distinct: commit.distinct,
        repo: payload.repository.name,
        message: commit.message,
      };

      if (author.name) entry.author_name = author.name;
      if (author.username) entry.author_username = author.username;
      if (author.email) entry.author_email = author.email;

      if (committer.name) entry.committer_name = committer.name;
      if (committer.username) entry.committer_username = committer.username;
      if (committer.email) entry.committer_email = committer.email;

      commits.push(entry);
    });
    return commits;
  }

  static parsePush(payload) {
    if (!payload || !payload.pusher) return;

    const push = {};
    push.timestamp = new Date().toISOString();
    push.user = (payload.pusher || {}).name;
    push.repo = payload.repository.name;
    push.ref = payload.ref;
    push.commits_count = (payload.commits || []).length;
    return push;
  }

  static parseRepoFromPayload(payload) {
    const { name, organization } = payload.repository;
    const repo = {
      name: name,
      organisation: organization
    };

    return repo;
  }

  static parseCommitsFromPayload(payload) {
    const commits = [];
    const rawCommits = payload.commits || [];
    const repo = GitHubHelper.parseRepoFromPayload(payload);

    rawCommits.forEach(item => {
      const commit = GitHubHelper.parseCommit(item);
      if (repo) {
        commit.repo = repo;
      }
      commits.push(commit);
    });
    return commits.sort( (a,b) => a > b ? 1 : -1);
  }

  static parseCommit(source) {
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

    if (distinct) {
      commit.distinct = distinct;
    }

    return commit;
  }


}

module.exports = GitHubHelper;
