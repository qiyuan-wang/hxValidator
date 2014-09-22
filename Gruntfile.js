  'use strict';

module.exports = function (grunt) {
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);
  // Show elapsed time at the end.
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> \n' + '* v<%= pkg.version %> \n' +
      '* <%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* <%= pkg.homepage ? " " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed MIT */\n\n\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      jquery: {
        src: ['common/header.js' ,'src/<%= pkg.name %>.js', 'common/footer.js'],
        dest: 'dist/<%= pkg.name %>.<%= pkg.version %>.jquery.js',
      },
      seajs: {
        src: ['seajs/header.js' ,'src/<%= pkg.name %>.js', 'seajs/footer.js'],
        dest: 'dist/<%= pkg.name %>.<%= pkg.version %>.seajs.js',
      },
      pure: {
        src: ['pure/header.js' ,'src/<%= pkg.name %>_pure.js', 'pure/footer.js'],
        dest: 'dist/<%= pkg.name %>.<%= pkg.version %>.js',
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      jquery: {
        src: "<%= concat.jquery.dest %>",
        dest: "dist/<%= pkg.name %>.<%= pkg.version %>.jquery.min.js"
      },
      seajs: {
        src: "<%= concat.seajs.dest %>",
        dest: "dist/<%= pkg.name %>.<%= pkg.version %>.seajs.min.js"
      },
      pure: {
        src: "<%= concat.pure.dest %>",
        dest: "dist/<%= pkg.name %>.<%= pkg.version %>.min.js"
      },
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            'dist/*'
          ]
        }]
      },    
    },
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

  grunt.registerTask('build', [
      'clean:dist',
      'concat',
      'uglify'
  ]);
};
