(function components() {
  "use strict";
  var components = angular.module('ala.sandbox.components', []);

  components.directive('allowTab', function () {
    return {
      require: 'ngModel',
      link: function(scope, ele, attrs, c) {
        ele.bind('keydown keyup', function(e) {
          var val = this.value;
          if (e.keyCode === 9 && e.type === 'keydown') { // tab was pressed


            // get caret position/selection
            var start = this.selectionStart,
              end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = val.substring(0, start) + '\t' + val.substring(end);

            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 1;

            c.$setValidity('allowTab', true);

            e.preventDefault();

            // prevent the focus lose
            return false;

          }
          else if(e.keyCode !== 9 && e.type === 'keyup') {
            if(val === '') {
              c.$setValidity('allowTab', false);
            }
            else {
              c.$setValidity('allowTab', true);
            }
          }
        });
      }
    }
  });
})();