'use strict';

describe('adp.ds.ui.grid.data', function () {

    beforeEach(module('adp.ds.ui.grid.data'));

    describe('DataSource', function () {
        var dataSourceFactory, rootScope;

        beforeEach(inject(['adp.ds.ui.grid.data.source', '$rootScope', function (factory, $rootScope) {
            rootScope = $rootScope;
            dataSourceFactory = factory;
        }]));

        it('should have the correct defaults', function () {
            var dataSource;
            rootScope.$apply(function () {
                dataSource = dataSourceFactory();
            });
            expect(dataSource.currentView).toEqual([]);
            expect(dataSource.totalRecords).toBe(0);
            expect(dataSource.pageIndex).toBe(0);
            expect(dataSource.pageSize).toBe(25);
            expect(dataSource.sortFields).toEqual([]);
            expect(dataSource.remote.toString()).toBe('function (){}');
            expect(dataSource.events).toEqual([]);
        });

        describe('applyConfig', function () {
            var dataSource, sampleData;
            beforeEach(function () {
                dataSource = dataSourceFactory();
                sampleData = [
                    {name: 'Bob', job: 'Manager', age: 55},
                    {name: 'Sue', job: 'Chef', age: 22},
                    {name: 'Mary', job: 'Teacher', age: 44},
                    {name: 'Butch', job: 'Engineer', age: 33}
                ];
            });

            it('should allow values to be overwritten without affecting others', function () {
                rootScope.$apply(function () {
                    dataSource.applyConfig({currentView: sampleData, totalRecords: 1000});
                });
                expect(dataSource.currentView).toEqual(sampleData);
                expect(dataSource.totalRecords).toBe(1000);
                expect(dataSource.pageSize).toBe(25);
            });
        });

        describe('remote', function () {
            var remote, dataSource;

            beforeEach(function () {
                remote = sinon.stub();
                rootScope.$apply(function () {
                    dataSource = dataSourceFactory({remote: remote});
                });            
            });
            describe('query', function () {

                it('should call the remote function and then apply the result', function () {
                    var params = {searchTerm: 'ford'};
                    remote.returns({totalRecords: 1000});
                    rootScope.$apply(function () {
                        dataSource.query(params);
                    });
                    expect(remote).toHaveBeenCalledOnce();
                    expect(remote.firstCall.args[0]).toBe(params);
                    expect(remote.firstCall.thisValue).toBe(dataSource);

                    expect(dataSource.totalRecords).toBe(1000);
                });

                it('should allow promises to be returned from remote', inject(function ($q) {
                    var deferred = $q.defer();
                    remote.returns(deferred.promise);
                    dataSource.query();

                    expect(dataSource.totalRecords).toBe(0);
                    rootScope.$apply(function () {
                        deferred.resolve({totalRecords: 1000});
                    });
                    expect(dataSource.totalRecords).toBe(1000);
                }));

                it('should reset pageIndex and sortFields automatically', function () {
                    dataSource.pageIndex = 10;
                    dataSource.sortFields = [{field: 'col1', dir: 'asc'}];
                    remote.returns({});

                    dataSource.query();
                    expect(remote.firstCall.args[1]).toBe(true);
                    expect(dataSource.pageIndex).toBe(0);
                    expect(dataSource.sortFields).toEqual([]);
                });

                it('should allow an override to prevent automatically resetting paging and sorting', function () {
                    dataSource.pageIndex = 10;
                    dataSource.sortFields = [{field: 'col1', dir: 'asc'}];
                    remote.returns({});

                    dataSource.query({}, true);
                    expect(remote.firstCall.args[1]).toBe(false);
                    expect(dataSource.pageIndex).toBe(10);
                    expect(dataSource.sortFields).toEqual([{field: 'col1', dir: 'asc'}]);
                });
            });

            describe('update', function () {
                beforeEach(function () {
                    dataSource.pageIndex = 2;
                    dataSource.sortFields = [{field: 'col1', dir: 'asc'}];
                    remote.returns({totalRecords: 3});
                    rootScope.$apply(function () {
                        dataSource.query({search: 'bears'}, true);
                    });
                    rootScope.$apply(function () {
                        dataSource.update();
                    });
                });

                it('should call the remote function and then apply the result', function () {
                    expect(remote).toHaveBeenCalledTwice();
                    expect(remote.secondCall.thisValue).toBe(dataSource);

                    expect(dataSource.totalRecords).toBe(3);
                });

                it('should pass the last query params', function () {
                    expect(remote.secondCall.args[0]).toEqual({search: 'bears'});
                });

                it('should not reset the sortFields', function () {
                    expect(dataSource.sortFields).toEqual([{field: 'col1', dir: 'asc'}]);
                });

                it('should not reset the pageIndex', function () {
                    expect(dataSource.pageIndex).toBe(2);
                });
            });
        });
    });
});
'use strict';

describe('adp.ds.ui.grid.model', function () {

    beforeEach(module('adp.ds.ui.grid.model'));

    describe('GridBaseModel', function () {
        var model, scope;

        beforeEach(inject(['adp.ds.ui.grid.model.base', '$rootScope', function (GridBaseModel, $rootScope) {
            scope = $rootScope;
            model = new GridBaseModel(_.bind(scope.$emit, scope));
        }]));

        describe('config', function () {
            it('should get and set values', function () {
                expect(model.config('myParam')).toBeUndefined();
                expect(model.config('myParam', 'val')).toBe('val');
                expect(model.config('myParam')).toBe('val');
            });

            it('should $emit a "xxxChanged" event', function () {
                var eventSpy = sinon.spy(function (event, model, oldValue) {
                    expect(model.config('myParam')).toBe('new');
                    expect(model.config('otherParam')).toBe('test');
                    expect(oldValue).toBe('old');
                });
                model.config('otherParam', 'test');
                model.config('myParam', 'old');

                scope.$on('myParamChanged', eventSpy);
                model.config('myParam', 'new');
                model.config('otherParam', 'updated');
                
                expect(eventSpy).toHaveBeenCalledOnce();
            });

            it('should not $emit a "xxxChanged event if the value did not change', function () {
                var eventSpy = sinon.spy();
                model.config('myParam', 'val');
                scope.$on('myParamChanged', eventSpy);
                model.config('myParam', 'val');
                expect(eventSpy).not.toHaveBeenCalled();
            });

            it('should allow the change of value to be prevented via the event', function () {
                var cancelChange = sinon.spy(function (event) {
                    event.preventDefault();
                });
                model.config('myParam', 'old');

                scope.$on('myParamChanged', cancelChange);                
                expect(model.config('myParam', 'new')).toBe('old');                
                expect(cancelChange).toHaveBeenCalledOnce();
                expect(model.config('myParam')).toBe('old');                
            });
        });

    });
});
'use strict';

