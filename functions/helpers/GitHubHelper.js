'use strict';

class GitHubHelper {
  static parseCommits(payload) {
    if(!payload || !payload.commits) return [];

    const commits = [];
    payload.commits.forEach( (commit) => {
      commits.push({
        id: commit.id,
        // treeId: commit.tree_id,
        timestamp: commit.timestamp,
        repo: payload.repository.name,
        message: commit.message,
        user: ( (commit.author && commit.author.username) ? commit.author.username :
          ( (commit.committer & commit.committer.username) ? commit.committer.username :
          'unknown' ) )
      });
    });
    return commits;
  }
}

module.exports = GitHubHelper;

