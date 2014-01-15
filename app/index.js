'use strict';
var fs      = require('fs');
var util    = require('util');
var path    = require('path');
var yeoman  = require('yeoman-generator');
var chalk   = require('chalk');
var wiredep = require('wiredep');
var apputil = require(path.join(__dirname, '../util'));

var Generator = module.exports = function Generator(args, options, config) {
   yeoman.generators.Base.apply(this, arguments);

   this.on('end', function () {
      this.installDependencies({
         skipInstall: this.options['skip-install'],
         npm: false,
         callback: this._injectBowerScripts.bind(this)
      });
   });
};

util.inherits(Generator, yeoman.generators.Base);

Generator.prototype.welcome = function welcome() {
   // welcome message
   if (!this.options['skip-welcome-message']) {
      console.log(this.yeoman);
      apputil.title(
         'This will install Firebase and AngularFire dependencies into an existing Angular.js build.'
      );
   }

   this._validateAngularBuild();
   this._initEnv();
};

Generator.prototype.askFor = function askFor() {
   apputil.title();
   var _ = this._;
   var cb = this.async();
   var configProps = this.configProps = { firebase: null, routing: false, simple: false, loginPage: false, providers: [] };
   var prompts = buildPrompts(this._, this.configProps, this.options);

   this.prompt(prompts, function (answers) {
      var key;
      for (key in answers) {
         if (answers.hasOwnProperty(key)) {
            configProps[key] = answers[key];
         }
      }
      // used by templates
      this.useOauth = configProps.simple && this._.find(configProps.providers, function(v) { return v !== 'password' })!==undefined;
      this.usePasswordAuth = configProps.simple && configProps.providers.indexOf('password') >= 0;
      this.selectedProviders = [];
      if( configProps.simple ) {
         this.selectedProviders = this._.filter(this.pkg.simpleLoginProviders, function(prov) {
            return configProps.providers.indexOf(prov.value) >= 0;
         });
      }
      cb();
   }.bind(this));
};

Generator.prototype.copyTemplates = function() {
   apputil.title('Building files in %yellowapp/%/yellow folder...');
   //todo move these to config.json
   this._copyTemplate('config.js', 'scripts/angularfire');
   this._copyTemplate('firebase.js', 'scripts/services');
   if( this.configProps.simple ) {
      this._copyTemplate('login.js.tpl', 'scripts/services');
      this._copyTemplate('waitforauth.js', 'scripts/services');
      this._copyTemplate('ngcloakauth.js', 'scripts/directives');
      this._appendToFile('styles/angularfire.scss', 'styles/main.scss');
      if( this.configProps.routing ) {
         this._copyTemplate('routesecurity.js', 'scripts/angularfire');
      }
      if( this.configProps.loginPage ) {
         this._copyTemplate('login.js.tpl', 'scripts/controllers');
         this._copyTemplate('login.html', 'views');
      }
   }
};

Generator.prototype.injectBowerDeps = function() {
   apputil.title('Adding dependencies to %yellowbower.json...%/yellow');
   var json = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'bower.json')));
   this._.each(this.pkg.bower.default, function(ver, name) {
      json.dependencies[name] = ver;
      this.log.info('%s: %s', name, ver);
   }, this);
   if( this.configProps.simple ) {
      this._.each(this.pkg.bower.simple, function(ver, name) {
         json.dependencies[name] = ver;
         this.log.info('%s: %s', name, ver);
      }, this);
   }
   fs.writeFileSync('./bower.json', JSON.stringify(json, null, '  ') + '\n');
};

// credits: generator-angular/app/index.js
Generator.prototype._injectBowerScripts = function() {
   if (this.options['skip-add']) {
      console.log(
         '\nI did not inject deps into app/index.html. Once `bower install` has been run, you can\n' +
            'do this manually by running: '+chalk.yellow.bold('grunt bower-install')
      );
   } else {
      apputil.title('Injecting bower dependencies into %yellowapp/index.html%/yellow');
      wiredep({
         directory: 'app/bower_components',
         bowerJson: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'bower.json'))),
         ignorePath: 'app/',
         htmlFile: 'app/index.html',
         cssPattern: '<link rel="stylesheet" href="{{filePath}}">',
         exclude: ['angular-mocks.js', 'observe.js', 'angularfire.min.js']
      });
   }
};

Generator.prototype.injectAngularModules = function() {
   //todo move these to config.json
   var deps = this._.map(['firebase', 'login'], function(dep) {
      return util.format('%s.%s', 'angularfire', dep);
   }, this).concat(['firebase']);

   if( this.options['skip-add'] ) {
      this.log(
         '\nI did not add module dependencies into app/scripts/app.js. You can\n' +
            'do this manually by adding the following to the dependency array:'+
            chalk.yellow.bold("\n\t "+deps.join(", "))
      );
   }
   else {
      apputil.title('Injecting module dependencies into %yellowapp/scripts/app.js%/yellow');
      this._addModuleDependencies('scripts/app.js', deps);
   }

   this._addRoutingPaths();
};

