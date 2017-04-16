'use strict';

class Leaderboard {

  constructor(items) {
    initializeObject(this, items);
  }

  addScore(score) {
    addScore(this, score);
  }

  addScores(scores) {
    (scores || []).forEach( (score) => {
      addScore(this, score);
    });
  }

  get items() {
    return this._items;
  }
}

function initializeObject( leaderboard, items ) {
    leaderboard._items = items || [];
}

function addScore(leaderboard, score) {
  let item = (leaderboard.items.filter( p => p.key == score.key) || [])[0];
  if(!item) {
    item = newEntry(score.key);
    leaderboard.items.push(item);
  }

  item.score += score.points;
  item.count += 1;

  if(score.counters.pushes) {
    item.count_pushes += score.counters.pushes;
  }

  if(score.counters.commits) {
    item.count_commits += score.counters.commits;
  }

  if(score.counters.pull_requests) {
    item.count_pull_requests += score.counters.pull_requests;
  }

  if(score.counters.issues_closed) {
    item.count_issues_closed += score.counters.issues_closed;
  }

  if(score.counters.issues_opened) {
    item.count_issues_opened += score.counters.issues_opened;
  }

  sort(leaderboard);
}

function newEntry(key) {
  return {
    key: key,
    position: 0,
    score: 0,
    count: 0,
    count_commits: 0,
    count_pushes: 0,
    count_commits: 0,
    count_pull_requests: 0,
    count_issues_opened: 0,
    count_issues_closed: 0
  };
}

function sort(leaderboard) {
  leaderboard.items.sort( (a, b) => a.score < b.score ? 1 : -1);

  leaderboard.items.forEach( (item, index) => {
    if(item.position_prev !== (index + 1)) {
      if( (index+1) < item.position_prev) {
        item.dir = 'asc';
      } else {
        item.dir = 'desc';
      }
    }

    item.position_prev = item.position;
    item.position = index + 1;
  });
}

module.exports = Leaderboard;
