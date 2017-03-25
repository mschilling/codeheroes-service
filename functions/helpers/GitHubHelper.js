'use strict';

const githubEventTypes = require('../constants/github_event_types');

class GitHubHelper {
  static getEventType(payload) {
    if (!payload) return githubEventTypes.undefined;

    if (payload.pusher) {
      return githubEventTypes.push;
    } else if (payload.pull_request) {
      return githubEventTypes.pullRequest;
    } else if (payload.issue) {
      switch (payload.action) {
        case 'opened':
          return githubEventTypes.issueOpened;
        case 'closed':
          return githubEventTypes.issueClosed;
      }
      return githubEventTypes.issueUndefined;
    }
    return githubEventTypes.undefined;
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

    if (owner) {
      repo.owner = owner.name;
    }

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

      if(!commit.user) {
        const { pusher } = payload;
        if(pusher) {
          commit.user = pusher.name; // work-around for now
        }
      }
      commits.push(commit);
    });
    return commits.sort((a, b) => a > b ? 1 : -1);
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
