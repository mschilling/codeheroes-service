'use strict';

class TravisPubSub {
  static onTravisPubSub(message) {
    console.log('Payload from Travis PubSub message', message.json);
    return Promise.resolve(message);
  }
}

module.exports = TravisPubSub;
