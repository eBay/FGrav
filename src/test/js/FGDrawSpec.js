describe("FGDraw", function () {

    var draw;
    var fg;

    beforeEach(function () {
        fg = new FG("my-fg", 13, "title", "179");
        fg.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        draw = new FGDraw(fg);
    });

    describe("FG", function () {

        beforeEach(function() {
            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("test.collapsed").andReturn({
                responseText:
                    "a;b;c 1\n" +
                    "a;b;d 2\n" +
                    "a;x;d 3\n"
            });
            jasmine.Ajax.stubRequest("test2.collapsed").andReturn({
                responseText:
                    "a;b;c 2\n" +
                    "a;b;d 4\n" +
                    "a;x;d 6\n"
            });
            fg.margin = 12;
            fg.frameHeight = 7;
        });

        afterEach(function() {
            jasmine.Ajax.uninstall();
        });

        it('should draw FG', function (done) {

            var stackFrames = new FGStackFrames();
            fg.collapsedUrl = "test.collapsed";
            stackFrames.loadCollapsed(fg, function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("test.collapsed");
                    expect(request.method).toBe('GET');

                    draw.drawFG(stackFrames);

                    expect(fg.totalSamples).toEqual(6); // 1 + 2 + 3
                    expect(draw.svg.children.length).toEqual(1);
                    expect(draw.svg.children[0].localName).toEqual("g");
                    expect(draw.svg.children[0].getAttribute("id").toString()).toEqual("my-fgframes");
                    expect(draw.svg.children[0].children.length).toEqual(7); // all, a, b, x, c, d (above b), d (above x)
                    expect([].slice.call(draw.svg.children[0].children).map(c => c.children[1].innerHTML).join(",")).toEqual("all,a,b,x,c,d,d");
                    expect([].slice.call(draw.svg.children[0].children).map(c => c.children[0].getAttribute("width").toString()).join(",")).toEqual("155,155,77.5,77.5,25.8333,51.6667,77.5");
                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });
        });

        it('should redraw FG', function (done) {

            var stackFrames = new FGStackFrames();
            fg.collapsedUrl = "test.collapsed";
            stackFrames.loadCollapsed(fg, function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("test.collapsed");
                    expect(request.method).toBe('GET');

                    draw.drawFG(stackFrames);

                    expect(fg.totalSamples).toEqual(6); // 1 + 2 + 3
                    expect(draw.svg.children.length).toEqual(1);

                    stackFrames = new FGStackFrames();
                    fg.collapsedUrl = "test2.collapsed";
                    stackFrames.loadCollapsed(fg, function () {
                        try {
                            draw.redrawFG(stackFrames);

                            expect(fg.totalSamples).toEqual(12); // 2 + 4 + 6
                            expect(draw.svg.children.length).toEqual(1);
                            expect(draw.svg.children[0].localName).toEqual("g");
                            expect(draw.svg.children[0].getAttribute("id").toString()).toEqual("my-fgframes");
                            done();
                        } catch (e) {
                            done(e);
                        }

                    }, function () {
                        done.fail("ajax should succeed");
                    });
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });
        });

        it('should reapply color', function (done) {
            var stackFrames = new FGStackFrames();

            fg.context.currentColorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "black1");
                    }
                },
                legend: {}
            };

            fg.collapsedUrl = "test.collapsed";
            stackFrames.loadCollapsed(fg, function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("test.collapsed");
                    expect(request.method).toBe('GET');

                    draw.drawFG(stackFrames);

                    expect(draw.svg.children[0].children[0].children[0].getAttribute('fill').toString()).toEqual("black1");

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

                    expect(draw.svg.children[0].children[0].children[0].getAttribute('fill').toString()).toEqual("black2");

                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });

        });

    });

    describe("frame", function () {

        beforeEach(function () {
            fg.context.currentColorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "my-black");
                    }
                },
                legend: {}
            };
        });

        it("should draw frame", function () {

            var f = frameObject("a","a:b:c", 17, 19, 23, 29);
            var el = draw.drawFrame(fg.context.currentColorScheme, f);

            expect(parseInt(el.children[0].getAttribute("x"))).toEqual(19 + 13); // = (x + shift width defined in FG constructor)
            expect(parseInt(el.children[0].getAttribute("y"))).toEqual(23);
            expect(parseInt(el.children[0].getAttribute("width"))).toEqual(29);
            expect(el.children[0].getAttribute("fill")).toEqual("my-black");
            expect(el.children[1].getAttribute("name")).toEqual("a");
        });
    });

    describe("text", function () {

        beforeEach(function () {
            fg.fontWidthRatio = 1;
        });

        it('should return empty text for size 0 frame', function () {

            var text = draw.frameText(draw, "my-text", 0, 1);

            expect(text).toEqual("");

        });

        it('should fit text to frame', function () {

            var text = draw.frameText(draw, "my-text", 3, 1);

            expect(text). toEqual("m..");

        });

        it('should not chop text if it fits frame', function () {

            var text = draw.frameText(draw, "my-text", 10, 1);

            expect(text).toEqual("my-text");

        });
    });

    describe("canvas", function () {

        it('should draw canvas', function () {

            fg.width = 17;
            fg.height = 23;
            draw.drawCanvas();

            expect(draw.svg.getAttribute("width")).toEqual("17");
            expect(draw.svg.getAttribute("height")).toEqual("23");
            expect(draw.svg.getAttribute("viewBox")).toEqual("0 0 17 23");

        });

        it('should draw info elements', function () {

            draw.drawCanvas();
            draw.drawInfoElements();

            expect(fg.details).not.toBe(undefined);
            expect(fg.matchedtxt.localName).toEqual("text");
            expect(fg.tooltip.localName).toEqual("g");

        });


        it('should draw legend', function () {

            fg.context.currentColorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "black1");
                    }
                },
                legend: {
                    black: 'A',
                    red: 'B'
                },
                overlays: {}
            };

            draw.drawCanvas();

            expect(fg.legendEl.localName).toEqual("g");
            expect(fg.legendEl.children.length).toEqual(4);
            expect(fg.legendEl.children[0].getAttribute("fill")).toEqual("black");
            expect(fg.legendEl.children[1].innerHTML).toEqual("A");
            expect(fg.legendEl.children[2].getAttribute("fill")).toEqual("red");
            expect(fg.legendEl.children[3].innerHTML).toEqual("B");
        });

        it('should redraw legend', function () {
            fg.context.currentColorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "black1");
                    }
                },
                legend: {
                    black: 'A',
                    red: 'B'
                },
                overlays: {}
            };

            draw.drawCanvas();

            var newScheme = {
                legend: {
                    orange: 'C',
                    yellow: 'D'
                }
            };

            draw.drawLegend(newScheme, fg.legendEl);

            expect(fg.legendEl.localName).toEqual("g");
            expect(fg.legendEl.children.length).toEqual(4);
            expect(fg.legendEl.children[0].getAttribute("fill")).toEqual("orange");
            expect(fg.legendEl.children[1].innerHTML).toEqual("C");
            expect(fg.legendEl.children[2].getAttribute("fill")).toEqual("yellow");
            expect(fg.legendEl.children[3].innerHTML).toEqual("D");
        });

        it('should redraw legend to an empty one', function () {
            fg.context.currentColorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "black1");
                    }
                },
                legend: {
                    black: 'A',
                    red: 'B'
                },
                overlays: {}
            };

            draw.drawCanvas();

            var newScheme = {
                legend: {}
            };

            draw.drawLegend(newScheme, fg.legendEl);

            expect(fg.legendEl).toEqual(undefined);
        });


        it('should draw overlay drop down', function () {

            fg.context.currentColorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "black1");
                    }
                },
                overlays: {
                    a: 'A',
                    b: 'B'
                }
            };

            draw.drawCanvas();

            expect(fg.overlayEl.localName).toEqual("g");
            expect(fg.overlayEl.children.length).toEqual(3);
            expect(fg.overlayEl.children[0].onclick.toString()).toEqual('function onclick(evt) {\n' +
                'fg.loadOverlay("a", "A");\n}');
            expect(fg.overlayEl.children[1].onclick.toString()).toEqual('function onclick(evt) {\n' +
                'fg.loadOverlay("b", "B");\n}');
            expect(fg.overlayEl.children[2].onclick.toString()).toEqual('function onclick(evt) {\n' +
                'fg.loadOverlay("Clear", "color:Clear");\n}');
        });

        it('should redraw overlay drop down', function () {
            fg.context.currentColorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "black1");
                    }
                },
                overlays: {
                    a: 'A',
                    b: 'B'
                }
            };

            draw.drawCanvas();

            var newScheme = {
                overlays: {
                    c: 'C',
                    d: 'D'
                }
            };
            fg.overlayBtn = {
                firstChild: {}
            };

            draw.drawOverlayDropDown(newScheme, fg.overlayBtn, fg.overlayEl);

            expect(fg.overlayEl.localName).toEqual("g");
            expect(fg.overlayEl.children.length).toEqual(2);
            expect(fg.overlayEl.children[0].onclick.toString()).toEqual('function onclick(evt) {\n' +
                'fg.loadOverlay("c", "C");\n}');
            expect(fg.overlayEl.children[1].onclick.toString()).toEqual('function onclick(evt) {\n' +
                'fg.loadOverlay("d", "D");\n}');
            expect(fg.overlayBtn.firstChild.nodeValue).toEqual('Overlays');
        });

        it('should redraw overlay drop down to an empty one', function () {
            fg.context.currentColorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "black1");
                    }
                },
                overlays: {
                    a: 'A',
                    b: 'B'
                }
            };

            draw.drawCanvas();

            var newScheme = {
                overlays: {}
            };
            fg.overlayBtn = {
                firstChild: {}
            };

            draw.drawOverlayDropDown(newScheme, fg.overlayBtn, fg.overlayEl);

            expect(fg.overlayEl).toEqual(undefined);
        });
    });
});