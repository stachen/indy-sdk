var fs = require('fs')
var path = require('path')
var apiFunctions = require('./apiFunctions')

var OUT_FILE = path.resolve(__dirname, '../src/index.js')

var js = ''

js += `// NOTE: this file is generated by codegen/js.js

var capi = require('bindings')('indynodejs')
var wrapIndyCallback = require('./wrapIndyCallback')

function jsonify (val) {
  if (val === null || val === void 0) {
    return null
  }
  if (typeof val === 'string') {
    return val
  }
  return JSON.stringify(val)
}

var indy = {}

`

apiFunctions.forEach(function (fn) {
  js += 'indy.' + fn.jsName + ' = function ' + fn.jsName + ' ('
  fn.jsParams.forEach(function (arg) {
    js += arg.jsName + ', '
  })
  js += 'cb) {\n'
  js += '  cb = wrapIndyCallback(cb'
  if (fn.jsCbParams.length === 1 && fn.jsCbParams[0].json) {
    js += ', true'
  }
  js += ')\n'
  js += '  capi.' + fn.jsName + '('
  fn.jsParams.forEach(function (arg) {
    if (arg.json) {
      js += 'jsonify(' + arg.jsName + '), '
    } else {
      js += arg.jsName + ', '
    }
  })
  js += 'cb)\n'
  js += '  return cb.promise\n'
  js += '}\n\n'
})

js += 'module.exports = indy\n'

fs.writeFileSync(OUT_FILE, js, 'utf8')
