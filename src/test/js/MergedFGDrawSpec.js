describe("MergedFGDraw", function () {

    describe("diff", function () {

        using('parameters',[
                [4,20,2,20,0.5],
                [3,10,1,10,0.6666],
                [1,10,3,10,-0.6666],
                [2,10,2,10,0],
                [1,20,3,10,-0.8333],
                [1,10,3,20,-0.3333],
                [4,20,2,10,0],
                [1,10,1,1,-0.9]], function(p) {
            it("diff(" + p[0] + "," + p[1] + "," + p[2] + "," + p[3] + ") == " + p[4], function() {
                expect(calculateDiff(p[0],p[1],p[2],p[3])).toBeCloseTo(p[4], 2);
            });
        });

        function using(name, values, func) {
            for(var i = 0, count = values.length; i < count; i++) {
                if(Object.prototype.toString.call(values[i]) !== '[Object Array]') {
                    values[i] = [values[i]];
                }
                func.apply(this,values[i]);
            }
        }
    });

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
            draw = new MergedFGDraw(fg, collapsed, true, true, d);

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