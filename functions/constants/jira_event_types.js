'use strict';

 const JIRA_EVENT_TYPES = {
  issueCreated: 'ISSUE_CREATED',
  issueUpdated: 'ISSUE_UPDATED',
  issueResolved: 'ISSUE_RESOLVED',
  issueClosed: 'ISSUE_CLOSED',
  undefined: 'UNDEFINED'
};

module.exports = JIRA_EVENT_TYPES;