describe('adp.ds.ui.grid.paginator', function () {

    beforeEach(module('adp.ds.ui.grid.paginator'));

    function createTestElement (template, scope) {
        var element = angular.element(template);
        inject(function ($compile) {
            $compile(element)(scope);
        });
        scope.$digest();

        return element;
    }

    function createTestConfig () {
        return {
            paginator: {
                pageSize: 10
            }
        };
    }

    function createTestData () {
        return {
            data: [],
            totalRecords: 345
        };
    }
    
    describe('ds-grid-paginator Directive', function () {
        var element, scope;

        beforeEach(inject(['adp.ds.ui.grid.paginator.model', '$rootScope', function (Paginator, $rootScope) {         
            var gridConfig = createTestConfig(),
                gridData = createTestData();

            scope = $rootScope;
            scope.paginator = new Paginator(gridConfig, gridData, _.bind(scope.$emit, scope));
            element = createTestElement('<ds-grid-paginator model="paginator"></ds-grid-paginator>', scope);
        }]));

        it('should create a div container', function () {
            expect(element.find('div').length).toBe(1);
        });

        describe('Previous / Next', function () {
            var previousLink, nextLink;

            beforeEach(function () {
                var links = element.find('div > a');
                previousLink = angular.element(links.get(0));
                nextLink = angular.element(links.get(1));
            });

            it('should create a "Prev" link', function () {
                expect(previousLink.text()).toBe('Prev');
            });

            it('should create a "Next" link', function () {
                expect(nextLink.text()).toBe('Next');
            });

            it('should change the paginator model when clicked', function () {
                nextLink.click();
                expect(element.scope().model.pageIndex()).toBe(1);
                previousLink.click();
                expect(element.scope().model.pageIndex()).toBe(0);
            });
        });
    });

    describe('Paginator Model', function () {
        var config, data, paginator, scope;

        beforeEach(inject(['adp.ds.ui.grid.paginator.model', '$rootScope', function (Paginator, $rootScope) {
            scope = $rootScope;            
            config = createTestConfig();
            data = createTestData();
            paginator = new Paginator(config.paginator, data, _.bind(scope.$emit, scope));
        }]));
       
        describe('initialize', function () {
            it('should initialize pageIndex to 0', function () {
                expect(paginator.pageIndex()).toBe(0);
            });

            it('should retain the pageSize value', function () {
                expect(paginator.pageSize()).toBe(10);
            });

            it('should return the total record count', function () {
                expect(paginator.totalRecords()).toBe(345);
            });

            it('should allow pageIndex to be specified', inject(['adp.ds.ui.grid.paginator.model', function (Paginator) {
                paginator = new Paginator({pageIndex: 2, pageSize: 10}, data);
                expect(paginator.pageIndex()).toBe(2);
            }]));

            it('should default pageSize to 25 if not specified', inject(['adp.ds.ui.grid.paginator.model', function (Paginator) {
                paginator = new Paginator({}, data);
                expect(paginator.pageSize()).toBe(25);
            }]));            

            it('should default data if not specified', inject(['adp.ds.ui.grid.paginator.model', function (Paginator) {
                paginator = new Paginator({}, null);
                expect(paginator.totalRecords()).toBe(0);
            }]));
        });

        describe('pageIndex', function () {
            it('should not allow page index less than 0', function () {
                expect(paginator.pageIndex(-12)).toBe(0);
                expect(paginator.pageIndex(-1)).toBe(0);
            });

            it('should not allow page index greater than maxPages()', function () {
                expect(paginator.pageIndex(35)).toBe(34);
                expect(paginator.pageIndex(50)).toBe(34);
            });

            it('should allow valid values', function () {
                expect(paginator.pageIndex(0)).toBe(0);
                expect(paginator.pageIndex(15)).toBe(15);
                expect(paginator.pageIndex(34)).toBe(34);
            });
        });

        describe('rowIndex', function () {
            it('should return the correct value based on pageIndex and pageSize', function () {
                expect(paginator.rowIndex()).toBe(0);
                paginator.pageIndex(2);
                expect(paginator.rowIndex()).toBe(20);
            });
        });

        describe('maxPages', function () {
            it('should return the correct number of pages based on total records and page size', inject(['adp.ds.ui.grid.paginator.model', function (Paginator) {
                var testCases = [                    
                    {pageSize: 10, totalRecords: 0, maxPages: 0},
                    {pageSize: 10, totalRecords: 10, maxPages: 1},
                    {pageSize: 10, totalRecords: 9, maxPages: 1},
                    {pageSize: 10, totalRecords: 11, maxPages: 2},
                    {pageSize: 10, totalRecords: 19, maxPages: 2},
                    {pageSize: 10, totalRecords: 20, maxPages: 2},
                    {pageSize: 10, totalRecords: 21, maxPages: 3},
                ];

                _.each(testCases, function (testCase) {
                    paginator = new Paginator({pageSize: testCase.pageSize}, {totalRecords: testCase.totalRecords});
                    expect(paginator.maxPages()).toBe(testCase.maxPages);
                });
            }]));
        });

        describe('nextPage', function () {
            it('should advance pageIndex', function () {
                expect(paginator.nextPage()).toBe(1);
                expect(paginator.pageIndex()).toBe(1);
            });

            it('should not advance past the max page', function () {
                paginator.pageIndex(34);
                expect(paginator.nextPage()).toBe(34);
                expect(paginator.pageIndex()).toBe(34);
            });
        });

        describe('previousPage', function () {
            it('should decrement pageIndex', function () {
                paginator.pageIndex(2);
                expect(paginator.previousPage()).toBe(1);
                expect(paginator.pageIndex()).toBe(1);
            });

            it('should not decrement below 0', function () {
                expect(paginator.previousPage()).toBe(0);
                expect(paginator.pageIndex()).toBe(0);
            });
        });
    });
});
'use strict';

