var vText = require('virtual-dom/vnode/vtext')
var vTSel = require('vtree-select')
var vToHTML = require('vdom-to-html')
var vdom = require('vdom-virtualize')
//var h2VD = require('virtual-html') // replace vdom-virtualize ??

module.exports = function (template, contentvars) {
  vt = vdom.fromHTML(template)
  Object.keys(contentvars).forEach(function (sel) {
    var value = contentvars[sel]
    var target = vTSel(sel)(vt)[0]

    if ( target ) {
      if ( 'string' === typeof value || 'number' === typeof value ) {
        target.children = [new vText(value)]
      }
      else if ( 'object' === typeof value  ) {
        Object.keys(value).forEach(function (prop) {
          var targetprops = target.properties.attributes
          var valprop = value[prop]
          if ( '_html' === prop ) {
            target.children = [new vText(valprop)]
          }
          else if ( '_append' === prop ) {
            target.children.push(new vText(valprop))
          }
          else if ( '_prepend' === prop ) {
            target.children.unshift(new vText(valprop))
          }
          else if (/^_map/.test(prop) && 'object' === typeof valprop && null !== valprop ) {
            Object.keys(valprop).forEach(function (mapkey) {
              var subtmpl = vdom.fromHTML(vToHTML(vTSel(mapkey)(target)[0])).children[1].children[0]
              if ( '_map' === prop ) { target.children = [] }
              valprop[mapkey].forEach(function (cvars) {
                var mapd
                if ( 'string' === typeof cvars ) {
                  subtmpl.children = [new vText(cvars)]
                  mapd = vdom.fromHTML(vToHTML(subtmpl)).children[1].children[0]
                }
                else if ( 'object' === typeof cvars ) {
                  mapd = vDT(subtmpl, cvars)
                }
                switch ( prop ) {
                  case '_mapprepend': target.children.unshift(mapd); break
                  default: target.children.push(mapd); break
                }
              })
            })
          }
          else {
            if ( 'class' === prop || 'id' === prop || (/^on/.test(prop) && 'function' === typeof valprop) ) {
              targetprops = target.properties
              if ( 'class' === prop ) { prop = 'className' }
            }
            var cur = targetprops[prop] || ''
            if ( valprop && 'object' === typeof valprop && null !== valprop ) {
              if ( valprop.append ) { cur += valprop.append }
              else if ( valprop.prepend ) { cur = valprop.prepend + cur }
            }
            else { cur = valprop }
              targetprops[prop] = cur
          }
        })
      }
      else if ( 'function' === typeof value ) {
        target.children[0].text = value(target.children[0].text)
      }
    } // end if target
  })
  return vt
}
