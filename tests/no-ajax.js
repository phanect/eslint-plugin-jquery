'use strict'

const rule = require('../rules/no-ajax')
const indent = require('../rules/utils').indent
const RuleTester = require('eslint').RuleTester

const ajaxError = 'Prefer fetch to $.ajax'
const getError = 'Prefer fetch to $.get'
const jsonError = 'Prefer fetch to $.getJSON'
const scriptError = 'Prefer fetch to $.getScript'
const postError = 'Prefer fetch to $.post'

const ruleTester = new RuleTester()
ruleTester.run('no-ajax', rule, {
  valid: [
    'ajax()',
    'div.ajax()',
    'div.ajax',

    'get()',
    'div.get()',
    'div.get',

    'getJSON()',
    'div.getJSON()',
    'div.getJSON',

    'getScript()',
    'div.getScript()',
    'div.getScript',

    'post()',
    'div.post()',
    'div.post'
  ],
  invalid: [
    {
      code: `$.ajax("/path/to/file.html")`,
      output: indent(
        `
        (async () => { // TODO Remove this IIFE if this code is inside async function.
          try {
            const res = await fetch("/path/to/file.html", {});

            if (400 <= res.status) {
              throw new Error();
            }

          } catch (err) {

          }


        })();
        `,
        {trim: true}
      ),
      errors: [{message: ajaxError, type: 'CallExpression'}]
    },
    {
      code: `
        $.ajax("/path/to/file.html", {
          accepts: {
            webp: "image/webp",
            json: "application/json"
          }
        })
      `.trim(),
      output: indent(
        `
        (async () => { // TODO Remove this IIFE if this code is inside async function.
          try {
            const res = await fetch("/path/to/file.html", {
              "headers": {
                "Accept": "image/webp, application/json"
              }
            });

            if (400 <= res.status) {
              throw new Error();
            }

          } catch (err) {

          }


        })();
        `,
        {trim: true}
      ),
      errors: [{message: ajaxError, type: 'CallExpression'}]
    },
    {
      // TODO use arguments (such as jqXHR)
      code: indent(`
        $.ajax("/path/to/file.html", {
          success: function(data, textStatus, jqXHR) {
            console.log("success");
            console.log("end");
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.error("error");
          },
          complete: function(jqXHR, textStatus) {
            console.log("complete");
          }
        })
      `),
      output: indent(`
        (async () => { // TODO Remove this IIFE if this code is inside async function.
          try {
            const res = await fetch("/path/to/file.html", {});

            if (400 <= res.status) {
              throw new Error();
            }
            console.log("success");
            console.log("end");
          } catch (err) {
            console.error("error");
          }

          console.log("complete");
        })();
      `),
      errors: [{message: ajaxError, type: 'CallExpression'}]
    },
    {
      code: '$.get()',
      errors: [{message: getError, type: 'CallExpression'}]
    },
    {
      code: '$.getJSON()',
      errors: [{message: jsonError, type: 'CallExpression'}]
    },
    {
      code: '$.getScript()',
      errors: [{message: scriptError, type: 'CallExpression'}]
    },
    {
      code: indent(`
        $.post("ajax/test.html", function(data) {
          console.log(data);
        }).done(function() {
          alert( "second success" );
        })
        .fail(function() {
          alert( "error" );
        })
        .always(function() {
          alert( "finished" );
        });
      `),
      output: `
                  fetch("ajax/test.html", {
                    method: "POST"
                  }).then(function(data) {
                    console.log(data);
                  });
      `.trim(),
      errors: [{message: postError, type: 'CallExpression'}]
    }
  ]
})
