'use strict';

class GitHubHelper {
  static parseCommits(payload) {
    if(!payload || !payload.commits) return [];

    const commits = [];
    payload.commits.forEach( (commit) => {
      console.log(commit.author);
      commits.push({
        id: commit.id,
        // treeId: commit.tree_id,
        timestamp: commit.timestamp,
        distinct: commit.distinct,
        repo: payload.repository.name,
        message: commit.message,
        user: (
          ( commit.author && commit.author.username ) ? commit.author.username : (
              ( commit.committer & commit.committer.username ) ? commit.committer.username : (
                ( commit.author & commit.author.name ) ? commit.committer.username :
                'onbekend'
              )
            )
          )
      });
    });
    return commits;
  }
}

module.exports = GitHubHelper;

