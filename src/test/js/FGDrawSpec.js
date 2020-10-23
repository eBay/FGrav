describe("FGDraw", function () {

    describe("FG_Color_Default", function () {

        it("frame color should match random number and name", function () {
            expect(new FG_Color_Default().colorFor({name: 'a'}, 0.5)).toEqual('rgb(239,139,0)');
        });
    });


    describe("frame", function () {


        var draw;
        var fg;

        beforeEach(function () {
            var d = {
                createElementNS: function () {
                    return domElement();
                }
            };
            fg = new FG("id", 13, "title", "179");
            fg.svg = domElement();
            draw = new FGDraw(fg, d);

            colorScheme = {
                applyStyle: function() {
                    return function (el) {
                        el.setAttribute("fill", "my-black");
                    }
                },
                legend: {}
            };
        });

        afterEach(function () {
            colorScheme = {
                legend: {}
            };
        });

        it("should draw frame", function () {

            var f = frameObject("a","a:b:c", 17, 19, 23, 29);
            var el = draw.drawFrame(f);

            expect(el.children[0].getAttributeValue("x")).toEqual(19 + 13); // = (x + shift width defined in FG constructor)
            expect(el.children[0].getAttributeValue("y")).toEqual(23);
            expect(el.children[0].getAttributeValue("width")).toEqual(29);
            expect(el.children[0].getAttributeValue("fill")).toEqual("my-black");
            expect(el.children[1].getAttributeValue("name")).toEqual("a");
        });
    });
});