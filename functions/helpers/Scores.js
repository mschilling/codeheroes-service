'use strict';

const moment = require('moment');
// const eventTypes = require('../constants/github_event_types');
const baseRef = 'scores';

class Scores {
  constructor( firebaseRef ) {
    this.ref = firebaseRef;

    initializeObject(this);
  }

  get repository() {
    return this._repository;
  }

  onCommit(commit) {
    return onCommit(this, commit);
  }

}

function initializeObject(obj) {
  // set obj ref
}

function onCommit( obj, commit ) {
  const timestamp = moment(commit.timestamp);
  const dayKey = timestamp.format('YYYYMMDD');
  const weekKey = timestamp.format('YYYY') + ('0' + timestamp.isoWeek()).slice(-2);
  const monthKey = timestamp.format('YYYYMM');

  const userKey = commit.user;

  const eventData = {};
  eventData.avatar = commit.repo.avatar;
  eventData.name = commit.name;
  eventData.message = commit.message;

    // if(scoreData) {
    //   value.repo = repo.fullName;
    //   if(!value.avatar) {
    //     value.avatar = repo.avatar;
    //   }
    // }


  const actions = [];

  actions.push(incrementScore(obj.ref.child(`scores/user/commits_per_day/${dayKey}/${userKey}`), commit));
  actions.push(incrementScore(obj.ref.child(`scores/user/commits_per_week/${weekKey}/${userKey}`), commit));
  actions.push(incrementScore(obj.ref.child(`scores/user/commits_per_month/${monthKey}/${userKey}`), commit));

  return Promise.all(actions);
}

function incrementScore(scoreRef, meta) {
  return scoreRef.transaction(function(value) {
    if (!value) {
      value = { score: 0 };
    }
    value.score += 1;
    value.orderKey = (1 / value.score);
    value.lastUpdate = new Date().getTime();

    if(meta) {
      value.meta = meta;
    }

    return value;
  });
}

module.exports = Scores;
