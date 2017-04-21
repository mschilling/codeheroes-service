'use strict';

const FeedHelper = require('./helpers/FeedHelper');

function processJiraPayload(evt) {
  const ref = evt.data.adminRef.root;
  FeedHelper.setTargetRef(ref.child('feed'));
  return FeedHelper.addToFeed(evt.data);
}

module.exports = {
  processJiraPayload: processJiraPayload
};