describe('adp.ds.ui.grid.paging', function () {

    beforeEach(module('adp.ds.ui.grid.paging','adp.ds.ui.grid.data'));

    function isCssVisible(element) {
      var display = element.css('display');
      return display !== 'none';
    }

    function createTestElement (template, scope) {
        var element = angular.element(template);
        inject(function ($compile) {
            $compile(element)(scope);
        });
        scope.$digest();

        return element;
    }

    function createDataSource(config) {
        var dataSource;

        inject(['adp.ds.ui.grid.data.source', '$rootScope', function (dataSourceFactory, $rootScope) {
            $rootScope.$apply(function () {
                dataSource = dataSourceFactory(config);
            });
        }]);

        return dataSource;
    }
    
    describe('ds-grid-paging Directive', function () {
        var element, scope, dataSource;

        beforeEach(inject(function ($rootScope) {         
            dataSource = createDataSource({totalRecords: 345, pageSize: 10, pageIndex: 0});

            scope = $rootScope;
            scope.dataSource = dataSource;
            element = createTestElement('<div ds-grid-paging ng-model="dataSource.pageIndex" source="dataSource"></div>', scope);
        }));

        it('should create a div container', function () {
            expect(element.find('div').length).toBe(1);
        });

        describe('change event', function () {
            it('should fire a pageIndexChanged event when the pageIndex changes', function () {
                var eventSpy = sinon.stub();
                scope.$on('pageIndexChanged', eventSpy);
                scope.setPageIndex(5);

                expect(eventSpy).toHaveBeenCalledOnce();
            });
        });

        describe('Previous / Next', function () {
            var previousLink, nextLink;

            beforeEach(function () {
                var links = element.find('div > a');
                previousLink = angular.element(links.get(0));
                nextLink = angular.element(links.get(1));
            });

            it('should create a "Prev" link', function () {
                expect(previousLink.text()).toBe('Prev');
            });

            it('should create a "Next" link', function () {
                expect(nextLink.text()).toBe('Next');
            });

            it('should change the paging model when clicked', function () {
                nextLink.click();
                expect(dataSource.pageIndex).toBe(1);
                previousLink.click();
                expect(dataSource.pageIndex).toBe(0);
            });

            it('should prevent previous link from going below pageIndex 0', function () {
                previousLink.click();
                expect(dataSource.pageIndex).toBe(0);
            });

            it('should prevent next link from going above maxPages', function () {
                scope.$apply(function () {
                    dataSource.pageIndex = 34;
                });
                nextLink.click();
                expect(dataSource.pageIndex).toBe(34);
            });
        });

        describe('Page buttons', function () {
            it('should create the correct page button array', function () {
                var testCases = [ // assumes pageSize === 5
                    {tr: 1, pi: 0, pb: [1]},
                    {tr: 10, pi: 0, pb: [1, 2]},
                    {tr: 10, pi: 1, pb: [1, 2]},
                    {tr: 15, pi: 0, pb: [1, 2, 3]},
                    {tr: 20, pi: 0, pb: [1, 2, 3, 4]},
                    {tr: 25, pi: 0, pb: [1, 2, 3, 4, 5]},
                    {tr: 25, pi: 4, pb: [1, 2, 3, 4, 5]},
                    {tr: 30, pi: 0, pb: [1, 2, 3, 4, 5, 6]},
                    {tr: 35, pi: 0, pb: [1, 2, 3, 4, 5, 6, 7]},
                    {tr: 35, pi: 6, pb: [1, 2, 3, 4, 5, 6, 7]},
                    {tr: 40, pi: 0, pb: [1, 2, 3, 4, 5, '...', 8]},
                    {tr: 40, pi: 1, pb: [1, 2, 3, 4, 5, '...', 8]},
                    {tr: 40, pi: 2, pb: [1, 2, 3, 4, 5, '...', 8]},
                    {tr: 40, pi: 3, pb: [1, 2, 3, 4, 5, '...', 8]},
                    {tr: 40, pi: 4, pb: [1, '...', 4, 5, 6, 7, 8]},
                    {tr: 40, pi: 5, pb: [1, '...', 4, 5, 6, 7, 8]},
                    {tr: 40, pi: 6, pb: [1, '...', 4, 5, 6, 7, 8]},
                    {tr: 40, pi: 7, pb: [1, '...', 4, 5, 6, 7, 8]},
                    {tr: 45, pi: 0, pb: [1, 2, 3, 4, 5, '...', 9]},
                    {tr: 45, pi: 1, pb: [1, 2, 3, 4, 5, '...', 9]},
                    {tr: 45, pi: 2, pb: [1, 2, 3, 4, 5, '...', 9]},
                    {tr: 45, pi: 3, pb: [1, 2, 3, 4, 5, '...', 9]},
                    {tr: 45, pi: 4, pb: [1, '...', 4, 5, 6, '...', 9]},
                    {tr: 45, pi: 5, pb: [1, '...', 5, 6, 7, 8, 9]},
                    {tr: 45, pi: 6, pb: [1, '...', 5, 6, 7, 8, 9]},
                    {tr: 45, pi: 7, pb: [1, '...', 5, 6, 7, 8, 9]},
                    {tr: 45, pi: 8, pb: [1, '...', 5, 6, 7, 8, 9]},
                    {tr: 100, pi: 0, pb: [1, 2, 3, 4, 5, '...', 20]},
                    {tr: 100, pi: 4, pb: [1, '...', 4, 5, 6, '...', 20]},
                    {tr: 100, pi: 9, pb: [1, '...', 9, 10, 11, '...', 20]},
                    {tr: 100, pi: 15, pb: [1, '...', 15, 16, 17, '...', 20]},
                    {tr: 100, pi: 16, pb: [1, '...', 16, 17, 18, 19, 20]}
                ];

                _.each(testCases, function (testCase) {
                    scope.$apply(function () {
                        scope.dataSource.applyConfig({
                            totalRecords: testCase.tr,
                            pageIndex: testCase.pi,
                            pageSize: 5
                        });
                    });

                    // dump(testCase, scope.pageButtons); // uncomment for debugging failures
                    expect(scope.pageButtons.length).toBe(testCase.pb.length);
                    _.each(scope.pageButtons, function (pageButton, index) {
                        expect(pageButton.display).toBe(testCase.pb[index].toString());
                        if (testCase.pb[index] === '...') {
                            expect(pageButton.value).toBeUndefined();
                        } else {
                            expect(pageButton.value).toBe(testCase.pb[index] - 1);
                        }

                        if (pageButton.value === testCase.pi) {
                            expect(pageButton.active).toBe(true);
                        } else if (pageButton.display !== '...') {
                            expect(pageButton.active).toBe(false);
                        }
                    });                
                });
            });

            it('should render the page buttons', function () {
                var pbs = element.find('div > span > span'),
                    testCases = [1, 2, 3, 4, 5, '...', 35];

                _.each(testCases, function (testCase, index) {
                    var pb = angular.element(pbs.get(index)); 
                    if ('...' === testCase) {
                        expect(pb.text().trim()).toBe('...');
                        expect(pb.find('a').length).toBe(0);
                    } else {
                        expect(pb.text().trim()).toBe(testCase.toString());
                        expect(pb.find('a').length).toBe(1);
                    }
                });
            });

            it('should update the page buttons as the pageIndex changes', function () {
                var pbs = element.find('div > span > span'),
                    expected = [1, '...', 4, 5, 6, '...', 35];

                angular.element(pbs.get(4)).find('a').click();
                pbs = element.find('div > span > span');

                _.each(expected, function (testCase, index) {
                    var pb = angular.element(pbs.get(index)); 
                    if ('...' === testCase) {
                        expect(pb.text().trim()).toBe('...');
                        expect(pb.find('a').length).toBe(0);
                    } else {
                        expect(pb.text().trim()).toBe(testCase.toString());
                        expect(pb.find('a').length).toBe(1);
                    }
                });
            });
        });
    });

    describe('ds-grid-paging-summary directive', function () {
        var element, scope, dataSource;

        beforeEach(inject(function ($rootScope) {         
            dataSource = createDataSource({totalRecords: 345, pageSize: 10, pageIndex: 0});

            scope = $rootScope;
            scope.dataSource = dataSource;
            element = createTestElement('<div ds-grid-paging-summary source="dataSource"></div>', scope);
        }));

        it('should show the correct summary for the first page', function () {
            expect(element.find('span').text().trim()).toBe('Showing 1 - 10 of 345');
        });

        it('should update based on a change to page size', function () {            
            scope.$apply(function () {
                scope.dataSource.pageSize = 25;
            });
            expect(element.find('span').text().trim()).toBe('Showing 1 - 25 of 345');
        });

        it('should update based on a change to page index', function () {            
            scope.$apply(function () {
                scope.dataSource.pageIndex = 1;
            });
            expect(element.find('span').text().trim()).toBe('Showing 11 - 20 of 345');
        });

        it('should show the correct summary on the final page', function () {
            scope.$apply(function () {
                scope.dataSource.pageIndex = 34;
            });
            expect(element.find('span').text().trim()).toBe('Showing 341 - 345 of 345');
        });

        it('should update correctly when totalRecords changes', function () {
            scope.$apply(function () {
                scope.dataSource.totalRecords = 5;
            });
            expect(element.find('span').text().trim()).toBe('Showing 1 - 5 of 5');
        });

        it('should not display anything if totalRecords is 0', function () {
            scope.$apply(function () {
                scope.dataSource.totalRecords = 0;
            });
            expect(element.find('span').text().trim()).toBe('');
        });
    });

    describe('ds-grid-paging-size and selector directives', function () {
        var element, scope;

        beforeEach(function () {    
            // This matcher was borrowed from the angular select directive spec        
            this.addMatchers({
                toEqualSelect: function(expected){
                    var actualValues = [],
                        expectedValues = [].slice.call(arguments);

                    angular.forEach(this.actual.find('option'), function(option) {
                      actualValues.push(option.selected ? [option.innerText] : option.innerText);
                    });

                    this.message = function() {
                      return 'Expected ' + angular.toJson(actualValues) + ' to equal ' + angular.toJson(expectedValues) + '.';
                    };

                    return angular.equals(expectedValues, actualValues);
                }
            });
        });

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope;

            scope.dataSource = createDataSource({totalRecords: 345, pageSize: 10, pageIndex: 0});
            scope.gridConfig = {paging: {sizes: [5,10,25,50]}};

            element = createTestElement('<div ds-grid-paging-size source="dataSource" config="gridConfig"></div>', scope);
        }));

        it('should say "per page"', function () {
            expect(isCssVisible(element.find('div > div'))).toBe(true);
            expect(element.find('span').text().trim()).toBe('per page');
        });

        it('should create a select element populated with the size choices', function () {
            expect(element.find('select')).toEqualSelect('5',['10'],'25','50');
        });

        it('should update pageSize when a new size is selected', function () {
            element.find('select').val(0).trigger('change');
            expect(scope.dataSource.pageSize).toBe(5);
        });

        it('should update pageIndex to be the page containing the previous first row', function () {
            scope.$apply(function () {
                scope.dataSource.pageIndex = 10; // rowIndex = 100
            });
            element.find('select').val(3).trigger('change');
            expect(scope.dataSource.pageSize).toBe(50);
            expect(scope.dataSource.pageIndex).toBe(2);
        });
        
        it('should not render when paging sizes are not on the config', function () {
            scope.gridConfig = {};
            element = createTestElement('<div ds-grid-paging-size source="dataSource" config="gridConfig"></div>', scope);
            expect(isCssVisible(element.find('div > div'))).toBe(false);
        });
    });

    describe('Paging Util', function () {
        var config, dataSource, scope, PagingUtil;

        beforeEach(inject(['adp.ds.ui.grid.paging.util', '$rootScope', function (util, $rootScope) {
            scope = $rootScope;            
            dataSource = createDataSource({totalRecords: 345, pageIndex: 0, pageSize: 10});
            PagingUtil = util;
        }]));
       
        describe('validatePageIndex', function () {
            it('should not allow page index less than 0', function () {
                expect(PagingUtil.validatePageIndex(dataSource, -12)).toBe(0);
                expect(PagingUtil.validatePageIndex(dataSource, -1)).toBe(0);
            });

            it('should not allow page index greater than maxPages()', function () {
                expect(PagingUtil.validatePageIndex(dataSource, 35)).toBe(34);
                expect(PagingUtil.validatePageIndex(dataSource, 50)).toBe(34);
            });

            it('should allow valid values', function () {
                expect(PagingUtil.validatePageIndex(dataSource, 0)).toBe(0);
                expect(PagingUtil.validatePageIndex(dataSource, 15)).toBe(15);
                expect(PagingUtil.validatePageIndex(dataSource, 34)).toBe(34);
            });

            it('should return 0 when totalRecords is 0', function () {
                dataSource = createDataSource({totalRecords: 0, pageIndex: 0, pageSize: 10});
                expect(PagingUtil.validatePageIndex(dataSource, 0)).toBe(0);
            });
        });

        describe('rowIndex', function () {
            it('should return the correct value based on pageIndex and pageSize', function () {
                expect(PagingUtil.rowIndex(dataSource)).toBe(0);
                dataSource.pageIndex = 2;
                expect(PagingUtil.rowIndex(dataSource)).toBe(20);
            });
        });

        describe('maxPages', function () {
            it('should return the correct number of pages based on total records and page size', function() {
                var testCases = [                    
                    {pageSize: 10, totalRecords: 0, maxPages: 0},
                    {pageSize: 10, totalRecords: 10, maxPages: 1},
                    {pageSize: 10, totalRecords: 9, maxPages: 1},
                    {pageSize: 10, totalRecords: 11, maxPages: 2},
                    {pageSize: 10, totalRecords: 19, maxPages: 2},
                    {pageSize: 10, totalRecords: 20, maxPages: 2},
                    {pageSize: 10, totalRecords: 21, maxPages: 3},
                ];

                _.each(testCases, function (testCase) {
                    dataSource = createDataSource({pageSize: testCase.pageSize, totalRecords: testCase.totalRecords, pageIndex: 0});
                    expect(PagingUtil.maxPages(dataSource)).toBe(testCase.maxPages);
                });
            });
        });

        describe('pageIndexContainingRow', function () {
            it('should return the page index containing the specified row index with the given page size', function () {
                expect(PagingUtil.pageIndexContainingRow(0, 25)).toBe(0);
                expect(PagingUtil.pageIndexContainingRow(24, 25)).toBe(0);
                expect(PagingUtil.pageIndexContainingRow(25, 25)).toBe(1);                
            });
        });
    });
});
'use strict';

