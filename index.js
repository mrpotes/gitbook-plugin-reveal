var swig = require('swig');
var _ = require('lodash');
var marked = require('marked');
var path = require('path');
var classHtmlAttribute = /class=['"](.+)['"]/;
var tpl = swig.compileFile(path.resolve(path.dirname(module.filename), 'reveal.html'));


function revealContent(_page) {
  _.each(_page.sections, function(section) {
    var revealCount = 1;
    var nodes = marked.lexer(section.content);
    var revealNodes = _.filter(nodes, function(n) {
        if (n.type !== 'html') return false;
        var text = n.text.substring(0, n.text.indexOf(">")),
            classAttr = classHtmlAttribute.exec(text);
        return classAttr && classAttr[1] === 'reveal';
    });

    _.each(revealNodes, function(n) {
      var body = marked.lexer(n.text.substring(n.text.indexOf('>') + 1, n.text.lastIndexOf('<')));
      var reveals = [], revealNodes = [], revealTitle = body[0].text;
      for (var i = 0; i < body.length; i++) {
        if (body[i].type !== 'hr') {
          revealNodes.push(body[i]);
        }
        if (body[i].type === 'hr' || i === body.length - 1) {
          revealNodes = _.toArray(revealNodes);
          revealNodes.links = {};
          reveals.push({
            title: revealTitle,
            id: section.id + "-" + revealCount + "-" + reveals.length,
            content: marked.parser(revealNodes)
          });

          if (i !== body.length - 1) {
            revealTitle = body[++i].text;
            revealNodes = [body[i]];
          }
        }
      }
      section.content = section.content.replace(n.text, tpl({ reveals: reveals }));
      revealCount++;
    });
  });
  return _page;
}

module.exports = {
  book: {
    assets: "./book",
    js: [ "reveal.js" ],
    css: [ "reveal.css" ]
  },
  hooks: {
    'page': revealContent
  }
};
