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

        var frame = function(samplesArray) {
            return {
                getDifferentialSamples: function (i) {
                    return samplesArray[i];
                }
            }
        };


        it("frame color should be red for growth", function () {
            expect(new FG_Color_Diff().colorFor(frame([50, 80]), [100, 100])).toEqual('rgb(255,220,220)');
        });

        it("frame color should be blue for reduction", function () {
            expect(new FG_Color_Diff().colorFor(frame([80, 50]), [100, 100])).toEqual('rgb(220,220,255)');
        });

        it("frame color should be vary relative to change", function () {
            var diff = new FG_Color_Diff();
            expect(diff.colorFor(frame([100, 50]), [100, 100])).toEqual('rgb(192,192,255)');
            expect(diff.colorFor(frame([80, 50]), [100, 100])).toEqual('rgb(220,220,255)');
            expect(diff.colorFor(frame([75, 50]), [100, 100])).toEqual('rgb(227,227,255)');
            expect(diff.colorFor(frame([55, 50]), [100, 100])).toEqual('rgb(253,253,255)');
            expect(diff.colorFor(frame([50, 100]), [100, 100])).toEqual('rgb(255,192,192)');
            expect(diff.colorFor(frame([50, 80]), [100, 100])).toEqual('rgb(255,220,220)');
            expect(diff.colorFor(frame([50, 75]), [100, 100])).toEqual('rgb(255,227,227)');
            expect(diff.colorFor(frame([50, 55]), [100, 100])).toEqual('rgb(255,253,253)');
        });

        it("frame color should be white for no change", function () {

            expect(new FG_Color_Diff().colorFor(frame([50, 50]), [100, 100])).toEqual('white');
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

        it('should find the diff rectangle when both it and a white frame rect exist', function () {
            var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "text"));
            var whiteRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            whiteRect.setAttribute("fill", "white");
            var drawnRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            drawnRect.setAttribute("fill", "red");
            g.appendChild(whiteRect);
            g.appendChild(drawnRect);

            expect(draw.findDrawnRect(g)).toBe(drawnRect);
        });

        it('should find the diff rectangle when only it is attached', function () {
            var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "text"));
            var drawnRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            drawnRect.setAttribute("fill", "red");
            g.appendChild(drawnRect);

            expect(draw.findDrawnRect(g)).toBe(drawnRect);
        });

        it('should not find the diff rectangle when only the white rect attached', function () {
            var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "text"));
            var whiteRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            whiteRect.setAttribute("fill", "white");
            g.appendChild(whiteRect);

            expect(draw.findDrawnRect(g)).toBe(undefined);
        });
    });


    describe("FG", function () {

        var draw;
        var fg;
        var collapsed;

        beforeEach(function() {
            fg = new FG("my-fg", 13, "title", "179");
            fg.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            collapsed = new MergedCollapsed(2);
            draw = new MergedFGDraw(fg, collapsed, true, true);

            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("diff.collapsed").andReturn({
                responseText:
                    "a;b;c 1 2\n" +
                    "a;b;d 2 2\n" +
                    "a;x;d 3 0\n" +
                    "a;x;y 0 1\n"
            });
            fg.margin = 12;
            fg.frameHeight = 7;
        });

        afterEach(function() {
            jasmine.Ajax.uninstall();
        });

        it('should draw FG', function (done) {

            var stackFrames = new FGStackFrames();
            fg.collapsedUrl =  "diff.collapsed";

            stackFrames.loadCollapsed(fg, function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("diff.collapsed");
                    expect(request.method).toBe('GET');

                    draw.drawFG(stackFrames);

                    expect(fg.totalSamples).toEqual(11); // 1 + 2 + 3 + 2 + 2 + 1
                    expect(draw.svg.children[0].localName).toEqual("g");
                    expect(draw.svg.children[0].getAttribute("id").toString()).toEqual("my-fgframes");
                    expect(draw.svg.children[0].children.length).toEqual(8); // all, a, b, x, c, d (above b), d (above x), y
                    expect([].slice.call(draw.svg.children[0].children).filter(c => c.children.length === 2).map(c => c.children[1].innerHTML).join(",")).toEqual("all,a,d,");
                    expect([].slice.call(draw.svg.children[0].children).filter(c => c.children.length === 3).map(c => c.children[2].innerHTML).join(",")).toEqual("b,x,c,d");
                    expect([].slice.call(draw.svg.children[0].children).map(c => c.children[0].getAttribute("width").toString()).join(",")).toEqual("155,155,98.6364,56.3636,42.2727,56.3636,42.2727,14.0909");
                    expect([].slice.call(draw.svg.children[0].children).map(c => c.children[0].getAttribute("fill").toString()).join(",")).toEqual('white,white,white,white,white,white,rgb(0,0,255),rgb(255,0,0)');
                    expect([].slice.call(draw.svg.children[0].children).filter(c => c.children.length === 3).map(c => c.children[1].getAttribute("fill").toString()).join(",")).toEqual("rgb(255,220,220),rgb(164,164,255),rgb(255,169,169),rgb(255,248,248)");

                    expect(draw.svg.children[0].children[0].children[1].innerHTML.toString()).toEqual("all");
                    expect(draw.svg.children[0].children[0].children[0].getAttribute('fill').toString()).toEqual("white");
                    expect(draw.svg.children[0].children[2].children[0].getAttribute('fill').toString()).toEqual("white");
                    expect(draw.svg.children[0].children[2].children[1].getAttribute('fill').toString()).toEqual("rgb(255,220,220)");

                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            }, collapsed);
        });

        it('should reapply color', function (done) {
            var stackFrames = new FGStackFrames();
            fg.collapsedUrl =  "diff.collapsed";

            stackFrames.loadCollapsed(fg, function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("diff.collapsed");
                    expect(request.method).toBe('GET');

                    draw.drawFG(stackFrames);

                    expect(draw.svg.children[0].children[0].children[1].innerHTML.toString()).toEqual("all");
                    expect(draw.svg.children[0].children[0].children[0].getAttribute('fill').toString()).toEqual("white");
                    expect(draw.svg.children[0].children[2].children[0].getAttribute('fill').toString()).toEqual("white");
                    expect(draw.svg.children[0].children[2].children[1].getAttribute('fill').toString()).toEqual("rgb(255,220,220)");

                    fg.context.currentColorScheme = {
                        applyColor: function() {
                            return function (el) {
                                el.setAttribute("fill", "black2");
                            }
                        },
                        legend: {}
                    };
                    draw.svg.getElementById = function(id) {
                        return draw.svg.children[0];
                    };

                    draw.reapplyColor(fg.context.currentColorScheme);

                    expect(draw.svg.children[0].children[0].children[0].getAttribute('fill').toString()).toEqual("white");
                    expect(draw.svg.children[0].children[2].children[0].getAttribute('fill').toString()).toEqual("white");
                    expect(draw.svg.children[0].children[2].children[1].getAttribute('fill').toString()).toEqual("black2");

                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            }, collapsed);

        });

    });

    describe('graph selection', function () {

        var draw;
        var fg;
        var collapsed;

        beforeEach(function () {
            fg = new FG("id", 13, "title", "179");
            fg.svg = domElement();
            draw = new MergedFGDraw(fg, collapsed, true, true);
        });

        it('should draw titles', function () {

            draw.drawTitle();

            expect(draw.currentDrawnGraphTitle).toEqual("title");
            expect(draw.titles.length).toEqual(3);
            expect(draw.titles[0].classList.length).toBe(0);
            expect(draw.titles[1].classList[0]).toEqual("hide");
            expect(draw.titles[2].classList[0]).toEqual("hide");
            expect(draw.titles[0].getAttribute("id")).toBe("title");
            expect(draw.titles[1].getAttribute("id")).toBe("title1");
            expect(draw.titles[2].getAttribute("id")).toBe("title2");
        });

        it('should draw all titles as drop down to select', function () {
            draw.visualDiff = true;
            draw.drawTitle();

            draw.mergedGraphReload("title");

            expect(draw.currentDrawnGraphTitle).toEqual("selection");
            expect(draw.titles.length).toEqual(3);
            expect(draw.titles[0].classList.length).toBe(0);
            expect(draw.titles[1].classList.length).toBe(0);
            expect(draw.titles[2].classList.length).toBe(0);
            expect(draw.visualDiff).toBe(true);

        });

        it('should select specific title to load', function () {
            var reloaded = false;
            draw.collapsed = {
                mergedComponentCollapsed: function (i) {
                    return new Collapsed();
                }
            };
            draw.fg.reload = function () {
                reloaded = true;
            };
            draw.drawTitle();
            draw.mergedGraphReload("title");

            draw.mergedGraphReload("title1");

            expect(draw.currentDrawnGraphTitle).toEqual("title1");
            expect(draw.titles.length).toEqual(3);
            expect(draw.titles[0].classList[0]).toEqual("hide");
            expect(draw.titles[1].classList.length).toBe(0);
            expect(draw.titles[2].classList[0]).toEqual("hide");
            expect(draw.visualDiff).toBe(false);
            expect(reloaded).toBe(true);
        });

        it('should call collapsed impl to regenerate stackFrames with the right index', function () {
            draw.collapsed = new MergedCollapsed(2);

            var collapsed = draw.collapsedToReload("title1");
            expect(collapsed.index).toBe(0);

            collapsed = draw.collapsedToReload("title2");
            expect(collapsed.index).toBe(1);
        });

        it('should return stored stackFrames for differential ', function () {
            draw.collapsed = new MergedCollapsed(2);

            var c = draw.collapsedToReload("title");

            expect(c).toBe(draw.collapsed);
        });
    });

});