describe('adp.ds.ui.grid.sorting', function () {

    beforeEach(module('adp.ds.ui.grid.sorting','adp.ds.ui.grid.data'));

    function isCssVisible(element) {
      var display = element.css('display');
      return display !== 'none';
    }

    function createTestElement (template, scope) {
        var element = angular.element(template);
        inject(function ($compile) {
            $compile(element)(scope);
        });
        scope.$digest();

        return element;
    }

    function createDataSource(config) {
        var dataSource;

        inject(['adp.ds.ui.grid.data.source', '$rootScope', function (dataSourceFactory, $rootScope) {
            $rootScope.$apply(function () {
                dataSource = dataSourceFactory(config);
            });
        }]);

        return dataSource;
    }

    describe('Sorting Directive', function () {
        var scope, header1, header2, SortingUtil;

        beforeEach(inject(['adp.ds.ui.grid.sorting.util', '$rootScope', function (util, $rootScope) {
            SortingUtil = util;
            scope = $rootScope;
            scope.dataSource = createDataSource({sortFields: []});
            scope.column1 = {field: 'col1', title: 'Column 1'};
            scope.column2 = {field: 'col2', title: 'Column 2'};
            scope.mode = 'single';
            header1 = createTestElement('<ds-grid-sorting ng-model="dataSource.sortFields" column="column1" mode="mode">{{column1.title}}</ds-grid-sorting>', scope);
            header2 = createTestElement('<ds-grid-sorting ng-model="dataSource.sortFields" column="column2" mode="mode">{{column2.title}}</ds-grid-sorting>', scope);
        }]));

        it('should create a span containing the transcluded content', function () {
            var span = angular.element(header1.find('a > span').get(0));
            expect(span.text()).toBe('Column 1');
        });

        it('should create a span containing the sort indicator', function () {
            expect(header1.find('a > span.sort').length).toBe(1);
        });

        it('should not render the link if the mode is not "single" or "multiple"', function () {
            scope.$apply(function () {
                scope.mode = 'blah';
            });

            header1 = createTestElement('<ds-grid-sorting ng-model="dataSource.sortFields" column="column1" mode="mode">{{column1.title}}</ds-grid-sorting>', scope);

            expect(header1.children('span').length).toBe(1);
            expect(header1.children('span').text()).toContain('Column 1');
            expect(isCssVisible(header1.children('span'))).toBe(true);
            expect(header1.children('a').length).toBe(1);
            expect(isCssVisible(header1.children('a'))).toBe(false);
        });

        describe('single mode', function () {
            beforeEach(function () {
                scope.$apply(function () {
                    scope.mode = 'single';
                });
            });

            it('should create a link that toggles sorting on the model', function () {
                header1.find('a').click();
                expect(header1.find('a > span.sort').hasClass('asc')).toBe(true);
                expect(header2.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header2.find('a > span.sort').hasClass('dsc')).toBe(false);
            });

            it('should sort follow toggle logic if clicked multiple times', function () {
                header1.find('a').click();
                header1.find('a').click();
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(true);
                expect(header2.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header2.find('a > span.sort').hasClass('dsc')).toBe(false);                
                header1.find('a').click();
                expect(header1.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(false);
                expect(header2.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header2.find('a > span.sort').hasClass('dsc')).toBe(false);
            });

            it('should only sort on a single column', function () {
                header1.find('a').click();
                header2.find('a').click();
                expect(header2.find('a > span.sort').hasClass('asc')).toBe(true);
                expect(header1.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(false);
            });

            it('should fire a sortFieldsChanged event when clicking a column', function () {
                var eventSpy = sinon.stub();
                scope.$on('sortFieldsChanged', eventSpy);
                header1.find('a').click();
                expect(eventSpy).toHaveBeenCalledOnce();
            });

            it('should maintain the prior sortFields if the event is prevented', function () {
                scope.$on('sortFieldsChanged', function (event) {
                    event.preventDefault();
                });
                header1.find('a').click();
                expect(header1.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(false);
            });

            it('should fire a sortFieldsChanged event event when changing only the direction of sort', function () {
                header1.find('a').click();
                var eventSpy = sinon.stub();
                scope.$on('sortFieldsChanged', eventSpy);
                header1.find('a').click();
                expect(eventSpy).toHaveBeenCalledOnce();
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(true);
            });
        });

        describe('multiple mode', function () {
            beforeEach(function () {
                scope.$apply(function () {
                    scope.mode = 'multiple';
                });
            });

            it('should create a link that toggles sorting on the model', function () {
                header1.find('a').click();
                expect(header1.find('a > span.sort').hasClass('asc')).toBe(true);
                expect(header2.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header2.find('a > span.sort').hasClass('dsc')).toBe(false);
            });

            it('should sort follow toggle logic if clicked multiple times', function () {
                header1.find('a').click();
                header1.find('a').click();
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(true);
                expect(header2.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header2.find('a > span.sort').hasClass('dsc')).toBe(false);
                header1.find('a').click();
                expect(header1.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(false);
                expect(header2.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header2.find('a > span.sort').hasClass('dsc')).toBe(false);
            });

            it('should allow sorts on multiple columns at once', function () {
                header1.find('a').click();
                header2.find('a').click();
                expect(header1.find('a > span.sort').hasClass('asc')).toBe(true);
                expect(header2.find('a > span.sort').hasClass('asc')).toBe(true);
            });

            it('should fire a sortFieldsChanged event when clicking a column', function () {
                var eventSpy = sinon.stub();
                scope.$on('sortFieldsChanged', eventSpy);
                header1.find('a').click();
                expect(eventSpy).toHaveBeenCalledOnce();
            });

            it('should maintain the prior sortFields if the event is prevented', function () {
                scope.$on('sortFieldsChanged', function (event) {
                    event.preventDefault();
                });
                header1.find('a').click();
                expect(header1.find('a > span.sort').hasClass('asc')).toBe(false);
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(false);
            });

            it('should fire a sortFieldsChanged event event when changing only the direction of sort', function () {
                header1.find('a').click();
                var eventSpy = sinon.stub();
                scope.$on('sortFieldsChanged', eventSpy);
                header1.find('a').click();
                expect(eventSpy).toHaveBeenCalledOnce();
                expect(header1.find('a > span.sort').hasClass('dsc')).toBe(true);
            });
        });
        
    });

    describe('Sorting Util', function () {
        var SortingUtil, dataSource;

        beforeEach(inject(['adp.ds.ui.grid.sorting.util', function (util) {
            SortingUtil = util;
            dataSource = createDataSource({sortFields: []});
        }]));

        describe('sort', function () {
            describe('mode === "single"', function () {
                it('should add an entry in the sortFields array', function () {
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'single', {field: 'col1'}, 'asc');
                    expect(dataSource.sortFields).toEqual([{field: 'col1', dir: 'asc'}]);
                });

                it('should overwrite any existing entries in sortFields', function () {
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'single', {field: 'col1'}, 'asc');
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'single', {field: 'col2'}, 'dsc');
                    expect(dataSource.sortFields).toEqual([{field: 'col2', dir: 'dsc'}]);
                });
            });

            describe('mode === "disabled"', function () {
                it('should not update the sortFields array', function () {
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'disabled', {field: 'col1'}, 'asc');
                    expect(dataSource.sortFields).toEqual([]);
                });
            });

            describe('mode ==="multiple"', function () {
                it('should add an entry in the sortFields array', function () {
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'multiple', {field: 'col1'}, 'asc');
                    expect(dataSource.sortFields).toEqual([{field: 'col1', dir: 'asc'}]);
                });

                it('should append additional sort sortFields', function () {
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'multiple', {field: 'col1'}, 'asc');
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'multiple', {field: 'col2'}, 'dsc');
                    expect(dataSource.sortFields).toEqual([
                        {field: 'col1', dir: 'asc'},
                        {field: 'col2', dir: 'dsc'}
                    ]);
                });

                it('should maintain the same position in the array if a field is updated', function () {
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'multiple', {field: 'col1'}, 'asc');
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'multiple', {field: 'col2'}, 'dsc');
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'multiple', {field: 'col1'}, 'dsc');
                    expect(dataSource.sortFields).toEqual([
                        {field: 'col1', dir: 'dsc'},
                        {field: 'col2', dir: 'dsc'}
                    ]);
                });
            });

            describe('column disabled', function () {
                it('should not allow sorting on a column marked with sortable: false', function () {
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'single', {field: 'col1', sortable: false}, 'asc');
                    expect(dataSource.sortFields).toEqual([]);
                });

                it('should allow sorting on a column where sortable is true or not present', function () {
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'single', {field: 'col2', sortable: true}, 'asc');
                    expect(dataSource.sortFields).toEqual([{field: 'col2', dir: 'asc'}]);
                    dataSource.sortFields = SortingUtil.sort(dataSource.sortFields, 'single', {field: 'col1'}, 'asc');
                    expect(dataSource.sortFields).toEqual([{field: 'col1', dir: 'asc'}]);
                });
            });
        });

        describe('toggle', function () {
            var sorting,
                col1 = {field: 'col1'},
                col2 = {field: 'col2'};

            it ('should initially sort ascending', function () {
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'multiple', col1);
                expect(dataSource.sortFields).toEqual([{field: 'col1', dir: 'asc'}]);
            });

            it ('should sort descending a column already sorted ascending', function () {
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'multiple', col1);
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'multiple', col1);
                expect(dataSource.sortFields).toEqual([{field: 'col1', dir: 'dsc'}]);
            });

            it ('should clear the sort of a field already sorted descending', function () {
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'multiple', col1);
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'multiple', col2);
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'multiple', col1);
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'multiple', col1);
                expect(dataSource.sortFields).toEqual([{field: 'col2', dir: 'asc'}]);
            });
        });

        describe('clearSort', function () {
            it('should remove a column from the sortFields array', function () {
                dataSource.sortFields = [{field: 'col1', dir: 'asc'}, {field: 'col2', dir: 'asc'}];
                dataSource.sortFields = SortingUtil.clearSort(dataSource.sortFields, {field: 'col1'});
                expect(dataSource.sortFields).toEqual([{field: 'col2', dir: 'asc'}]);
            });
        });

        describe('find', function () {
            it('should return a field based on field name', function () {
                dataSource.sortFields = [{field: 'col1', dir: 'asc'}, {field: 'col2', dir: 'asc'}];
                expect(SortingUtil.find(dataSource.sortFields, 'col1')).toEqual({field: 'col1', dir: 'asc'});
                expect(SortingUtil.find(dataSource.sortFields, 'col3')).toBeUndefined();
            });
        });

        describe('direction', function () {
            it('should return the current sorting direction for a column', function () {
                var column = {field: 'col1'};

                expect(SortingUtil.direction(dataSource.sortFields, column)).toBeUndefined();
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'single', column);
                expect(SortingUtil.direction(dataSource.sortFields, column)).toBe('asc');
                dataSource.sortFields = SortingUtil.toggle(dataSource.sortFields, 'single', column);
                expect(SortingUtil.direction(dataSource.sortFields, column)).toBe('dsc');
            });
        });
    });
});
'use strict';

