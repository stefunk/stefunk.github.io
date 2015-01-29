---
layout: post
title: Build a static site using Grunt, Assemble and Sass
comments: true
---

{% raw %}
I really like static site generators.  
They're easy to use and perfect when you need to set up a bunch of html pages,
without depending on server side languages.
As you can see also this blog is made using Jekyll.

I was working on an simple site for a designer (few pages, no server side
interactions, a lot of photos) and I decided to create a *build&serve*
process using some super hipster technologies aka **AMJAP** (As Much Javascript
As Possible).

## Recipe

We want to create a *simple static site generator* using third-part components, all javascript components.

**Why?** Cause we want full control on the building process, we like to understand how it works and we've got some Sunday evening free time.

**Why not Jekyll?** Cause it's in Ruby.

**Why not to other 9381938 generators in javascript?** Stop with the questions! See my answer @**Why?**

## Ingredients

+ [Grunt](http://gruntjs.com/) is great and I think you know it. Required for automate all the process.
+ [Assemble](http://assemble.io/) is the core ingredient. It will generate the pages using Handlebars.
+ [Sass](http://sass-lang.com/). Maybe the most famous css preprocessor with Less. We will use it as [grunt-contrib-sass](https://github.com/gruntjs/grunt-contrib-sass).


## Preparation method

First, set up the *package.conf* with ```npm init``` and start installing our deps:

```bash
npm install --save-dev grunt
npm install --save-dev assemble
npm install --save-dev grunt-contrib-sass
```

Note that Grunt require the **grunt-cli** to be installed globally:

```bash
npm install -g grunt-cli
```

Second we'll arrange the folder structure:

```
.
+-- layouts
    +-- default.hbs
+-- pages
    +-- index.hbs
    +-- bio.hbs
+-- styles
    +-- base.sass
```

Very simple. The file *default.hbs* will contain the base html code, used in all the pages:

``` html
<!DOCTYPE html>
<html>
  <head>
    <title>{{title}}</title>
    <link rel="stylesheet" href="styles/base.css" />
  </head>
  <body>
    <nav><!-- nav menu --></nav>
    <section>
      <!-- content here -->
      {{> body}}
    </section>
  </body>
</html>
```

The two Handlebars tags ```{{> body}}``` and ```{{title}}``` will help us doing the magic and using this page as a default template.

Now let's have a look on a sample page, e.g. *pages/bio.hbs*:

``` html
---
title: Biography
---

<div class="row">
  <h1>Biography</h1>
  <p><!-- text --></p>
</div>
```

At the top of every page we will put some YAML data, in this case used for fill the ```<title>```
tag.

## The Gruntfile

Now we are ready to automate the process.

``` javascript
// Build the pages to "/site" folder
assemble: {
  site: {
    options: {
      layout: 'default.hbs'
    },
    src: ['pages/*.hbs'],
    dest: './site/'
  }
},
// Compile the .scss files to "/site" folder
sass: {
  dist: {
    files: [{
      expand: true,
      cwd: 'styles',
      src: ['*.scss'],
      dest: './site/pages/css',
      ext: '.css'
    }]
  }
}
```

For sure we can add a simple task to manage all the build process:

``` javascript
grunt.registerTask('build', ['assemble:site', 'sass:dist']);
```

## The secret sauce: create a local dev environment

Now we've got our custom building process, but... we want to setup a minimal server
to access our website, and get all the changes re-builded in real time.

What we need:

+ [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect) to setup a minimal NodeJs server
+ [grunt-connect-rewrite](https://www.npmjs.com/package/grunt-connect-rewrite) to add some rewriting rules (like .htaccess)
+ [grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch) watch for changes and re-build

Here you can see the complete gruntfile:

```javascript
var rewriteRulesSnippet = require("grunt-connect-rewrite/lib/utils")
                          .rewriteRequest;

module.exports = function(grunt) {

  grunt.initConfig({
    assemble: {
      site: {
        options: {
          layout: './layouts/default.hbs'
        },
        src: ['pages/*.hbs'],
        dest: './site/'
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: 'styles',
          src: ['*.scss'],
          dest: './site/pages/css',
          ext: '.css'
        }]
      }
    },
    connect: {
      options: {
        livereload: true,
        port: 9001,
        base: './site/pages/',
      },
      rules: [{
        from: '(^((?!css|html|js|img|fonts|\/$).)*$)',
        to: "$1.html"
      }],
      server: {
        options: {
          middleware: function(connect, options) {
            return [
            rewriteRulesSnippet,
            connect["static"](require("path").resolve(options.base[0]))
            ];
          }
        }
      },
    },
    watch: {
      pages: {
        files: ['pages/*.hbs', 'layouts/*.hbs'],
        tasks: ['assemble:site']
      },
      styles: {
        files: ['styles/*.scss'],
        tasks: ['sass:dist']
      }
    }
  });

  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-connect-rewrite');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['assemble:site', 'sass:dist']);
  grunt.registerTask('serve', [
  'assemble:site',
  'sass:dist',
  'configureRewriteRules',
  'connect:server',
  'watch'
  ]);

};

```

Executing ```grunt serve``` we will find our new website execute on a local NodeJs
server, watching for changes on pages and styles files.

**Last tip**

I add a *configureRewriteRules* task. Adding this we will have a rewriting rules that will
drop the *.html* from all our files. So you can access */bio.html* as */bio*.

For this tip thanks to the related [SO answer](http://stackoverflow.com/questions/19422559/removing-file-extension-using-grunt-contrib-connect-and-grunt-connect-rewrite)
{% endraw %}
