'use strict';

/**
 * This module monitors angularFire's authentication and performs actions based on authentication state.
 * directives/directive.ngcloakauth.js depends on this file
 *
 * See usage examples here: https://gist.github.com/katowulf/7328023
 */
angular.module('<%= scriptAppName %>')

/**
 * A service that returns a promise object, which is resolved once $firebaseSimpleLogin
 * is initialized.
 *
 * <code>
 *    function(waitForAuth) {
 *        waitForAuth.then(function() {
 *            console.log('auth initialized');
 *        });
 *    }
 * </code>
 */
  .service('waitForAuth', function($rootScope, $q, $timeout) {
    function fn(err) {
      if($rootScope.auth) {
        $rootScope.auth.error = err instanceof Error? err.toString() : null;
      }
      for(var i=0; i < subs.length; i++) { subs[i](); }
      $timeout(function() {
        // force $scope.$apply to be re-run after login resolves
        def.resolve();
      });
    }

    var def = $q.defer(), subs = [];
    subs.push($rootScope.$on('$firebaseSimpleLogin:login', fn));
    subs.push($rootScope.$on('$firebaseSimpleLogin:logout', fn));
    subs.push($rootScope.$on('$firebaseSimpleLogin:error', fn));
    return def.promise;
  });