describe('adp.ds.ui.grid.table', function () {

    beforeEach(module('adp.ds.ui.grid.table', 'adp.ds.ui.grid.paging', 'adp.ds.ui.grid.data'));

    function createTestElement (template, scope) {
        var element = angular.element(template);
        inject(function ($compile) {
            $compile(element)(scope);
        });
        scope.$digest();

        return element;
    }

    function createTestConfig () {
        return {
            columns: [
                {title: 'Column 1', field: 'col1'},
                {title: 'Column paging', field: 'col2'},
                {title: 'Column 3', field: 'col3'}
            ]
        };
    }

    function createTestData (additionalParams) {
        var dataSource;

        inject(['adp.ds.ui.grid.data.source', function (dataSourceFactory) {
            dataSource = dataSourceFactory(_.extend({
                currentView: [
                    {col1: 'Bob', col2: 'Manager', col3: 55},
                    {col1: 'Sue', col2: 'Chef', col3: 22},
                    {col1: 'Mary', col2: 'Teacher', col3: 44},
                    {col1: 'Butch', col2: 'Engineer', col3: 33}
                ],
                totalRecords: 50
            }, additionalParams));
        }]);

        return dataSource;
    }
    
    describe('ds-grid Directive', function () {
        var element, scope;

        beforeEach(inject(function ($rootScope) {         
            scope = $rootScope;
            scope.gridConfig = createTestConfig();
            scope.gridData = createTestData();
            element = createTestElement('<ds-grid config="gridConfig" source="gridData"></ds-grid>', scope);
        }));

        it('should create a table', function () {
            var table = element.find('table');
            expect(table.length).toBe(1);
        });

        it('should create a thead within the table containing the ds-grid-header directive', function () {
            var thead = element.find('table thead');
            expect(thead.length).toBe(1);
            expect(thead.attr('ds-grid-header')).toBe('');
            expect(thead.attr('config')).toBe('config');
        });

        it('should create a tbody within the table containing the ds-grid-body directive', function () {
            var thead = element.find('table tbody');
            expect(thead.length).toBe(1);
            expect(thead.attr('ds-grid-body')).toBe('');
            expect(thead.attr('columns')).toBe('config.columns');
            expect(thead.attr('source')).toBe('source');
        });
    });

    describe('ds-grid-header Directive', function () {
        var element, scope;

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope;
            scope.config = createTestConfig();
            element = createTestElement('<thead ds-grid-header config="config"></thead>', scope);
        }));

        it('should create a row in the header', function () {
            var row = element.find('tr');
            expect(row.length).toBe(1);
        });

        it('should create header columns for each column in the config', function () {
            var headers = element.find('tr th');
            expect(headers.length).toBe(scope.config.columns.length);
        });

        it('should use the title attribute as the displayable for columns and show them in array order', function () {
            var i, headers = element.find('tr > th');

            for(i = 0; i < scope.config.columns.length; i++) {
                expect(angular.element(headers.get(i)).text()).toContain(scope.config.columns[i].title);
            }
        });
    });

    describe('ds-grid-body Directive', function () {
        var element, scope;

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope;
            scope.config = createTestConfig();
            scope.gridData = createTestData();
            element = createTestElement('<tbody ds-grid-body columns="config.columns" source="gridData"></tbody>', scope);
        }));

        it('should create a row for each item in the data array', function () {
            var rows = element.find('tr');
            expect(rows.length).toBe(scope.gridData.currentView.length);
        });

        it('should create a column in each row for each column in the config', function () {
            element.find('tr').each(function () {
                expect(angular.element(this).find('td').length).toBe(scope.config.columns.length);
            });
        });

        it('should populate the table based on the field attribute in the column config', function () {
            element.find('tr').each(function (rowIndex) {
                var rowData = scope.gridData.currentView[rowIndex];

                angular.element(this).find('td').each(function (colIndex) {
                    var columnData = rowData[scope.config.columns[colIndex].field].toString();
                    expect(angular.element(this).text()).toBe(columnData);
                });
            });
        });
    });

    describe('ds-globalize Filter', function () {
        it('should use globalize.js to apply formats', inject(function ($filter) {
            expect($filter('dsGlobalize')(123.456, 'c')).toBe('$123.46');
        }));
    });

    describe('ds-grid-cell Directive', function () {
        var element, scope;

        describe('default behavior', function () {
            beforeEach(inject(function ($rootScope) {
                scope = $rootScope;
                scope.row = {col1: 'aaa', col2: 'bbb'};
                scope.column = {field: 'col1'};
                element = createTestElement('<td row="row" column="column" ds-grid-cell></td>', scope);
            }));

            it('should contain the correct value from the row data', function () {
                expect(element.text().trim()).toBe('aaa');
            });

            it('should update the cell if the underlying data changes', function () {
                scope.row.col1 = 'ccc';
                scope.$apply();
                expect(element.text().trim()).toBe('ccc');
            });
        });

        describe('template behavior', function () {
            beforeEach(inject(function ($rootScope) {
                scope = $rootScope;
                scope.row = {col1: 'aaa', col2: 'bbb'};
                scope.column = {template: '<div class="butch">{{row.col1}}</div>'};
                element = createTestElement('<td row="row" column="column" ds-grid-cell></td>', scope);
            }));

            it('should contain the correct row data rendered through the template', function () {
                expect(element.find('div.butch').text()).toBe('aaa');
            });

            it('should update the cell if the underlying data changes', function () {
                scope.row.col1 = 'ccc';
                scope.$apply();
                expect(element.find('div.butch').text()).toBe('ccc');
            });
        });

        describe('template behavior with value placeholder', function () {
            beforeEach(inject(function ($rootScope) {
                scope = $rootScope;
                scope.row = {col1: 'aaa', col2: 'bbb'};
                scope.column = {field: 'col1', template: '<div class="butch">{{value}}</div>'};
                element = createTestElement('<td row="row" column="column" ds-grid-cell></td>', scope);
            }));

            it('should contain the correct row data rendered through the template', function () {
                expect(element.find('div.butch').text()).toBe('aaa');
            });

            it('should update the cell if the underlying data changes', function () {
                scope.row.col1 = 'ccc';
                scope.$apply();
                expect(element.find('div.butch').text()).toBe('ccc');
            });
        });

        describe('template behavior when specified with ds-template directive', function () {
            beforeEach(inject(function ($rootScope, $compile) {
                scope = $rootScope;
                scope.row = {col1: 'aaa', col2: 'bbb'};
                scope.column = {field: 'col1', templateName: 'butch'};
                scope.templates = {butch: {transclude: $compile('<div class="butch">{{value}}</div>')}};
                element = createTestElement('<td row="row" column="column" templates="templates" ds-grid-cell></td>', scope);
            }));

            it('should contain the correct row data rendered through the template', function () {
                expect(element.find('div.butch').text()).toBe('aaa');
            });

            it('should update the cell if the underlying data changes', function () {
                scope.row.col1 = 'ccc';
                scope.$apply();
                expect(element.find('div.butch').text()).toBe('ccc');
            });
        });

        describe('globalize.js cell formats', function () {
            beforeEach(inject(function ($rootScope, $compile) {
                scope = $rootScope;
                scope.row = {col1: 123.456, col2: 789.10};
                scope.column = {field: 'col1', format: 'c'};
                scope.templates = {butch: {transclude: $compile('<div class="butch">{{value}}</div>')}};
                element = createTestElement('<td row="row" column="column" templates="templates" ds-grid-cell></td>', scope);
            }));

            it('should contain the correct row data filtered with globalize', function () {
                expect(element.text()).toBe('$123.46');
            });

            it('should update the cell if the underlying data changes', function () {
                scope.row.col1 = 999.99;
                scope.$apply();
                expect(element.text()).toBe('$999.99');
            });
        });
    });

    describe('Grid controller', function () {
        var scope, controller, params;

        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('adp.ds.ui.grid.controller', {$scope: scope});
            scope.$apply(function () {
                scope.source = createTestData({
                    remote: sinon.spy(function () {
                        params = this;
                    }),
                    events: {
                        pageIndexChanged: sinon.spy(function (event, newValue, oldValue) {
                            expect(newValue).toBe('new');
                            expect(oldValue).toBe('old');
                        }),
                        sortFieldsChanged: sinon.spy(function (event, newValue, oldValue) {
                            expect(newValue).toBe('new');
                            expect(oldValue).toBe('old');
                        }),
                        pageSizeChanged: sinon.spy(function (event, newValue, oldValue) {
                            expect(newValue).toBe('new');
                            expect(oldValue).toBe('old');
                        })
                    }
                });                
            });
        }));

        it('should call the user-defined pageIndexChanged event handler', function () {
            scope.$emit('pageIndexChanged', 'new', 'old');
            expect(scope.source.events.pageIndexChanged).toHaveBeenCalledOnce();
        });

        it('should call update on the dataSource when pageIndex changes', function () {
            scope.$apply(function () {
                scope.source.pageIndex = 2;
            });

            expect(scope.source.remote).toHaveBeenCalledOnce();
            expect(params.pageIndex).toBe(2);
        });

        it('should call the user-defined sortFieldsChanged event handler', function () {
            scope.$emit('sortFieldsChanged', 'new', 'old');
            expect(scope.source.events.sortFieldsChanged).toHaveBeenCalledOnce();
        });

        it('should call update on the dataSource when sortFields changes', function () {
            scope.$apply(function () {
                scope.source.sortFields = [{field: 'make', dir: 'asc'}];
            });
            expect(scope.source.remote).toHaveBeenCalledOnce();
            expect(params.sortFields).toEqual([{field: 'make', dir: 'asc'}]);
        });

        it('should call the user-defined pageSizeChanged event handler', function () {
            scope.$emit('pageSizeChanged', 'new', 'old');
            expect(scope.source.events.pageSizeChanged).toHaveBeenCalledOnce();
        });

        it('should call update on the dataSource when pageSize changes', function () {
            scope.$apply(function () {
                scope.source.pageSize = 5;
            });
            expect(scope.source.remote).toHaveBeenCalledOnce();
            expect(params.pageSize).toEqual(5);
        });
    });
});
'use strict';

