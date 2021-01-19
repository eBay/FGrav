describe("FGrav", function() {

    var t;

    beforeEach(function () {
        t = new FGrav(1, 2, 3, 4, "TITLE");
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