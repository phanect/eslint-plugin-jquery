'use strict'

const indent = require('./utils').indent

module.exports = {
  meta: {
    fixable: 'code'
  },
  create: function(context) {
    return {
      CallExpression: function(node) {
        if (node.callee.type !== 'MemberExpression') return
        if (node.callee.object.name !== '$') return

        const name = node.callee.property.name,
          message = `Prefer fetch to $.${name}`

        switch (name) {
          case 'ajax':
            context.report({
              node: node,
              message: message,
              fix: function(fixer) {
                const fetchOptions = {}
                let urlToken,
                  settingsToken,
                  codeOnSuccess = '',
                  codeOnError = '',
                  codeOnComplete = ''

                // Get arguments
                if (node.arguments[0].type === 'Literal') {
                  urlToken = node.arguments[0]
                } else if (node.arguments[0].type === 'ObjectExpression') {
                  settingsToken = node.arguments[0]
                } else {
                  return null
                }

                if (
                  node.arguments[1] &&
                  node.arguments[1].type === 'ObjectExpression'
                ) {
                  settingsToken = node.arguments[1]
                } else if (node.arguments[1]) {
                  // node.arguments[1] exists but not ObjectExpression
                  return null
                }

                // Process settins
                if (settingsToken) {
                  const src = context.getSourceCode()

                  for (const prop of settingsToken.properties) {
                    switch (prop.key.name) {
                      case 'accepts':
                        if (!fetchOptions.headers) {
                          fetchOptions.headers = {}
                        }

                        fetchOptions.headers.Accept = prop.value.properties
                          .map(mimeType => mimeType.value.value)
                          .join(', ')
                        break
                      case 'success':
                        codeOnSuccess = prop.value.body.body
                          .map(line => src.getText(line))
                          .join('\n')
                        break
                      case 'error':
                        codeOnError = prop.value.body.body
                          .map(line => src.getText(line))
                          .join('\n')
                        break
                      case 'complete':
                        codeOnComplete = prop.value.body.body
                          .map(line => src.getText(line))
                          .join('\n')
                        break
                    }
                  }
                }

                return fixer.replaceText(
                  node,
                  indent(
                    `
                    (async () => { // TODO Remove this IIFE if this code is inside async function.
                      try {
                        const res = await fetch("${
                          urlToken.value
                        }", ${JSON.stringify(fetchOptions, null, 2)});

                        if (400 <= res.status) {
                          throw new Error();
                        }
                        ${codeOnSuccess}
                      } catch (err) {
                        ${codeOnError}
                      }

                      ${codeOnComplete}
                    })();
                    `
                  )
                )
              }
            })
            break
          case 'get':
          case 'getJSON':
          case 'getScript':
          case 'post':
            context.report({
              node: node,
              message: message,
              fix: function(fixer) {
                return fixer.replaceText(
                  node,
                  `
                  fetch("", {
                    method: "POST",
                  })
                  `.trim()
                )
              }
            })
        }
      }
    }
  }
}

module.exports.schema = []