describe('adp.ds.ui.grid.template', function () {

    beforeEach(module('adp.ds.ui.grid.template', 'adp.ds.ui.grid.table', 'adp.ds.ui.grid.data'));

    function createTestElement (template, scope) {
        var element = angular.element(template);
        inject(function ($compile) {
            $compile(element)(scope);
        });
        scope.$digest();

        return element;
    }

    describe('ds-template Directive', function () {
        var element, scope;

        beforeEach(inject(['$rootScope', 'adp.ds.ui.grid.data.source', function ($rootScope, dataSourceFactory) {         
            scope = $rootScope.$new();
            scope.gridConfig = {};
            scope.gridData = dataSourceFactory();
            element = createTestElement('<ds-grid config="gridConfig" source="gridData"><ds-template name="butch"><div class="butch">{{data}}</div></ds-template></ds-grid>', scope);
        }]));

        it('should create a templates array on the grid scope', function () {
            expect(element.scope().templates.butch).not.toBeUndefined();
        });

        it('should add a transclude function that can be used to add the element to the dom', inject(function ($rootScope) {
            var scope = $rootScope.$new(),
                dest = createTestElement('<div></div>', scope);

            scope.data = "hello";
            element.scope().templates.butch.transclude(scope, function (clone) {
                dest.append(clone);
            });

            dest.children("div.butch").scope().$apply();
            expect(dest.children("div.butch").text()).toBe("hello");
        }));
    });
});
'use strict';

