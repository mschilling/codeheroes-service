'use strict';

const eventTypes = require('../constants/jira_event_types');
// const scoreConstants = require('../constants/score_constants');

class JiraPayload {

  constructor(payload) {
    initializeObject(this, payload);
  }

  get eventType() {
    return this._eventType;
  }

  get user() {
    return this._user;
  }

  // calculate scores based on payload
  getScores() {
    return getScores(this);
  }
}

function initializeObject(obj, payload) {
  // Save raw payload
  obj._raw = payload;

  obj._eventType = parseEventType(payload);

  obj._user = parseUser(payload);
}

function parseEventType(payload) {
  if (!payload) return eventTypes.undefined;

  switch(payload.issue_event_type_name) {
      case 'issue_created':
        return eventTypes.issueCreated;
      case 'issue_updated':
        return eventTypes.issueUpdated;
      case 'issue_resolved':
        return eventTypes.issueResolved;
      case 'issue_closed':
        return eventTypes.issueClosed;
  }
  // return payload.issue_event_type_name;
  return eventTypes.undefined;
}

function parseUser(payload) {
  const { user } = payload;
  if (!user)
    return;
  return user;
}

function getScores(obj) {
  let scores = [];
  const sender = obj.sender || {};

  const score = {
    key: (sender.login || 'other'),
    description: '',
    points: 0,
    eventType: obj.eventType,
    counters: {}
  };

  switch (obj.eventType) {
    case eventTypes.push:
      score.points = scoreConstants.push;
      score.description = 'Push-it good!';
      score.counters.pushes = 1;

      scores = scores.concat( getScoresFromCommits(obj) );
      break;
    case eventTypes.pullRequest:
      score.points = scoreConstants.pullRequest;
      score.description = 'Great pull request! Keem \'em coming!';
      score.counters.pull_requests = 1;
      break;
    case eventTypes.issueClosed:
      score.points = scoreConstants.githubIssueClosed;
      score.description = 'Finish him';
      score.counters.issues_closed = 1;
      break;
    case eventTypes.issueOpened:
      score.points = scoreConstants.githubIssueOpened;
      score.description = 'New issue comming through!';
      score.counters.issues_opened = 1;
      break;
  }

  scores.push(score);
  return scores;
}

module.exports = JiraPayload;
