angular.module('adp.ds.ui.grid.templates', ['templates/gridTable.html', 'templates/paginator.html', 'templates/paging.html', 'templates/pagingSize.html', 'templates/pagingSummary.html', 'templates/sorting.html', 'templates/tableBody.html', 'templates/tableHeader.html']);

angular.module("templates/gridTable.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/gridTable.html",
    "<div>\n" +
    "    <div ds-grid-paging-summary source=\"source\"></div>\n" +
    "    <div ds-grid-paging-size source=\"source\" config=\"config\"></div>\n" +
    "    <div ds-grid-paging ng-model=\"source.pageIndex\" source=\"source\"></div>\n" +
    "</div>\n" +
    "<table>\n" +
    "    <thead ds-grid-header config=\"config\" source=\"source\"></thead>\n" +
    "    <tbody ds-grid-body columns=\"config.columns\" source=\"source\" templates=\"templates\"></tbody>\n" +
    "</table>\n" +
    "<div ng-hide=\"true\" ng-transclude></div>");
}]);

angular.module("templates/paginator.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/paginator.html",
    "<div>\n" +
    "    <a href=\"javascript:void(0)\" ng-click=\"model.previousPage()\">Prev</a>\n" +
    "    <a href=\"javascript:void(0)\" ng-click=\"model.nextPage()\">Next</a>\n" +
    "</div>");
}]);

angular.module("templates/paging.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/paging.html",
    "<div>\n" +
    "    <a href=\"\" ng-click=\"setPageIndex('prev')\">Prev</a>\n" +
    "    <span>\n" +
    "        <span ng-repeat=\"pageButton in pageButtons\">\n" +
    "            <ng-switch on=\"pageButton.link\">\n" +
    "                <a href=\"\" ng-switch-when=\"true\" \n" +
    "                 ng-click=\"setPageIndex(pageButton.value)\">{{pageButton.display}}</a>\n" +
    "                <span ng-switch-default>{{pageButton.display}}</span>\n" +
    "            </ng-switch>\n" +
    "        </span>\n" +
    "    </span>\n" +
    "    <a href=\"\" ng-click=\"setPageIndex('next')\">Next</a>\n" +
    "</div>");
}]);

angular.module("templates/pagingSize.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/pagingSize.html",
    "<div>\n" +
    "    <div ng-show=\"config.paging.sizes\">\n" +
    "        <span>per page</span>\n" +
    "        <select ng-model=\"source.pageSize\" ds-grid-paging-size-selector\n" +
    "                ng-options=\"size for size in config.paging.sizes\">\n" +
    "        </select>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("templates/pagingSummary.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/pagingSummary.html",
    "<div ng-switch on=\"summary.last\">\n" +
    "    <span ng-switch-when=\"0\"></span>\n" +
    "    <span ng-switch-default>Showing {{summary.rangeStart}} - {{summary.rangeEnd}} of {{summary.last}}</span>\n" +
    "</div>");
}]);

angular.module("templates/sorting.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/sorting.html",
    "<span ng-transclude></span>\n" +
    "<a href=\"javascript:void(0)\">\n" +
    "    <span ng-transclude></span>\n" +
    "    <span class=\"sort\"></span>\n" +
    "</a>");
}]);

angular.module("templates/tableBody.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/tableBody.html",
    "<tr ng-repeat=\"row in source.currentView\">\n" +
    "    <td ng-repeat=\"column in columns\" ds-grid-cell row=\"row\" column=\"column\" templates=\"templates\"></td>\n" +
    "</tr>");
}]);

angular.module("templates/tableHeader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/tableHeader.html",
    "<tr>\n" +
    "    <th ng-repeat=\"column in config.columns\">\n" +
    "        <ds-grid-sorting ng-model=\"source.sortFields\" column=\"column\" mode=\"config.sorting.mode\">\n" +
    "            {{column.title}}\n" +
    "        </ds-grid-sorting>\n" +
    "    </th>\n" +
    "</tr>");
}]);
