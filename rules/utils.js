'use strict'

const eslint = require('eslint')

function traverse(node) {
  while (node) {
    switch (node.type) {
      case 'CallExpression':
        node = node.callee
        break
      case 'MemberExpression':
        node = node.object
        break
      case 'Identifier':
        return node
      default:
        return null
    }
  }
}

// Traverses from a node up to its root parent to determine if it
// originated from a jQuery `$()` function.
//
// node - The CallExpression node to start the traversal.
//
// Examples
//
//   // $('div').find('p').first()
//   isjQuery(firstNode) // => true
//
// Returns true if the function call node is attached to a jQuery element set.
function isjQuery(node) {
  const id = traverse(node)
  return id && id.name.startsWith('$')
}

function indent(code) {
  return new eslint.Linter().verifyAndFix(code.trim(), {
    env: {
      node: true,
      es6: true
    },
    parserOptions: {
      ecmaVersion: 2018
    },
    rules: {
      indent: ['error', 2],
      'no-trailing-spaces': 'error'
    }
  }).output
}

module.exports = {
  traverse: traverse,
  isjQuery: isjQuery,
  indent: indent
}
