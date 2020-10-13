describe("FGrav", function() {

    var t;

    beforeEach(function () {
        t = new FGrav(1, 2, 3, 4, "TITLE");
    });


    describe("when loadDynamicJs invoked ", function () {

        beforeEach(function () {
            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("js/frame/FG_Filter_Test.js").andReturn({
                responseText: "frameFilter.filters.push(dummyTestFilter);" +
                    " function dummyTestFilter(name) {" +
                    "    return name + name;" +
                    "}"
            });
            jasmine.Ajax.stubRequest("js/frame/FG_Filter_Other.js").andReturn({
                responseText: "frameFilter.filters.push(dummyOtherFilter);" +
                    " function dummyOtherFilter(name) {" +
                    "    return 'x';" +
                    "}"
            });
            jasmine.Ajax.stubRequest("js/color/FG_Color_Test.js").andReturn({
                responseText: "" +
                    "function FG_Color_Test() {\n" +
                    "    FG_Color.call(this);\n" +
                    "}\n" +
                    "FG_Color_Test.prototype = Object.create(FG_Color.prototype);\n" +
                    "FG_Color_Test.prototype.constructor = FG_Color_Test;\n" +
                    "FG_Color_Test.prototype.colorFor = function(f, r) {" +
                    "    return 'rgb(122,122,122)';" +
                    "}"
            });
            frameFilter.reset();
            colorScheme = {
                legend: {}
            };
        });

        afterEach(function () {
            colorScheme = {
                legend: {}
            };
            jasmine.Ajax.uninstall();
        });


        it("should load dynamic js file", function (done) {
            t.loadDynamicJs([new DynamicallyLoading("js/frame/FG_Filter_Test.js")], function () {

                var request = jasmine.Ajax.requests.mostRecent();
                expect(request.url).toBe("js/frame/FG_Filter_Test.js");
                expect(request.method).toBe('GET');

                expect(frameFilter.filters[0]('foo')).toEqual("foofoo");

                done();
            }, function () {
                fail("ajax should succeed");
                done();
            });
        });

        it("should load dynamic js file with additional installation script", function (done) {
            t.loadDynamicJs([new DynamicallyLoading("js/color/FG_Color_Test.js", "colorScheme = new FG_Color_Test();")], function () {

                var request = jasmine.Ajax.requests.mostRecent();
                expect(request.url).toBe("js/color/FG_Color_Test.js");
                expect(request.method).toBe('GET');

                expect(colorScheme.colorFor()).toEqual("rgb(122,122,122)");

                done();
            }, function () {
                fail("ajax should succeed");
                done();
            });
        });

        it("should load multiple dynamic js filters", function (done) {
            t.loadDynamicJs([
                new DynamicallyLoading("js/frame/FG_Filter_Other.js"),
                new DynamicallyLoading("js/color/FG_Color_Test.js", "colorScheme = new FG_Color_Test();"),
                new DynamicallyLoading("js/frame/FG_Filter_Test.js")], function () {

                expect(frameFilter.filters.length).toEqual(2);
                expect(frameFilter.filters[0]('foo')).toEqual("x");
                expect(frameFilter.filters[1]('foo')).toEqual("foofoo");
                expect(colorScheme.colorFor()).toEqual("rgb(122,122,122)");

                done();
            }, function () {
                fail("ajax should succeed");
                done();
            });
        });
    });


    describe("when getParameter invoked ", function () {

        it("should return parameter value", function() {

            expect(t.getParameter("param", "DEFAULT", "?param=VALUE")).toEqual("VALUE");
        });

        it("should return parameter value among others", function() {

            expect(t.getParameter("param", "DEFAULT", "?other=v&param=VALUE")).toEqual("VALUE");
        });

        it("should use default if no parameter is passed", function() {

            expect(t.getParameter("param", "DEFAULT", "")).toEqual("DEFAULT");
        });


        it("should use default if specific parameter is not passed", function() {

            expect(t.getParameter("param", "DEFAULT", "?other=value1&another=value2")).toEqual("DEFAULT");
        });
    });

    describe("when constructor invoked ", function () {

        var w;

        beforeEach(function () {
            w  = {  jQuery: true,
                location: { search: '?a=b&width=17'},
                document: {
                    getElementsByTagName:
                        function(name) {
                            return ['svg']
                        },
                    getElementById: function(id) {
                            return undefined;
                        }
                    }
                }
        });

        it("should return when jQuery is loaded and set document references", function () {
            t = new FGrav(1, 2, 3, 4, "TITLE", w);
            expect(t.svg).toEqual('svg');
            expect(t.forcedWidth).toEqual('17');
        });
    });
});