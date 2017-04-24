'use strict';

const queueRoot = 'queues';
const dataRoot = 'data';

const FIREBASE_PATHS = {
  dataRoot: dataRoot,
  feedData: `${dataRoot}/feed`,
  queueRoot: queueRoot,
  githubQueue: `${queueRoot}/hooks/github`,
  jiraQueue: `${queueRoot}/hooks/jira`,
  jenkinsQueue: `${queueRoot}/hooks/jenkins`,
  travisQueue: `${queueRoot}/hooks/travis`
};

module.exports = FIREBASE_PATHS;
