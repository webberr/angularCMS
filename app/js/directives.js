'use strict';

/* Directives */


angular.module('angularCMS.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('', []);
