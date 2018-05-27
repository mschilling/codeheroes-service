'use strict';

// const eventTypes = require('../constants/github_event_types');
// const scoreConstants = require('../constants/score_constants');

class TravisPayload {
  constructor(payload) {
    initializeObject(this, payload);
  }

  get type() {
    return this._rawData.type;
  }

  get state() {
    return this._rawData.state;
  }

  get repository() {
    return this._rawData.repository;
  }

  get repositoryName() {
    return this.repository.name;
  }

  get commit() {
    return this._rawData.commit;
  }

  get commit_id() {
    return this._rawData.commit_id;
  }

  get duration() {
    return this._rawData.duration;
  }

  get pull_request() {
    return this._rawData.pull_request;
  }

  buildEventArgs() {
    const obj = {};
    obj.id = this._rawData.id;
    obj.buildNumber = this._rawData.number;
    obj.startedAt = this._rawData.started_at;
    obj.finishedAt = this._rawData.finished_at;
    obj.duration = this.duration;
    obj.state = this.state;
    obj.statusMessage = this._rawData.status_message;
    obj.resultMessage = this._rawData.result_message;
    obj.message = this._rawData.message;

    obj.type = this.type;
    obj.commit = this.commit;
    obj.branch = this._rawData.branch;
    obj.pullRequest = this.pull_request;
    obj.pullRequestNumber = this._rawData.pull_request_number;
    obj.authorName = this._rawData.author_name;
    obj.authorEmail = this._rawData.author_email;
    obj.committerName = this._rawData.committer_name;
    obj.committerEmail = this._rawData.committer_email;
    obj.repoName = this._rawData.repository.name;
    obj.repoOwner = this.repository.owner_name;

    obj.configOs = this._rawData.config.os;
    obj.configDist = this._rawData.config.dist;
    obj.configLanguage = this._rawData.config.language;
    obj.configHasDeploy = this._rawData.config.deploy ? true : false;

    obj.repo = `${this.repository.owner_name}/${this._rawData.repository.name}`;

    return obj;
  }
}

function initializeObject(obj, payload) {
  // Save raw payload
  obj._rawData = payload;
}

module.exports = TravisPayload;
