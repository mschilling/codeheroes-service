'use strict';

const moment = require('moment');
// const eventTypes = require('../constants/github_event_types');
const baseRef = 'metrics';

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

  const scoreData = {};
  scoreData.avatar = commit.repository.avatar;
  scoreData.name = commit.author.name;
  scoreData.message = commit.message;

    // if(scoreData) {
    //   value.repo = repo.fullName;
    //   if(!value.avatar) {
    //     value.avatar = repo.avatar;
    //   }
    // }


  const actions = [];

  actions.push(incrementScore(obj.ref.child(`${baseRef}/user/commits_per_day/${dayKey}/${userKey}`), scoreData, commit));
  actions.push(incrementScore(obj.ref.child(`${baseRef}/user/commits_per_week/${weekKey}/${userKey}`), scoreData, commit));
  actions.push(incrementScore(obj.ref.child(`${baseRef}/user/commits_per_month/${monthKey}/${userKey}`), scoreData, commit));

  return Promise.all(actions);
}

function incrementScore(scoreRef, scoreData, otherData) {
  return scoreRef.transaction(function(value) {
    if (!value) {
      value = { score: 0 };
    }
    value.score += 1;
    value.orderKey = (1 / value.score);
    value.lastUpdate = new Date().getTime();

    if(scoreData.name) value.name = scoreData.name;
    if(scoreData.avatar) value.avatar = scoreData.avatar;
    if(scoreData.message) value.message = scoreData.message;

    if(otherData) {
      value.meta = otherData;
    }

    return value;
  });
}

module.exports = Scores;
