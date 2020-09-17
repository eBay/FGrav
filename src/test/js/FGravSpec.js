describe("FGrav", function() {

    var t;

    beforeEach(function () {
        t = new FGrav(1, 2, 3, 4, "TITLE");
    });


    describe("when loadDynamicJs invoked ", function () {

        beforeEach(function () {
            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("js/frame/FG_Filter_Default.js").andReturn({
                responseText: "frameFilter.filters.push(dummyFilter);" +
                    " function dummyFilter(name) {" +
                    "    return name + name;" +
                    "}"
            });
            jasmine.Ajax.stubRequest("js/frame/FG_Filter_Other.js").andReturn({
                responseText: "frameFilter.filters.push(dummyFilter);" +
                    " function dummyFilter(name) {" +
                    "    return 'x';" +
                    "}"
            });
            jasmine.Ajax.stubRequest("js/color/FG_Color_Test.js").andReturn({
                responseText: "colorScheme.colorFor = function colorFor(name) {" +
                    "    return 'rgb(250,122,122)';" +
                    "}"
            });
            frameFilter.reset();
            colorScheme.reset();
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });


        it("should load dynamic js file", function (done) {
            t.loadDynamicJs(["js/frame/FG_Filter_Default.js"], function () {

                var request = jasmine.Ajax.requests.mostRecent();
                expect(request.url).toBe("js/frame/FG_Filter_Default.js");
                expect(request.method).toBe('GET');

                expect(frameFilter.filters[0]('foo')).toEqual("foofoo");

                done();
            }, function () {
                fail("ajax should succeed");
                done();
            });
        });

        it("should load multiple dynamic js filters", function (done) {
            t.loadDynamicJs(["js/frame/FG_Filter_Other.js","js/color/FG_Color_Test.js","js/frame/FG_Filter_Default.js"], function () {

                expect(frameFilter.filters.length).toEqual(2);
                expect(frameFilter.filters[0]('foo')).toEqual("x");
                expect(frameFilter.filters[1]('foo')).toEqual("foofoo");
                expect(colorScheme.colorFor()).toEqual("rgb(250,122,122)");

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
                        }
                }
            };
        });

        it("should return when jQuery is loaded and set document references", function () {
            t = new FGrav(1, 2, 3, 4, "TITLE", w);
            expect(t.svg).toEqual('svg');
            expect(t.forcedWidth).toEqual('17');
        });
    });
});