/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;
var fs      = require('fs');

describe('angularfire generator', function () {
    beforeEach(function (done) {
       var dir = path.join(__dirname, 'temp');
       helpers.testDirectory(dir, function (err) {
            if (err) {
                return done(err);
            }

            // simulate running angular:app
            var appDir = path.join(dir, 'app');
            fs.mkdirSync(appDir);
            fs.mkdirSync(path.join(appDir, 'bower_components'));
            fs.mkdirSync(path.join(appDir, 'scripts'));
            fs.mkdirSync(path.join(appDir, 'styles'));
            fs.writeFileSync(path.join(appDir, 'index.html'), fs.readFileSync(path.join(__dirname, 'templates', '_index.html')));
            fs.writeFileSync(path.join(appDir, 'styles', 'main.scss'), 'body {}\n');
            fs.writeFileSync(path.join(appDir, 'scripts', 'app.js'), fs.readFileSync(path.join(__dirname, 'templates', '_app.js')));
            fs.writeFileSync(path.join(dir, 'bower.json'), fs.readFileSync(path.join(__dirname, 'templates', '_bower.json')));
            fs.writeFileSync(path.join(dir, 'package.json'), fs.readFileSync(path.join(__dirname, 'templates', '_package.json')));

            this.app = helpers.createGenerator('angularfire:app', [
                '../../app'
            ]);
            done();
        }.bind(this));
    });

    it('creates expected files', function (done) {
        var expected = [
            // add files you expect to exist here.
           ['bower.json', /firebase/],
           ['bower.json', /angularfire/],
           ['app/scripts/controllers/login.js', /createAccount/],
           'app/scripts/services/firebase.js',
           ['app/scripts/services/login.js', /createAccount/],
           'app/scripts/services/waitforauth.js',
           'app/scripts/directives/ngcloakauth.js',
           ['app/scripts/angularfire/config.js', /TEST_INSTANCE_NAME/],
           ['app/views/login.html', /facebook/],
           'app/scripts/angularfire/routesecurity.js'
        ];

//        helpers.mockPrompt(this.app, {
//            'namespace': 'TEST_INSTANCE_NAME'
//        });
        this.app.options['firebase'] = 'TEST_INSTANCE_NAME';
        this.app.options['skip-add'] = true;
        this.app.options['skip-install'] = true;
        this.app.options['skip-welcome-message'] = true;
        this.app.options['default'] = true;
        this.app.options['providers'] = 'facebook,password';
        this.app.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });
});
