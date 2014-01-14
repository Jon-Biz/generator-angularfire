'use strict';

/**
 * Directives to cloak/hide content until FirebaseSimpleLogin resolves
 * Depends on services/service.waitforauth.js
 *
 * See usage examples here: https://gist.github.com/katowulf/7328023
 */
angular.module('<%= scriptAppName %>')

/**
 * A directive that hides the element from view until waitForAuth resolves
 *
 * <code>
 *    <div ng-cloak-auth>Authentication has resolved.</div>
 * </code>
 */
  .directive('ngCloakAuth', function(waitForAuth) {
    return {
      restrict: 'A',
      compile: function(el) {
        el.addClass('hide');
        waitForAuth.then(function() {
          el.removeClass('hide');
        });
      }
    };
  })

/**
 * A directive that shows elements only when the given authentication state is in effect
 *
 * <code>
 *    <div ng-show-auth="login">{{auth.user.id}} is logged in</div>
 *    <div ng-show-auth="logout">Logged out</div>
 *    <div ng-show-auth="error">An error occurred: {{auth.error}}</div>
 *    <div ng-show-auth="logout,error">This appears for logout or for error condition!</div>
 * </code>
 */
  .directive('ngShowAuth', function($rootScope) {
    var loginState;
    $rootScope.$on('$firebaseSimpleLogin:login',  function() { loginState = 'login'; });
    $rootScope.$on('$firebaseSimpleLogin:logout', function() { loginState = 'logout'; });
    $rootScope.$on('$firebaseSimpleLogin:error',  function() { loginState = 'error'; });
    function inList(needle, list) {
      var res = false;
      angular.forEach(list, function(x) {
        if( x === needle ) {
          res = true;
          return true;
        }
        return false;
      });
      return res;
    }
    function assertValidState(state) {
      if( !state ) {
        throw new Error('ng-show-auth directive must be login, logout, or error (you may use a comma-separated list)');
      }
      var states = (state||'').split(',');
      angular.forEach(states, function(s) {
        if( !inList(s, ['login', 'logout', 'error']) ) {
          throw new Error('Invalid state "'+s+'" for ng-show-auth directive, must be one of login, logout, or error');
        }
      });
      return true;
    }
    return {
      restrict: 'A',
      compile: function(el, attr) {
        assertValidState(attr.ngShowAuth);
        var expState = (attr.ngShowAuth||'').split(',');
        function fn(newState) {
          loginState = newState;
          var hide = !inList(newState, expState);
          el.toggleClass('hide', hide );
        }
        fn(loginState);
        $rootScope.$on('$firebaseSimpleLogin:login',  function() { fn('login'); });
        $rootScope.$on('$firebaseSimpleLogin:logout', function() { fn('logout'); });
        $rootScope.$on('$firebaseSimpleLogin:error',  function() { fn('error'); });
      }
    };
  });