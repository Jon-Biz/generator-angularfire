'use strict';
var path = require('path');
var fs = require('fs');
var util = require('util');
var chalk = require('chalk');
var colors = require(path.join(__dirname, 'colors.js'));
var TaggedBlock = require(path.join(__dirname, 'TaggedBlock.js'));

module.exports = {
   rewrite: rewrite,
   rewriteFile: rewriteFile,
   title: infoln,
   colors: colors,
   fetchAppName: fetchAppName,
   replaceTaggedBlock: replaceTaggedBlock,
   addLibScripts: addLibScripts
};

function fetchAppName(defaultName, appDir) {
   var name = defaultName;
   var file = fs.readFileSync(path.join(process.cwd(), appDir, 'scripts', 'app.js'), 'utf8');
   var matches = file.match(/angular\.module\( *['"]([^'"]+)['"] *,/);
   return matches? matches[1] : name+'App';
}

function infoln() {
   console.log("\n"+colors.apply(null, arguments));
}

// credits: generator-angular/utils.js
function rewriteFile (args) {
   args.path = args.path || process.cwd();
   var fullPath = path.join(args.path, args.file);

   args.haystack = fs.readFileSync(fullPath, 'utf8');
   var body = rewrite(args);

   fs.writeFileSync(fullPath, body);
}

function escapeRegExp (str) {
   return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function rewrite (args) {
   // check if splicable is already in the body text
   var re = new RegExp(args.splicable.map(function (line) {
      return '\s*' + escapeRegExp(line);
   }).join('\n'));

   if (re.test(args.haystack)) {
      return args.haystack;
   }

   var lines = args.haystack.split('\n');

   var otherwiseLineIndex = 0;
   lines.forEach(function (line, i) {
      if (line.indexOf(args.needle) !== -1) {
         otherwiseLineIndex = i;
      }
   });

   var spaces = 0;
   while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
      spaces += 1;
   }

   var spaceStr = '';
   while ((spaces -= 1) >= 0) {
      spaceStr += ' ';
   }

   lines.splice(otherwiseLineIndex, 0, args.splicable.map(function (line) {
      return spaceStr + line;
   }).join('\n'));

   return lines.join('\n');
}

function replaceTaggedBlock(filePath, headerTag, footerTag, newText) {
   return new TaggedBlock(filePath, headerTag, footerTag).replace(newText);
}

function addLibScripts(_, filePath, deps) {
   var block = new TaggedBlock(filePath, '<!-- build:js({.tmp,app}) scripts/scripts.js -->', '<!-- endbuild -->');
   var tpl = _.template('    <script src="<%- key %>"></script>');
   return block.appendRows(tpl, deps, function(row) {
      return ((row||'').match(/src=['"]([^'"]*)['"]/)||[])[1]||null;
   });
}