describe('adp.ds.ui.grid.util', function () {

    beforeEach(module('adp.ds.ui.grid.util'));

    describe('ChangeUtil', function () {
        var ChangeUtil, scope;

        beforeEach(inject(['adp.ds.ui.grid.util.change', '$rootScope', function (util, $rootScope) {
            scope = $rootScope;
            ChangeUtil = util;
        }]));

        describe('emitChange', function () {
            it('should $emit a "xxxChanged" event', function () {
                var eventSpy = sinon.spy(function (event, newValue, oldValue) {
                    expect(newValue).toBe('new');
                    expect(oldValue).toBe('old');
                });

                scope.$on('myParamChanged', eventSpy);
                expect(ChangeUtil.emitChange(scope, 'myParam', 'new', 'old')).toBe('new');
                expect(ChangeUtil.emitChange(scope, 'otherParam', 'new', 'old')).toBe('new');
                
                expect(eventSpy).toHaveBeenCalledOnce();
            });

            it('should not $emit a "xxxChanged event if the value did not change', function () {
                var eventSpy = sinon.spy();
                scope.$on('myParamChanged', eventSpy);
                expect(ChangeUtil.emitChange(scope, 'myParam', 'new', 'new')).toBe('new');
                expect(eventSpy).not.toHaveBeenCalled();
            });

            it('should allow the change of value to be prevented via the event', function () {
                var cancelChange = sinon.spy(function (event) {
                    event.preventDefault();
                });

                scope.$on('myParamChanged', cancelChange);                
                expect(ChangeUtil.emitChange(scope, 'myParam', 'new', 'old')).toBe('old');
                expect(cancelChange).toHaveBeenCalledOnce();
            });
        });

    });
});