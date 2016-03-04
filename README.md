# shave-template

Content injection is accomplished using standard HTML tag names and CSS selectors.

This module allows you to develop plain HTML/CSS templates with dummy data in the places dynamic
data will be inserted. The benefit is that the templates can be developed independently from the
programming that dynamically inserts data into the web page.

You can also use this module to build dynamic lists and tables. The module can be directed to a
portion of the provided template, such as a list item or a table row. It will then use it as a
sub-template to be duplicated and  populated with dynamic data for each member of an array.

This module returns a virtual-dom object useful for DOM-diffing.

### license

MIT
