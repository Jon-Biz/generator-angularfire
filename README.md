generator-angularfire [![Build Status](https://secure.travis-ci.org/firebase/generator-angularfire.png?branch=master)](https://travis-ci.org/firebase/generator-angularfire)
=================================================

A generator for [Yeoman](http://yeoman.io) which adds Firebase and angluarFire support into an existing `yo angular` installation.

Getting Started
---------------

### Installation

    npm install -g generator-angularfire
    yo angular
    yo angularfire

### Prompts asked

 * `[?] Name of your Firebase instance:`
   (required) from your URL: http://`INSTANCE`.firebaseio.com
 * `[?] Shall I include FirebaseSimpleLogin?`
   add simple login authentication and offers options for routing and views
 * `[?] Which providers shall I install?`
   select from a list of [simple login providers](https://www.firebase.com/docs/security/simple-login-overview.html) you have enabled for your Firebase
 * `[?] Shall I include routeSecurity?`
   allows you to specify `authRequired` on a route and force user to log in before they can view it
 * `[?] Shall I create a rudimentary login screen?`
   This creates views/login.html and controllers/login.js, which provide registration (for password auth) and authentication

### What does it do?

 * app/bower_components/:
    * adds firebase/
    * adds firebase-simple-login/
    * adds angularFire/
 * app/scripts/app.js
    * adds the `firebase`, `angularfire.firebase` and `angularfire.login` module dependencies
    * adds the `#/login` route if you opted for the login screen
 * app/scripts/angularfire/
    * adds config.js which contains your Firebase URL, and other settings
    * adds routesecurity.js (optional) which allows you to put `authRequired` in any route config to prevent access before authenticating
 * app/scripts/controllers/
    * adds login.js (optional) assuming you enabled the rudimentary login screen
 * app/scripts/directives
    * adds ngcloakauth.js: (optional) a couple directives for dealing with blinking screens during init and login
 * app/scripts/services
    * adds firebase.js: a convenience wrapper for creating Firebase references and quickly syncing data
    * adds login.js: (optional) a set of services for logging in, creating users, etc
    * adds waitforauth.js: used by ngcloakauth.js
 * app/views
    * adds login.html: (optional) assuming you enabled the rudimentary login screen
 * app/index.html
    * injects script tags for new libs and bower modules
 * bower.json: adds new dependencies (everything in bower_components/ above)
 * karma.conf.js: adds deps for testing (everything in bower_components/ above)

Command Line Options
--------------------

You can set the following command line options:

 * `--skip-add`: do not inject `<script>` tags into app/index.html
 * `--skip-welcome-message`: do not show yeoman welcome
 * `--skip-install`: do not run `npm install` and `bower install` after setup

You can avoid the question prompts with the following options:

 * `--firebase=<instance>`: specify your Firebase instance name
 * `--providers=<name>`: Comma separated list of FirebaseSimpleLogin providers to install (password, facebook, twitter, or persona)
 * `--defaults`: accept defaults for any other yes/no questions

Contributing
------------

This will get you started to hack on generator-angularfire:

    npm -g yo yeoman-generator generator-angular
    git clone https://github.com/<YOUR_FORKED_VERSION>/generator-angularfire.git
    cd generator-angularfire
    npm link yo
    npm link generator-angular
    npm install
    npm test

Generators are a bit tricky because they are installed globally. When you want to use your local generator, you have to
use it as a global dependency, but that's not convenient for testing and debugging.

You can make it available globally while still keeping a local copy like so:
    cd generator-angularfire
    npm link

When you want to try a build, you can do it like this:

    cd testdir
    npm link ../generator-angularfire
    yo angular
    yo angularfire

After completing your code, writing appropriate test cases, and making sure all the test units pass, submit
a pull request on GitHub from your forked repo.

License
-------

[MIT License](http://firebase.mit-license.org/)
