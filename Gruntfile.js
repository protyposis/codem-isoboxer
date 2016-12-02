module.exports = function(grunt) {
  var banner = '/*! <%= pkg.name %> v<%= pkg.version %> <%= licenseUrl %> */\n';
  var boxes = grunt.option('boxes');

  function includeWriteFunctions() {
    return (grunt.option('write') !== false);
  }

  function getDestinationFile() {
    return (boxes ? 'dist/iso_boxer.' + boxes + '.js' : 'dist/iso_boxer.js');
  }
  
  function getDestinationMinifiedFile() {
    if (boxes) {
      var minifiedFile = 'dist/iso_boxer.' + boxes + '.min.js';
      return [{ src: '<%= concat.dist.dest %>', dest: minifiedFile }]
    }
    return { 'dist/iso_boxer.min.js': ['<%= concat.dist.dest %>'] }
  }
  
  function getSourceFiles() {
    var defaultList = ['src/iso_boxer.js', 'src/cursor.js', 'src/iso_file.js', 'src/iso_box.js'];
    if (!boxes) {
      return defaultList.concat(['src/boxes/*.js']);
    }
    var processors = grunt.file.expand('src/boxes/*.js');
    var boxList = boxes.split(',');
    var files = [];
    boxList.forEach(function(box) {
      var parser = getBoxParserForBox(processors, box);
      if (parser && files.indexOf(parser) == -1) files.push(parser);
    });
    return defaultList.concat(files);
  }

  function getBoxParserForBox(processors, box) {
    var result;
    processors.forEach(function(parser) {
      var providers = parser.split('/').pop().replace('.js', '').split(',');
      if (providers.indexOf(box) != -1) result = parser;
    });
    return result;
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    licenseUrl: 'https://github.com/madebyhiro/codem-isoboxer/blob/master/LICENSE.txt',
    preprocess: {
      options: {
        context : {
          WRITE: includeWriteFunctions()
        }
      },
      inline : {
        src : [ getDestinationFile() ],
        options: {
          inline : true,
          context : {
            WRITE: includeWriteFunctions()
          }
        }
      }
    },
    concat: {
      options: {
        banner: banner,
        separator: '\n'
      },
      dist: {
        src: getSourceFiles(),
        dest: getDestinationFile()
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      dist: {
        files: getDestinationMinifiedFile()
      }
    },
    watch: {
      files: '<%= concat.dist.src %>',
      tasks: ['default']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.registerTask('default', ['concat', 'preprocess', 'uglify']);
};