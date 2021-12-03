"use strict";

/* Expose. */
module.exports = image;

var defaultInlineMatcher = function defaultInlineMatcher(node, parent) {
  return parent.type === 'paragraph' && parent.children.length - 1 || parent.type === 'heading';
};

var defaultMacro = function defaultMacro(node) {
  /*
  Note that MDAST `Image` nodes don't have a `width` property.
  You might still want to specify a width since \includegraphics handles it.
  */
  var width = node.width ? "[width=".concat(node.width, "]") : '';
  return "\\includegraphics".concat(width, "{").concat(node.url, "}");
};

var defaultInline = defaultMacro;

function image(ctx, node, _, parent) {
  var options = ctx.image || {};
  /*
  LaTeX cannot handle remote images, only local ones.
  \includegraphics crashes with filenames that contain more than one `.`,
  the workaround is \includegraphics{/path/to/{image.foo}.jpg}
  */

  if (node.url) {
    var pathParts = node.url.split('/');
    var filename = pathParts.pop();

    if (filename.includes('.')) {
      var filenameParts = filename.split('.');
      var extension = filenameParts.pop();
      var basename = filenameParts.join('.');
      var safeBasename = basename.includes('.') ? "{".concat(basename, "}.").concat(extension) : "".concat(basename, ".").concat(extension);
      pathParts.push(safeBasename);
      node.url = "".concat(pathParts.join('/'));
    }
  }

  var macro = options.image ? options.image : defaultMacro;
  var inlineMatcher = options.inlineMatcher ? options.inlineMatcher : defaultInlineMatcher;

  if (inlineMatcher(node, parent)) {
    macro = options.inlineImage ? options.inlineImage : defaultInline;
  }

  return macro(node);
}