Generator.prototype.injectScriptTags = function() {
   apputil.title('Injecting libs into %yellowapp/index.html%/yellow');
   var res = apputil.addLibScripts(this._, path.join(this.env.options.appPath, 'index.html'), this.scriptDeps);
   this._.each(res, function(v,k) {
      if(v === 'exists') {
         console.log(colorAction('exists')+' '+k);
      }
      else {
         console.log(colorAction('added')+' '+k);
      }
   }, this);
};

Generator.prototype.setupTestUnits = function() {
   //todo
   //todo
   //todo
   //todo
   this._updateKarmaDeps();
};

Generator.prototype._validateAngularBuild = function() {
   var fail = false;
   apputil.title('Verifying you have already run `yo angular`');
   ['./app/index.html', './app/scripts/app.js', './bower.json', './package.json'].forEach(function(file) {
      if( assertFile(file) ) { this.log.ok(file); }
      else { fail = true; }
   }, this);
   if( fail ) { throw new Error('Cannot continue because critical files are missing'); }
};

Generator.prototype._initEnv = function() {
   this.pkg        = JSON.parse(this.readFileAsString(path.join(__dirname, 'config.json')));
   var bower       = require(path.join(process.cwd(), 'bower.json'));

   this.scriptDeps = [];
   this.env.options.appPath = bower.appPath || 'app';
   this.env.options.testPath = bower.testPath || 'test/spec';
   this.appname = this._.slugify(this._.humanize(bower.name || path.basename(process.cwd())));

   // used by templates
   this.scriptAppName = apputil.fetchAppName(this.appname, this.env.options.appPath);

   this._assertNoCoffee();
};

Generator.prototype._copyTemplate = function(name, folder) {
   var destName = name.replace(/[.]tpl$/, '');
   var pathParts = [this.env.options.appPath];
   if( folder ) {
      pathParts.push(folder);
      if( folder.indexOf('scripts') === 0 ) {
         this.scriptDeps.push(folder+'/'+destName);
      }
   }
   pathParts.push(destName);
   var srcPath = folder? folder+'/'+name : name;
   this.template(
      srcPath,
      path.join.apply(path, pathParts)
   );
};

Generator.prototype._addModuleDependencies = function(fileName, deps) {
   var action;
   var destPath = path.join(this.env.options.appPath, fileName);
   var origText = fs.readFileSync(destPath, 'utf8');
   var re = new RegExp("(angular.module\\('"+this.scriptAppName+"', *\\[)([^\\]]*)\\]", 'm');
   var replacedText = origText.replace(re, function(m, p1, p2) {
      var depList = stringifyDepList(mergeDepList(parseDepList(p2), deps));
      return p1+'\n  '+depList+'\n]';
   });
   if( origText !== replacedText ) {
      fs.writeFileSync(destPath, replacedText, {encoding: 'utf8'});
   }
};

Generator.prototype._appendToFile = function(srcFile, destFile) {
   var destPath = path.join(this.env.options.appPath, destFile);
   var header = "/* angularfire:app "+srcFile+" */";
   var footer = "/* angularfire:app(end) "+srcFile+" */";
   var message = ' templates/'+srcFile+' >> app/'+destFile;
   var textToAppend = fs.readFileSync(path.join(__dirname, 'templates', srcFile), 'utf8');
   var action = apputil.replaceTaggedBlock(destPath, header, footer, textToAppend);
   console.log(colorAction(action)+message);
};

Generator.prototype._assertNoCoffee = function(){
   if (typeof this.env.options.coffee === 'undefined') {
      this.option('coffee');
      // attempt to detect if user is using CS or not
      // if cml arg provided, use that; else look for the existence of cs
      if (!this.options.coffee &&
         this.expandFiles(path.join(this.env.options.appPath, '/scripts/**/*.coffee'), {}).length > 0) {
         this.options.coffee = true;
      }
      this.env.options.coffee = this.options.coffee;
   }
   if( this.env.options.coffee ) {
      throw new Error('CoffeeScript not supported yet :(');
   }
};

Generator.prototype._addRoutingPaths = function() {
   //todo move these to config.json
   if( this.configProps.routing ) {
      var routeText = "      .when('/login', {\n" +
         "        authRequired: false, // if true, must log in before viewing this page\n" +
         "        templateUrl: 'views/login.html',\n" +
         "        controller: 'LoginController'\n" +
         "      })";
      if( this.options['skip-add'] ) {
         this.log(
            '\nI did not add the login page to routing in app/scripts/app.js. You can\n' +
               'do this manually by adding the following just before the .otherwise(...) entry:'+
               chalk.yellow.bold("\n"+routeText)
         );
      }
      else {
         var destPath = path.join(this.env.options.appPath, 'scripts', 'app.js');
         var text = fs.readFileSync(destPath, 'utf8');
         var m = text.match(/( *\.when\('\/login',[^)]+\))/);
         if( m && m[1].trim() === routeText.trim() ) {
            this.log(colorAction('exists')+' #/login route');
         }
         else {
            var action;
            if( m ) {
               text = text.replace(m[0], routeText);
               action = 'updated';
            }
            else {
               text = text.replace('.otherwise({', routeText.trim()+"\n      .otherwise({");
               action = 'added';
            }
            fs.writeFileSync(destPath, text, {encoding: 'utf8'});
            this.log(colorAction(action)+' #/login route');
         }
      }
   }
};

