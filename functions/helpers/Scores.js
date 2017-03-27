'use strict';

const moment = require('moment');
const fh = require('../helpers/FirebaseHelper');
// const eventTypes = require('../constants/github_event_types');
const baseRef = 'metrics';

class Scores {
  constructor(firebaseRef) {
    this.ref = firebaseRef;
    fh.initialize(firebaseRef);
  }

  get repository() {
    return this._repository;
  }

  onCommit(commit) {
    return onCommit(this, commit);
  }

}

function onCommit(obj, commit) {

  return fh.getGitHubUser(commit.user).then((user) => {
    if (!user) {
      return Promise.resolve();
    }

    const timestamp = moment(commit.timestamp);
    const dayKey = timestamp.format('YYYYMMDD');
    const weekKey = timestamp.format('YYYY') + ('0' + timestamp.isoWeek()).slice(-2);
    const monthKey = timestamp.format('YYYYMM');

    const userKey = user.username;
    const avatarUrl = `https://github.com/${userKey}.png?size=460`;

    const scoreData = {};
    scoreData.avatar = avatarUrl;
    scoreData.name = user.name;
    scoreData.message = commit.message;

    const actions = [];

    actions.push(incrementScore(obj.ref.child(`${baseRef}/user/commits_per_day/${dayKey}/${userKey}`), scoreData, commit));
    actions.push(incrementScore(obj.ref.child(`${baseRef}/user/commits_per_week/${weekKey}/${userKey}`), scoreData, commit));
    actions.push(incrementScore(obj.ref.child(`${baseRef}/user/commits_per_month/${monthKey}/${userKey}`), scoreData, commit));

    const projectKey = fh.encodeAsFirebaseKey(commit.repository.fullName);

    const repoScoreData = {};
    repoScoreData.avatar = commit.repository.avatar;
    repoScoreData.name = commit.repository.fullName;
    repoScoreData.message = commit.message;

    // const repoMeta = gh.parseRepoFromPayload()
    actions.push(incrementScore(obj.ref.child(`${baseRef}/project/commits_per_day/${dayKey}/${projectKey}`), repoScoreData, commit));
    actions.push(incrementScore(obj.ref.child(`${baseRef}/project/commits_per_week/${weekKey}/${projectKey}`), repoScoreData, commit));
    actions.push(incrementScore(obj.ref.child(`${baseRef}/project/commits_per_month/${monthKey}/${projectKey})`), repoScoreData, commit));


    return Promise.all(actions);
  });
}

function incrementScore(scoreRef, scoreData, otherData) {
  return scoreRef.transaction(function (value) {
    if (!value) {
      value = { score: 0 };
    }
    value.score += 1;
    value.orderKey = (1 / value.score);
    value.lastUpdate = new Date().getTime();

    if (scoreData.name) value.name = scoreData.name;
    if (scoreData.avatar) value.avatar = scoreData.avatar;
    if (scoreData.message) value.message = scoreData.message;

    if (otherData) {
      value.meta = otherData;
    }

    return value;
  });
}

module.exports = Scores;
