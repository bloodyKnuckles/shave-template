var vText = require('virtual-dom/vnode/vtext')
var vTSel = require('vtree-select')
var vToHTML = require('vdom-to-html')
var vdom = require('vdom-virtualize')
//var h2VD = require('virtual-html') // replace vdom-virtualize ??

module.exports = function (templates, contentvars) {
  var vt
  if ( Array.isArray(templates) ) {
    if ( 1 < templates.length ) {
      var start = templates.reverse().shift()
      vt = templates.reduce(function(prev, next) {
        var ret = vdom.fromHTML(next)
        var tar = vTSel('.template')(ret)
        if ( tar ) {
          tar[0].children = prev.children
        }
        else { console.log('Template selector not found.') }
        return ret.children[1]
      }, vdom.fromHTML(start).children[1]) // vdom.fromHTML wraps it in HTML/HEAD/BODY tags
      vt = vdom.fromHTML(vToHTML(vt)).children[1] // fixes glitch adding children (prev)
      vt.tagName = 'DIV' // change BODY tag (grabbed in children[1]) to DIV 
    }
    else { vt = vdom.fromHTML(templates[0]) }
  }
  else {
    vt = vdom.fromHTML(templates)
  }
  Object.keys(contentvars).forEach(function (sel) {
    var value = contentvars[sel]
    var target = vTSel(sel)(vt)
    if ( target ) {
      target = target[0]
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
              var subtmpl = vdom.fromHTML(vToHTML(vTSel(mapkey)(target)[0])).children[1].children[0] // how else to clone?
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
    else { console.log('Selector not found.') }
  })
  return vt
}
