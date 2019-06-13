module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-docco');
  //grunt.loadNpmTasks('grunt-karma');

  var renameToCompiled = function(dest, src, config) {
    return dest +  src.substring(0,src.lastIndexOf(".")) + config.ext;
  }

  var appFiles = {
    coffee: {
      expand: true,
      cwd: 'src/coffee/',
      src: ['**/*.coffee'],
      dest: 'src/js/',
      ext: '.js',
      rename: renameToCompiled
    },
    docs: {
      expand: true,
      src: ['src/coffee/**/*.coffee', 'src/coffee/**/*.md', 'src/docs/**/*.md'],
      options: {
        layout: 'linear',
        output: 'docs/'
      }
    },
    js: {
      expand: true,
      flatten: false,
      cwd: 'src/js/',
      src: ['**/*.js', "!libs/**"],
      dest: 'dist/js/'
    },
    less: {
      expand: true,
      flatten: false,
      cwd: 'src/less/',
      src: ['**/*.less'],
      dest: 'src/css/',
      ext: '.css',
      rename: renameToCompiled
    },
    css: {
      expand: true,
      flatten: false,
      cwd: 'src/css/',
      src: ['**/*.css'],
      dest: 'dist/css/'
    },
    any: {
      expand: true,
      cwd: 'src/',
      src: ['images/**', 'img/**', 'libs/**', 'NetHelp/**', 'templates/**', '*.html', '*.ico', '*.json', 'js/**'],
      dest: 'dist/',
      filter: 'isFile'
    }
  };

  appFiles.watch = {
    coffee: appFiles.coffee.cwd + appFiles.coffee.src,
    less: appFiles.less.cwd + appFiles.less.src
  };

  // Project configuration.
  grunt.initConfig({
    watch: {
      coffee: {
        files: [appFiles.watch.coffee],
        tasks : ['coffee'],
        options: {
          spawn: false
        }
      },
      less: {
        files: [appFiles.watch.less],
        tasks : ['less:dev'],
        options: {
          spawn: false
        }
      }
    }, 
 
    coffee: {
      compile : {
        options: {
          bare: true,
          preserve_dirs: true,
          sourceMap: false
        },     
        files: [appFiles.coffee]
      }      
    },

    uglify: {
      dist: {
        files: [appFiles.js]
      }
    }, 

    less: {
      dev: {
        options: {
          dumpLineNumbers: 'all'
        },
        files: [appFiles.less]
      },
      production: {
        files: [appFiles.less]
      }
    },

    cssmin: {
      minify: {
        files: [appFiles.css]
      }
    },

    copy: {
      main: {
        files: [appFiles.any]
      }
    },
    docco: {
      docs: appFiles.docs
    }
    /*karma: {
      unit : {
        configFile: 'karma.conf.js'
      }
    } */ 

  });


  grunt.event.on('watch', function(action, filepath, target) {
    var configs = grunt.util._.extend({}, appFiles[target]);
    configs.src = filepath.substring(configs.cwd.length);
    destFile = renameToCompiled(configs.dest, configs.src, configs);

    if (action == 'deleted')
    {
      grunt.file.delete(destFile);
      grunt.log.ok('File "'+ destFile +'" deleted.')
    }
    else
      switch (target)
      {
        case "coffee":
          grunt.config('coffee.compile.files', [configs] );
          break;
        case "less":
          grunt.config('less.dev.files', [configs] );
          break;      
      }
  });


  // grunt.registerTask('env', 'Configura arquivos para ambiente de acordo', function(environment)
  // {
  //   var envConfig, app, version, indexHtml, path = require("path");

  //   grunt.log.ok("Iniciando configuração de ambiente... ");

  //   // Obtém o diretório do Projeto
  //   app = path.basename(__dirname).toLowerCase().substring(6);

  //   // Lê o arquivo de configurações
  //   envConfig = grunt.file.readJSON('src/environments.json');

  //   // Lê o init.js.exemplo, modelo a ser utilizado
  //   indexHtml = grunt.file.read("src/index.html.template");

  //   version = (new Date()).getTime()
  //   url = envConfig[environment]["static"].trim()

  //   // Injeta no modelo as informações obtidas do arquivo de configurações
  //   indexHtml = grunt.util._.template(indexHtml, {url: url, environment: environment, version: version});

  //   // Salva init.js compilado no arquivo de distribuição final
  //   grunt.file.write("dist/index.html", indexHtml);

  //   grunt.log.ok("Arquivo 'dist/index.html' reescrito");
  // });

  grunt.registerTask('dev',         ['coffee', 'less:dev', /*'karma',*/ 'cssmin', 'uglify', 'copy', 'env:development']);
  grunt.registerTask('development', ['coffee', 'less:dev', /*'karma',*/ 'cssmin', 'uglify', 'copy', 'env:development']);
  grunt.registerTask('test',        ['coffee', 'less:dev', /*'karma',*/ 'cssmin', /*'uglify,'*/ 'copy', 'env:test']);
  grunt.registerTask('production',  ['coffee', 'less',     /*'karma',*/ 'cssmin', 'uglify', 'copy', 'env:production']);
  grunt.registerTask('default', ['coffee', 'less', /*'karma',*/ 'cssmin', 'uglify', 'copy', 'env:production']);

};