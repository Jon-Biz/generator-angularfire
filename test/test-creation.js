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
            fs.writeFileSync(path.join(appDir, 'index.html'), fs.readFileSync(path.join(__dirname, 'templates', '_index.html')));
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
           ['bower.json', /angularfire/]
        ];

        helpers.mockPrompt(this.app, {
            'namespace': 'INSTANCENAME'
        });
        this.app.options['skip-add'] = true;
        this.app.options['skip-install'] = true;
        this.app.options['skip-welcome-message'] = true;
        this.app.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });
});
