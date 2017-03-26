'use strict';

class FirebaseHelper {

  static getAppSettings(ref) {
    return Promise.resolve(true)
      .then( () => ref.child('appSettings').once('value') )
      .then( (snapshot) => {
      console.log(snapshot.val());
      snapshot.val();
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
