describe("MergedFGDraw", function () {


    describe("FG_Color_Diff", function () {


        it("frame color should be red for growth", function () {
            expect(new FG_Color_Diff().colorFor({individualSamples: [50, 80]}, [100, 100])).toEqual('rgb(255,220,220)');
        });

        it("frame color should be blue for reduction", function () {
            expect(new FG_Color_Diff().colorFor({individualSamples: [80, 50]}, [100, 100])).toEqual('rgb(220,220,255)');
        });

        it("frame color should be vary relative to change", function () {
            var diff = new FG_Color_Diff();
            expect(diff.colorFor({individualSamples: [100, 50]}, [100, 100])).toEqual('rgb(192,192,255)');
            expect(diff.colorFor({individualSamples: [80, 50]}, [100, 100])).toEqual('rgb(220,220,255)');
            expect(diff.colorFor({individualSamples: [75, 50]}, [100, 100])).toEqual('rgb(227,227,255)');
            expect(diff.colorFor({individualSamples: [55, 50]}, [100, 100])).toEqual('rgb(253,253,255)');
            expect(diff.colorFor({individualSamples: [50, 100]}, [100, 100])).toEqual('rgb(255,192,192)');
            expect(diff.colorFor({individualSamples: [50, 80]}, [100, 100])).toEqual('rgb(255,220,220)');
            expect(diff.colorFor({individualSamples: [50, 75]}, [100, 100])).toEqual('rgb(255,227,227)');
            expect(diff.colorFor({individualSamples: [50, 55]}, [100, 100])).toEqual('rgb(255,253,253)');
        });

        it("frame color should be white for no change", function () {

            expect(new FG_Color_Diff().colorFor({individualSamples: [50, 50]}, [100, 100])).toEqual('white');
        });
    });

    describe("frame", function () {


        var draw;
        var fg;
        var collapsed;

        beforeEach(function () {
            var d = {
                createElementNS: function () {
                    return domElement();
                }
            };
            fg = new FG("id", 13, "title", "179");
            fg.svg = domElement();
            collapsed = {
                totalIndividualSamples: 219
            };
            draw = new MergedFGDraw(fg, collapsed, true, d);

            fg.context.currentColorScheme = {
                applyColor: function(f, s) {
                    return function (el) {
                        el.setAttribute("fill", "my-black");
                    }
                },
                legend: {}
            };
        });

        it("should draw frame with a diff rectangle", function () {

            var f = frameObject("a","a:b:c", 17, 19, 23, 29);
            f.individualSamples = [1, 2];
            collapsed.totalIndividualSamples = [10, 10];

            var el = draw.drawFrame(fg.context.currentColorScheme, f);

            expect(el.children[0].getAttributeValue("x")).toEqual(19 + 13); // = (x + shift width defined in FG constructor)
            expect(el.children[0].getAttributeValue("y")).toEqual(23);
            expect(el.children[0].getAttributeValue("width")).toEqual(29);
            expect(el.children[0].getAttributeValue("fill")).toEqual("white");    // rect
            expect(el.children[1].getAttributeValue("fill")).toEqual("my-black"); // rect
            expect(el.children[2].getAttributeValue("name")).toEqual("a");        // text
        });
    });
});