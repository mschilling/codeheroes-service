'use strict';

const admin = require('firebase-admin');

function createUser(evt) {
    const user = evt.data; // The Firebase user. Type: functions.auth.UserRecord

    const email = user.email;
    const displayName = user.displayName;

    const userObj = {
        name: displayName,
        codeName: displayName,
        email: email,
        notificationEnabled: false,
        notificationTokens: {},
        profile_picture: user.photoURL,
        // github_username: 'user_' + user.username,
        providerData: user.providerData
    };

    admin.database().ref('users/'+user.uid).update(userObj);
}

module.exports = {
    createUser: createUser
};
