'use strict';

let ref;

class FirebaseHelper {

  static initialize(rootRef) {
    ref = rootRef;
  }

  static getAppSettings() {
    return ref.child('appSettings').once('value').then( (snapshot) => {
        // console.log(snapshot.val());
        // return Promise.resolve(true);
        return snapshot.val();
      });
  }

  static getGitHubUser(user) {
    return ref.child('github_users').child(user).once('value')
      .then( (userSnapshot) => {
        if(userSnapshot.exists()) {
          return userSnapshot.val();
        } else {
          return Promise.resolve();
        }
      });
  }

  static getGitHubUsers() {
    return ref.child('github_users').once('value')
      .then( (userSnapshot) => {
        if(userSnapshot.exists()) {
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

}

module.exports = FirebaseHelper;
