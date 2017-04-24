'use strict';

 const SCORE_CONSTANTS = {
  push: 0,
  commit: 1,
  pullRequest: 0,
  pullRequestOpened: 2,
  pullRequestClosed: 3,
  githubIssueOpened: 2,
  githubIssueClosed: 2,
  jiraIssueCreated: 1,
  jiraIssueResolved: 1,
  jiraIssueClosed: 2
};

module.exports = SCORE_CONSTANTS;
