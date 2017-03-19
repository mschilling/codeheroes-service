'use strict';

class GitHubHelper {
  static parseCommits(payload) {
    if(!payload || !payload.commits) return [];

    const commits = [];
    payload.commits.forEach( (commit) => {
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

      if(author.name) entry.author_name = author.name;
      if(author.username) entry.author_username = author.username;
      if(author.email) entry.author_email = author.email;

      if(committer.name) entry.committer_name = committer.name;
      if(committer.username) entry.committer_username = committer.username;
      if(committer.email) entry.committer_email = committer.email;

      commits.push(entry);
    });
    return commits;
  }

  static parsePush(payload) {
    if(!payload || !payload.pusher) return;

    const push = {};
    push.timestamp = new Date().toISOString();
    push.user = (payload.pusher || {}).name;
    push.repo = payload.repository.name;
    push.ref = payload.ref;
    push.commits_count = (payload.commits || []).length;
    return push;
  }
}

module.exports = GitHubHelper;
