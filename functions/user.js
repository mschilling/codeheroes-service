'use strict';

const admin = require('firebase-admin');

function createUser(evt) {
    const user = evt.data; // The Firebase user. Type: functions.auth.UserRecord

    const email = user.email;
    const userObj = {
        email: email,
        profile_picture: user.photoURL,
        providerData: user.providerData
    };

    if(user.displayName) {
      userObj.name = user.displayName;
    }

    admin.database().ref('users/'+user.uid).update(userObj);
}

module.exports = {
    createUser: createUser
};
