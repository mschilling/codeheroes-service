'use strict';

const PubSub = require('@google-cloud/pubsub');

const GITHUB_DEFAULT_TOPIC = 'github-events';
const TRAVIS_DEFAULT_TOPIC = 'travis-events';

class PubSubHelper {
  constructor() {
    // Creates a client
    this.pubsub = new PubSub({
      projectId: 'm4m-code-heroes-dev'
    });
  }

  publishTravisEvent(payload) {
    return this.publish(payload, TRAVIS_DEFAULT_TOPIC);
  }

  publish(payload, topic) {
    const dataBuffer = Buffer.from(JSON.stringify(payload));

    this.pubsub
      .topic(topic)
      .publisher()
      .publish(dataBuffer)
      .then(messageId => {
        console.log(`Message ${messageId} published.`, JSON.stringify(payload));
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
  }
}

module.exports = PubSubHelper;