Generator.prototype._updateKarmaDeps = function(){
   apputil.title('Updating Karma dependencies');
   var log = this.log, deps = [];
   function addDep(ver, key) {
      var depname = util.format('app/bower_components/%s/%s.js', key, key);
      if( text.match(depname) ) {
         log(colorAction('exists')+' '+depname);
      }
      else {
         log(colorAction('added')+' '+depname);
         deps.push(depname);
      }
   }

   var destPath = path.join(process.cwd(), 'karma.conf.js');
   var text = fs.readFileSync(destPath, 'utf8');
   this._.each(this.pkg.bower.default, addDep);
   if( this.configProps.simple ) {
      this._.each(this.pkg.bower.simple, addDep);
   }

   if( deps.length ) {
      text = text.replace(/( +)(['"]app\/scripts\/\*\.js['"])/, function(m, p1, p2) {
         return util.format("%s'%s',\n%s%s", p1, deps.join(util.format("',\n%s'", p1)), p1, p2);
      });
      fs.writeFileSync(destPath, text, {encoding: 'utf8'});
   }
};

function assertFile(fileName){
   if( !fs.existsSync(fileName) ) {
      console.error(chalk.red('Did not find '+fileName+'. Have you run `yo angular` already?'));
      return false;
   }
   return true;
}

function parseDepList(str) {
   var parts = str.split(',');
   var out = [];
   parts.forEach(function(p) {
      out.push(p.replace(/\s*['"]([^'"]+)['"],?\s*/, '$1'));
   });
   return out;
}

function mergeDepList(list, newDeps) {
   var out = list.slice(0);
   newDeps.forEach(function(dep) {
      if( out.indexOf(dep) < 0 ) {
         console.log(colorAction('added')+' '+dep);
         out.push(dep);
      }
      else {
         console.log(colorAction('exists')+' '+dep);
      }
   });
   return out;
}

function stringifyDepList(list) {
   var out = [];
   list.forEach(function(dep) {
      out.push(util.format("'%s'", dep));
   });
   return out.join(',\n  ');
}

function colorAction(action) {
   switch(action) {
      case 'added':
      case 'created':
      case 'updated':
         return chalk.green(action);
      case 'conflict':
      case 'existing':
      case 'unchanged':
      case 'identical':
      case 'exists':
         return chalk.cyan(action);
      default:
         return chalk.red(action);
   }
}

function buildPrompts(_, configProps, options) {
   var PROMPTS = [
      {
         name: 'firebase',
         message: apputil.colors('Name of your Firebase instance ' +
            '(https//%yellow<INSTANCE>%/yellow.firebaseio.com)'),
         required: true,
         validate: function(input) {
            if( !input || !input.match(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/) ) {
               return chalk.red('Your Firebase name may only contain [a-z], [0-9], and hyphen (-). It may not start or end with a hyphen.');
            }
            return true;
         }
      }, {
         type: 'confirm',
         name: 'simple',
         message: 'Shall I include FirebaseSimpleLogin?',
         default: true
      }, {
         type: 'checkbox',
         name: 'providers',
         message: 'Which providers shall I install?',
         choices: require(path.join(__dirname, 'config.json'))['simpleLoginProviders'],
         when: function(answers) {
            return answers.simple || options.default;
         },
         validate: function(picks) {
            return picks.length > 0? true : 'Must pick at least one provider';
         },
         default: ['password']
      }, {
         type: 'confirm',
         name: 'routing',
         message: 'Shall I include routeSecurity?',
         default: true,
         when: function(answers) {
            return answers.simple;
         }
      }, {
         type: 'confirm',
         name: 'loginPage',
         message: 'Shall I create a rudimentary login screen?',
         default: true,
         when: function(answers) {
            return answers.simple;
         }
      }
   ];

   var prompts = [];
   _.each(PROMPTS, addPrompt.bind(null, prompts, configProps, _, options));
   return prompts;
}

function addPrompt(prompts, configProps, _, options, prompt) {
   var k = prompt.name;
   var useDefault = (!options[k] && options['default'] && prompt.hasOwnProperty('default') && prompt.type !== 'checkbox');
   if( useDefault || options[k] ) {
      configProps[k] = useDefault? prompt.default : options[k];
      if( prompt.type === 'checkbox' && !Array.isArray(configProps[k]) ) {
         configProps[k] = _.map(configProps[k].split(','), function(v) {
            if( _.find(prompt.choices, function(c) {
               return _.isObject(c)? c.value === v : c === v;
            }) === undefined ) {
               throw new Error('Invalid choice for option "'+k+'": '+v);
            }
            return (v+'').toLowerCase()
         });
      }
      console.log(apputil.colors(
         '[%green?%/green] %s %cyan%s%/cyan',
         prompt.message,
         prompt.type === 'confirm'? 'Yes' : configProps[k]
      ));
   }
   else {
      prompts.push(prompt);
   }
}