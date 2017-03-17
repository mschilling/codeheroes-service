'use strict';

function parseUser(commit) {
  if(!(commit.author || {} ).username)
  console.log('author', commit.author, ' <--> ', 'comitter', commit.committer);
}

class GitHubHelper {
  static parseCommits(payload) {
    if(!payload || !payload.commits) return [];

    const commits = [];
    payload.commits.forEach( (commit) => {
      // console.log(commit.author);
      parseUser(commit);
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
