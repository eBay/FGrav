describe("FGDraw", function () {

    var draw;
    var fg;

    beforeEach(function () {
        var d = {
            createElementNS: function (ns, name) {
                return domElement(name);
            }
        };
        fg = new FG("my-fg", 13, "title", "179");
        fg.svg = domElement("svg");
        draw = new FGDraw(fg, d);
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
            frameFilter.reset();
            fg.margin = 12;
            fg.frameHeight = 7;
            colorScheme = undefined;
        });

        afterEach(function() {
            jasmine.Ajax.uninstall();
            frameFilter.reset();
        });

        it('should draw FG', function (done) {

            var stackFrames = new FGStackFrames();
            stackFrames.loadCollapsed(fg, "test.collapsed", function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("test.collapsed");
                    expect(request.method).toBe('GET');

                    draw.drawFG(stackFrames);

                    expect(fg.totalSamples).toEqual(6); // 1 + 2 + 3
                    expect(draw.svg.children[0].name).toEqual("g");
                    expect(draw.svg.children[0].getAttribute("id").value).toEqual("my-fgframes");
                    expect(draw.svg.children[0].children.length).toEqual(7); // all, a, b, x, c, d (above b), d (above x)
                    expect(draw.svg.children[0].children.map(c => c.children[1].innerHTML).join(",")).toEqual("all,a,b,x,c,d,d");
                    expect(draw.svg.children[0].children.map(c => c.children[0].getAttribute("width").value.toString()).join(",")).toEqual("155,155,77.5,77.5,25.8333,51.6667,77.5");
                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });
        });

        it('should redraw FG', function (done) {

            var replaced = false;

            fg.svg.getElementById = function (name) {
                expect(name).toEqual("my-fgframes");
                return "old";
            };

            fg.svg.replaceChild = function (g, old) {
                expect(old).toEqual("old");
                expect(fg.totalSamples).toEqual(6); // 1 + 2 + 3
                expect(g.name).toEqual("g");
                expect(g.getAttribute("id").value).toEqual("my-fgframes");
                expect(g.children.length).toEqual(7); // all, a, b, x, c, d (above b), d (above x)
                expect(g.children.map(c => c.children[1].innerHTML).join(",")).
                    toEqual("all,a,b,x,c,d,d");
                expect(g.children.map(c => c.children[0].getAttribute("width").value.toString()).join(",")).
                    toEqual("155,155,77.5,77.5,25.8333,51.6667,77.5");
                replaced = true;
            };


            var stackFrames = new FGStackFrames();

            stackFrames.loadCollapsed(fg, "test.collapsed", function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("test.collapsed");
                    expect(request.method).toBe('GET');

                    draw.drawFG(stackFrames);

                    draw.redrawFG();

                    expect(replaced).toBe(true);
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
            colorScheme = {
                applyColor: function() {
                    return function (el) {
                        el.setAttribute("fill", "my-black");
                    }
                },
                legend: {}
            };
        });

        afterEach(function () {
            colorScheme = undefined;
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
});