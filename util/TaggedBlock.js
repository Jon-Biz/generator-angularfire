
var fs = require('fs');
var path = require('path');
var apputil = require(path.join(__dirname, 'index.js'));
var util = require('util');

function matchesTags(origText, startTag, endTag) {
   return new RegExp(escapeRegExp(startTag.trim())).test(origText) && new RegExp(escapeRegExp(endTag.trim())).test(origText);
}

function escapeRegExp(string){
   return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1").replace(/(\s|\r|\n)+/m, '(\\s|\\r|\\n)+');
}

function TaggedBlock(filePath, headerTag, footerTag) {
   this.filePath = filePath;
   this.headerTag = headerTag;
   this.footerTag = footerTag;
   this.origText = fs.readFileSync(this.filePath, 'utf8');
   this.hasTags = matchesTags(this.origText, headerTag, footerTag);
}

TaggedBlock.prototype = {
   getBlock: function() {
      if( this.hasTags ) {
         var parts = this.origText.split("\n");
         var x = -1, y = -1, i = parts.length;
         while(i-- && x === -1 || y === -1 ) {
            var txt = parts[i].trim();
            if(txt === this.headerTag) { x = i; }
            else if(txt === this.footerTag) { y = i; }
         }

         if( x >= 0 && y >= x ) {
            return parts.slice(x+1, y).join('\n');
         }
      }
      return '';
   },

   appendRows: function(tpl, list, keyFn) {
      var rows = this.getBlock().split('\n'), len = rows.length;
      var existingKeys = grabKeys(rows, keyFn);
      var res = {};
      list.forEach(function(item) {
         if( typeof(item) === 'string' ) { item = {key: item} }
         if( !existingKeys.hasOwnProperty(item.key) ) {
            rows.push(tpl(item));
            res[item.key] = 'added';
         }
         else {
            res[item.key] = 'exists';
         }
      });
      if( rows.length !== len ) {
         this.replace(rows.join('\n'));
      }
      return res;
   },

   replace: function(newText) {
      var action;

      if( new RegExp(escapeRegExp(this.headerTag+"\n"+newText+"\n"+this.footerTag), 'm').test(this.origText) ) {
         action = 'identical';
      }
      else if( this.hasTags ) {
         if( this._splice(newText) ) {
            action = 'updated';
         }
         else {
            apputil.printc('%redLooks like the tags were corrupted in %s, expected something close to %s', this.filePath, this.headerTag+"\n...some content here...\n"+this.footerTag);
         }
      }

      if( !action ) {
         action = 'appended';
         this._append(newText);
      }

      return action;
   },

   _splice: function(textToSplice) {
      var parts = this.origText.split("\n");
      var x = -1, y = -1, i = parts.length;
      while(i-- && x === -1 || y === -1 ) {
         var txt = parts[i].trim();
         if(txt === this.headerTag) { x = i; }
         else if(txt === this.footerTag) { y = i; }
      }

      if( x >= 0 && y > x ) {
         parts.splice(x+1, y-x-1, textToSplice);
         fs.writeFileSync(this.filePath, parts.join("\n"), {encoding: 'utf8'});
         return true;
      }
      return false;
   },

   _append: function(textToAppend) {
      fs.appendFileSync(this.filePath, util.format("\n%s\n%s\n%s", this.headerTag, textToAppend, this.footerTag), {encoding: 'utf8'});
   }
};

function grabKeys(list, keyFn) {
   var out = {};
   list.forEach(function(x) {
      var k = keyFn(x);
      out[k] = x;
   });
   return out;
}

module.exports = TaggedBlock;