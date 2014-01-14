generator-angularfire [![Build Status](https://secure.travis-ci.org/katowulf/generator-angularfire.png?branch=master)](https://travis-ci.org/katowulf/generator-angularfire)
=================================================

A generator for [Yeoman](http://yeoman.io).


Getting Started
---------------

### Installation

    npm install -g yo generator-angular generator-angularfire
    yo angular
    yo angularfire

### Questions

 * `[?] Name of your Firebase instance:`
 * `[?] Shall I include FirebaseSimpleLogin?`
 * `[?] Which provider shall I install?`
 * `[?] Shall I include routeSecurity?`
 * `[?] Shall I create a rudimentary login screen?` This creates views/login.html and controllers/login.js.


Command Line Options
--------------------

You can set the following command line options:

 * `--skip-install`: do not run `npm install` and `bower install`
 * `--skip-add`: do not inject `<script>` tags into app/index.html

You can avoid question prompts with the following:

 * `--firebase=<instance>`: specify your firebase instance name
 * `--provider=<name>`: a FirebaseSimpleLogin provider (password, facebook, twitter, or persona)
 * `--defaults`: accept defaults for any other yes/no questions

Contributing
------------

Generators are a bit tricky because they are installed globally. Thus, when you try to locally install generator-angularfire
you will get warnings about missing generator-angular and yo dependencies (even if you've appropriately installed them
globally). To fix these, link to the globals from the local generator.

Thus, the setup of a local build looks like so:

    git clone https://github.com/<YOUR_FORKED_VERSION>/generator-angularfire.git
    cd generator_angularfire/
    npm link yo
    npm link generator-angular
    npm install
    npm test

After completing your changes, writing appropriate test cases, and making sure all the test units pass, submit
a pull request on GitHub from your forked repo.

License
-------

[MIT License](http://firebase.mit-license.org/)
