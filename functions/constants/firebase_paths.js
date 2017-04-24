'use strict';

const queueRoot = 'queues';
const dataRoot = 'data';

const FIREBASE_PATHS = {
  dataRoot: dataRoot,
  feedData: `${dataRoot}/feed`,
  queueRoot: queueRoot,
  githubQueue: `${queueRoot}/github-hooks`,
  jiraQueue: `${queueRoot}/jira-hook`,
  jenkinsQueue: `${queueRoot}/jenkins-hooks`,
  travisQueue: `${queueRoot}/travis-hooks`
};

module.exports = FIREBASE_PATHS;
