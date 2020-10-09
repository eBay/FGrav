// Karma configuration
// Generated on Fri Oct 09 2020 19:00:22 GMT+0300 (Israel Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'https://code.jquery.com/jquery-3.4.1.min.js',
      // main files - order is important
      'src/main/js/FGrav.js',
      'src/main/js/FGravResponse.js',
      'src/main/js/FGravDraw.js',
      'src/main/js/Collapsed.js',
      'src/main/js/FG.js',
      'src/main/js/color/FG_Color.js',
      'src/main/js/color/FG_Color_Java.js',
      'src/main/js/FGDraw.js',
      'src/main/js/FGStackFrames.js',
      'src/main/js/MergedCollapsed.js',
      'src/main/js/MergedFGDraw.js',
      'src/main/js/MultiFG.js',
      'src/main/js/frame/FG_Filter_Default.js',
      'src/main/js/frame/FG_Filter_Java8.js',
      'src/main/js/frame/FG_Filter_RemoveJavaGCThreads.js',
      'src/main/js/frame/FG_Filter_RemoveThreadFrame.js',
      'src/main/js/CG.js',
      'src/main/js/CGDraw.js',
      'src/main/js/CGEvents.js',


      'node_modules/jasmine-ajax/lib/mock-ajax.js',

      // Spec
      'src/test/js/FGravResponseSpec.js',
      'src/test/js/CollapsedSpec.js',
      'src/test/js/MergedCollapsedSpec.js',
      'src/test/js/FGDrawSpec.js',
      'src/test/js/MergedFGDrawSpec.js',
      'src/test/js/FGSpec.js',
      'src/test/js/color/FG_Color_JavaSpec.js',
      'src/test/js/frame/FG_Filter_Java8Spec.js',
      'src/test/js/frame/FG_Filter_RemoveJavaGCThreadsSpec.js',
      'src/test/js/frame/FG_Filter_RemoveThreadFrameSpec.js',
      'src/test/js/FGravSpec.js',
      'src/test/js/FGravDrawSpec.js',
      'src/test/js/FGStackFramesSpec.js',
      'src/test/js/CGEventsSpec.js'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
