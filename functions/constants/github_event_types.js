'use strict';

 const GITHUB_EVENT_TYPES = {
  push: 'PUSH',
  pullRequest: 'PULL_REQUEST',
  pullRequestOpened: 'PULL_REQUEST_OPENED',
  pullRequestClosed: 'PULL_REQUEST_CLOSED',
  pullRequestAssigned: 'PULL_REQUEST_ASSIGNED',
  issueOpened: 'ISSUE_OPENED',
  issueClosed: 'ISSUE_CLOSED',
  issueUndefined: 'ISSUE_UNDEFINED',
  undefined: 'UNDEFINED'
};

module.exports = GITHUB_EVENT_TYPES;
