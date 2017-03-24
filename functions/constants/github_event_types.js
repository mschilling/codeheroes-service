'use strict';

 const GITHUB_EVENT_TYPES = {
  push: 'PUSH',
  pullRequest: 'PULL_REQUEST',
  issueOpened: 'ISSUE_OPENED',
  issueClosed: 'ISSUE_CLOSED',
  issueUndefined: 'ISSUE_UNDEFINED',
  undefined: 'UNDEFINED'
};

module.exports = GITHUB_EVENT_TYPES;
