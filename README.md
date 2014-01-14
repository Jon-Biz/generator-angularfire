generator-angularfire [![Build Status](https://secure.travis-ci.org/katowulf/generator-angularfire.png?branch=master)](https://travis-ci.org/katowulf/generator-angularfire)
=================================================

A generator for [Yeoman](http://yeoman.io).


Getting Started
---------------

### Installation

    npm install -g yo generator-angular generator-angularfire
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

This will get you started:

    npm -g yo yeoman-generator generator-angular
    git clone https://github.com/<YOUR_FORKED_VERSION>/generator-angularfire.git

Generators are a bit tricky because they are installed globally. When you want to use your local generator, you have to
link it global dependencies.

This is done like so:

    cd generator-angularfire
    npm link yo
    npm link generator-angular
    npm install
    npm test

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
