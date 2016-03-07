# shave-template

Content injection is accomplished by targeting standard HTML tag names and CSS selectors.

This module allows you to develop plain HTML/CSS templates with dummy data in the places dynamic
data will be inserted. The benefit is that the templates can be developed independently from the
programming that dynamically inserts data into the web page.

You can also use this module to build dynamic lists and tables. The module can be directed to a
portion of the provided template, such as a list item or a table row. It will then use it as a
sub-template to be duplicated and  populated with dynamic data for each member of an array.

It also provides for layering templates. For example, you can have one template for the entire site
that is used on every page, one template for each section that is used throughout it's own section,
one template for each sub-section used on each page in it's particular sub-seciton, and one template
for each page.

In other words, the page template can be wrapped by a sub-section template, those together can be
wrapped by a section template, and those can be wrapped by a site template.

The number of nested template layers is unlimited.

Once it compiles the templates you've listed, this module applies an object you've provided that
identifies HTML tag names and CSS selectors as key names paired with values and replaces (or
appends/prepends) the default content of the elements in the templates that are identified by the
corresponding CSS selectors.

This module returns a virtual-dom object useful for DOM-diffing.

### example

```
var fs = require('fs')
var main = require('main-loop')
var shaved = require('shave-template')

var button = fs.readFileSync('public/button.html', 'utf-8')

var loop = main({ n: 0 }, render, require('virtual-dom'))
document.querySelector('#content').appendChild(loop.target)

function render (state) {
  return shaved(template, {
    '#count': state.n,
    'button': {onclick: onclick}
  })
  function onclick () {
    loop.update({ n: state.n + 1 })
  }
}
```

button.html

```
    <h1>clicked <span id="count">0</span> times</h1>
    <button>click me!</button>
```

index.html

```
<!doctype html>
<html>
  <body>
    <div id="content"></div>
    <script src="bundle.js"></script>
  </body>
</html>
```

Execute `npm run build` or `browserify -t brfs examples/index.js > examples/public/bundle.js` to compile the example code, then load the index.html file in a browser.

### license

MIT
