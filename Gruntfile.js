'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    penthouse: {
      extract : {
        outfile : './_includes/critical.css',
        css : './_site/css/main.css',
        url : 'http://localhost:4000',
        width : 1300,
        height : 900
      },
    },

    cssmin: {
      combine: {
        files: {
          './_includes/critical.min.css': ['./_includes/critical.css']
        }
      }
    },

    pagespeed: {
      options: {
        locale: 'en_GB',
        nokey: true,
        url: 'http://stefunk.github.io'
      },
      desktop: {
        options: {
          strategy: 'desktop'
        }
      },
      mobile: {
        options: {
          strategy: 'mobile'
        }
      }
    },

  });

  // Load tasks
  grunt.loadNpmTasks('grunt-penthouse');
  grunt.loadNpmTasks('grunt-pagespeed');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Register tasks
  grunt.registerTask('generate-criticalcss', ['penthouse', 'cssmin']);

};
