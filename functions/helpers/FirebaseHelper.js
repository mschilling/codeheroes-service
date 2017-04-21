'use strict';

let ref;
const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

class FirebaseHelper {

  static initialize(rootRef) {
    ref = rootRef;
  }

  static getAppSettings() {
    return ref.child('appSettings').once('value').then((snapshot) => {
      // console.log(snapshot.val());
      // return Promise.resolve(true);
      return snapshot.val();
    });
  }

  static getGitHubUser(user) {
    return ref.child('github_users').child(user).once('value')
      .then((userSnapshot) => {
        if (userSnapshot.exists()) {
          return userSnapshot.val();
        } else {
          return Promise.resolve();
        }
      });
  }

  static getGitHubUsers() {
    return ref.child('github_users').once('value')
      .then((userSnapshot) => {
        if (userSnapshot.exists()) {
          return userSnapshot.val();
        } else {
          return Promise.resolve();
        }
      });
  }


  static encodeAsFirebaseKey(input) {
    return input
      .replace(/\./g, '_')
      .replace(/\//g, '%2F')
      // .replace(/\%/g, '%25')
      // .replace(/\./g, '%2E')
      // .replace(/\#/g, '%23')
      // .replace(/\$/g, '%24')
      // .replace(/\//g, '%2F')
      // .replace(/\[/g, '%5B')
      // .replace(/\]/g, '%5D')
      ;
  };

  static getTimestampFromKey(id) {
    id = id.substring(0, 8);
    let timestamp = 0;
    for (let i = 0; i < id.length; i++) {
      const c = id.charAt(i);
      timestamp = timestamp * 64 + PUSH_CHARS.indexOf(c);
    }
    return new Date(timestamp).toISOString();
  }
}

module.exports = FirebaseHelper;
