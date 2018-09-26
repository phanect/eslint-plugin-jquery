'use strict'

const utils = require('./utils.js')

module.exports = {
  meta: {
    fixable: 'code'
  },
  create: function(context) {
    return {
      CallExpression: function(node) {
        if (node.callee.type !== 'MemberExpression') return
        if (node.callee.property.name !== 'attr') return

        if (utils.isjQuery(node)) {
          const getOrSet = node.arguments.length === 2 ? 'set' : 'get'
          context.report({
            node: node,
            message: `Prefer ${getOrSet}Attribute to $.attr`
          })
        }
      }
    }
  }
}

module.exports.schema = []
