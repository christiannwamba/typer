(function() {
  'use strict';

  angular
  .module('typer', [])
  .directive('typer', Typer);

  /**
   * Angular directive to simulate someone typing out a list of words
   */
  function Typer() {

    return {
      template:'<span ng-class="{typer__cursor : cursor}">{{words[0]}}</span>',
      scope: {
        words: '=',
        repeat: '=?',
        cursor: '=?',
        startDelay: '@',
        pause: '@',
        typeTime: '@',
        backspaceTime: '@',
        highlightBackground: '@',
        highlightColor: '@',
        onTyped: '&',
        onComplete: '&',
        onDeleted: '&'
      },
      link: link,
      replace: true
    };

    /**
     * set up the default options and start the typing effect
     * @param  {Object} scope
     * @param  {Object} elem
     * @param  {Object} attr
     */
    function link(scope, elem, attr) {
      var el = angular.element(elem[0]);

      // override default settings if set on the attribute
      var config = {};
      config.repeat = (!scope.repeat) ? scope.repeat : true;

      // config.cursor = (!scope.cursor) ? true : scope.cursor;
      config.words = scope.words;
      config.wordCount = config.words.length;
      config.count = 0;
      config.startDelay = scope.startDelay || 500;
      config.pause = scope.pause || 1000;
      config.typeTime = scope.typeTime || 250;
      config.backspaceTime = scope.backspaceTime || config.typeTime;
      config.onTyped = scope.onTyped;
      config.onDeleted = scope.onDeleted;
      config.onComplete = scope.onComplete;

      // if a highligh color is set create and store the highlight settings
      if (scope.highlightBackground) {
        config.highlight = {};
        config.highlight.background = scope.highlightBackground;
        config.highlight.color = scope.highlightColor || '#FFFFFF';
        config.highlight.speed = config.backspaceTime;
      }

      config.timer = null;

      setTimeout(function() {
        if (config.highlight) {
          config.span = createSpan(el, config);
          highlight(el, config);
        } else {
          backspace(el, config);
        }
      }, config.startDelay);

    }

    function type(element, config) {
      var word = config.words[config.count];
      var letters = word.length;
      var index = 0;
      var fn;

      config.timer = setInterval(function() {
        element.html(word.substring(0, index + 1));

        if (++index === letters) {

          // if last word and repeat is false
          // call complete function
          if (config.count === config.wordCount - 1 && !config.repeat) {
            config.onComplete();

            // clear timer and call complete function
            return;
          }

          config.onTyped();
          fn = (config.highlight) ? highlight : backspace;
          nextAction(element, config, fn);
        }

      }, config.typeTime);

    }

    function backspace(element, config) {
      var word = config.words[config.count];
      var letters = word.length;

      config.timer = setInterval(function() {

        element.html(word.substring(0, letters - 1));

        if (--letters === 0) {

          // reset count if end of word array
          config.count =  (config.count === config.wordCount - 1) ? 0 : config.count + 1;

          config.onDeleted();

          nextAction(element, config, type);
        }

      }, config.backspaceTime);
    }

    function highlight(element, config) {
      var word = config.words[config.count];
      var letters = word.length;
      var index = 0;

      config.timer = setInterval(function() {

        element.html(word.substring(0, letters - 1));
        config.span.html(word.substring(letters - 1));

        if (--letters === 0) {

          setTimeout(function() {
            config.span.html('');
          }, config.pause);

          // reset count if end of word array
          config.count =  (config.count === config.wordCount - 1) ? 0 : config.count + 1;

          config.onDeleted();
          nextAction(element, config, type);
        }

      }, config.highlight.speed / letters);

    }

    /**
     * [createSpan description]
     * @param  {[type]} element [description]
     * @param  {[type]} config  [description]
     * @return {[type]}         [description]
     */
    function createSpan(element, config) {
      var span = angular.element('<span></span>');

      span.css({
        backgroundColor: config.highlight.background,
        color: config.highlight.color
      });

      element.after(span);

      return span;
    }

    /**
     * clear timer and reset timer and then set
     * @param  {[type]}   element [description]
     * @param  {[type]}   config  [description]
     * @param  {Function} fn      [description]
     * @return {[type]}           [description]
     */
    function nextAction(element, config, fn) {
      clearInterval(config.timer);
      config.timer = null;
      config.timer = setTimeout(function() {
        fn(element, config);
      }, config.pause);
    }

  }

})();
