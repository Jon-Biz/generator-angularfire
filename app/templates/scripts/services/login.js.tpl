'use strict';
angular.module('angularfire.login', ['firebase', 'angularfire.firebase'])

  .run(function(simpleLogin) {
    simpleLogin.init();
  })

  .factory('simpleLogin', function($rootScope, $firebaseSimpleLogin, firebaseRef, profileCreator, $timeout) {
<% if( usePasswordAuth ) { %>    function assertAuth() {
      if( auth === null ) { throw new Error('Must call loginService.init() before using its methods'); }
    }<% } %>
    var auth = null;
    return {
      init: function() {
        auth = $firebaseSimpleLogin(firebaseRef());
        return auth;
      },

      logout: function() {
        assertAuth();
        auth.$logout();
      },
<% if( useOauth ) { %>
      /**
       * @param {string} provider
       * @param {Function} [callback]
       * @returns {*}
       */
      login: function(provider, callback) {
        assertAuth();
        auth.login(provider, {rememberMe: true}).then(function(user) {
          if( callback ) {
            //todo-bug https://github.com/firebase/angularFire/issues/199
            $timeout(function() {
              callback(null, user);
            });
          }
        }, callback);
      }<% if( usePasswordAuth ) { %>,<% } %>
<% } %>
<% if( usePasswordAuth ) { %>
      /**
       * @param {string} email
       * @param {string} pass
       * @param {Function} [callback]
       * @returns {*}
       */
      loginPassword: function(email, pass, callback) {
        assertAuth();
        auth.$login('password', {
          email: email,
          password: pass,
          rememberMe: true
        }).then(function(user) {
            if( callback ) {
              //todo-bug https://github.com/firebase/angularFire/issues/199
              $timeout(function() {
                callback(null, user);
              });
            }
          }, callback);
      },

      changePassword: function(opts) {
        assertAuth();
        var cb = opts.callback || function() {};
        if( !opts.oldpass || !opts.newpass ) {
          $timeout(function(){ cb('Please enter a password'); });
        }
        else if( opts.newpass !== opts.confirm ) {
          $timeout(function() { cb('Passwords do not match'); });
        }
        else {
          auth.$changePassword(opts.email, opts.oldpass, opts.newpass, cb);
        }
      },

      createAccount: function(email, pass, callback) {
        assertAuth();
        auth.$createUser(email, pass, callback);
      },

      createProfile: profileCreator<% } %>
    };<% if( usePasswordAuth ) { %>
  })

  .factory('profileCreator', function(firebaseRef, $timeout) {
    return function(id, email, callback) {
      function firstPartOfEmail(email) {
        return ucfirst(email.substr(0, email.indexOf('@'))||'');
      }

      function ucfirst (str) {
        // credits: http://kevin.vanzonneveld.net
        str += '';
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1);
      }

      firebaseRef('users/'+id).set({email: email, name: firstPartOfEmail(email)}, function(err) {
        //err && console.error(err);
        if( callback ) {
          $timeout(function() {
            callback(err);
          });
        }
      });
    };
<% } %>
  });
