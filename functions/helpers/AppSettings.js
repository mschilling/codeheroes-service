'use strict';

class AppSettings {

  constructor( baseRef ) {
    this._baseRef = baseRef;
  }

  checkRepositoryIsExcluded( repoName ) {
    return repoIsExcluded(this._baseRef, repoName);
  }
}

function repoIsExcluded(baseRef, repoKey) {
  return baseRef.child('excludeRepos').once('value')
    .then( (snapshot) => {
      const repos = snapshot.val() || [];
      return (repos.indexOf(repoKey) > -1 );
    });
}

module.exports = AppSettings;
