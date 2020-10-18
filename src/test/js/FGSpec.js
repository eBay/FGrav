describe("FG", function() {

    var fg;
    var myWindow;
    var myPrompt;
    var searchTerm;
    var g;
    var textNode;

    beforeEach(function () {
        myWindow = {
            events: [],
            addEventListener: function (name, eventListener) {
                this.events.push(name);
            },
            location: {},
            document: {
                getElementsByTagName: function () {
                    return [ {} ];
                },
                getElementById: function (id) {}
            }
        };
        myPrompt = function () {
            return searchTerm;
        };
        fg = new FG(undefined, 2, "TITLE", 600, myWindow, myPrompt);
        fg.details = {};
        fg.tooltip = {

            attr: new Map(),
            setAttribute: function(k, v) {
                this.attr.set(k, v);
            },
            getAttribute: function(k) {
                return this.attr.get(k);
            }
        };
        colorScheme = {
            legend: {}
        };

        textNode = {
            attributes: {
                name: {
                    value: "NAME"
                },
                samples: {
                    value: "17"
                },
                attr: {
                    value: "VALUE"
                }
            },
            setAttribute: function (k, v) {
                this.attributes[k] = v;
            },
            removeAttribute: function (k) {
                this.attributes[k] = undefined;
            }
        };

        g = {
            querySelectorAll: function (selector) {
                return (selector === "text") ? [ textNode ] : [];
            },
            parentElement: { id: "frames", parentElement: undefined }
        };
    });

    afterEach(function () {
        colorScheme = {
            legend: {}
        };
    });

    describe('interactivity', function () {

        beforeEach(function () {
            fg.legendEl = domElement();
            fg.overlayEl = domElement();
            fg.ignorecaseBtn = domElement();
            fg.searchbtn = domElement();
            fg.matchedtxt = domElement();
            fg.legendBtn = domElement();
            fg.overlayBtn = domElement();

            fg.svg = { // disable search
                querySelectorAll: function (selector) {
                    return [];
                }
            }
        });

        it('should toggle legend on', function () {
            fg.legend = false;
            fg.legendEl.classList.add("hide");

            fg.toggle_legend();

            expect(fg.legendBtn.classList.class[0]).toEqual("show");
            expect(fg.legendEl.classList.class.length).toEqual(0);
            expect(fg.legend).toBe(true);
        });


        it('should toggle legend off', function () {
            fg.legend = true;
            fg.legendBtn.classList.add("show");

            fg.toggle_legend();

            expect(fg.legendEl.classList.class[0]).toEqual("hide");
            expect(fg.legendBtn.classList.class.length).toEqual(0);
            expect(fg.legend).toBe(false);
        });

        it('should toggle overlay on', function () {
            fg.overlay = false;
            fg.overlayEl.classList.add("hide");

            fg.toggle_overlay();

            expect(fg.overlayBtn.classList.class[0]).toEqual("show");
            expect(fg.overlayEl.classList.class.length).toEqual(0);
            expect(fg.overlay).toBe(true);
        });


        it('should toggle overlay off', function () {
            fg.overlay = true;
            fg.overlayBtn.classList.add("show");

            fg.toggle_overlay();

            expect(fg.overlayEl.classList.class[0]).toEqual("hide");
            expect(fg.overlayBtn.classList.class.length).toEqual(0);
            expect(fg.overlay).toBe(false);
        });



        it('should toggle ignoreCase on', function () {
            fg.ignorecase = false;

            fg.toggle_ignorecase();

            expect(fg.ignorecaseBtn.classList.class[0]).toEqual("show");
            expect(fg.ignorecase).toBe(true);
        });

        it('should toggle ignoreCase off', function () {
            fg.ignorecase = true;
            fg.ignorecaseBtn.classList.add("show");

            fg.toggle_ignorecase();

            expect(fg.ignorecaseBtn.classList.class.length).toEqual(0);
            expect(fg.ignorecase).toBe(false);
        });

        it('should toggle search off', function () {
            fg.searching = true;
            fg.currentSearchTerm = 'search-me';
            fg.searchbtn.classList.add("show");

            fg.search_prompt();

            expect(fg.searchbtn.classList.class.length).toEqual(0);
            expect(fg.searching).toBe(false);
            expect(fg.currentSearchTerm).toBe(null);
            expect(fg.matchedtxt.classList.class[0]).toBe("hide");
            expect(fg.matchedtxt.firstChild.nodeValue).toBe("");
        });

        it('should return nothing and allow more searches if nothing was found ', function () {
            fg.searching = false;
            searchTerm = "search-this";
            fg.svg = frames([]);

            fg.search_prompt();

            expect(fg.searchbtn.classList.class.length).toEqual(0);
            expect(fg.searching).toBe(false);
        });

        it('should toggle search on', function () {
            fg.searching = false;
            searchTerm = "search-this";
            var frameToFind = frame(searchTerm, "red");
            fg.svg = frames([frameToFind]);

            fg.search_prompt();

            expect(fg.searchbtn.classList.class[0]).toEqual("show");
            expect(fg.searching).toBe(true);
            expect(fg.currentSearchTerm).toBe("search-this");
            expect(fg.matchedtxt.classList.class.length).toBe(0);
            expect(frameToFind.rect.attributes.fill.value).toBe("rgb(230,0,230)"); // highlighted in purple
        });
    });

    it('should add window listener', function () {

        fg.setup(myWindow);

        expect(myWindow.events.length).toBe(5);
        expect(myWindow.events[0]).toBe("click");
        expect(myWindow.events[1]).toBe("mouseover");
        expect(myWindow.events[2]).toBe("mouseout");
        expect(myWindow.events[3]).toBe("keydown");
        expect(myWindow.events[4]).toBe("keydown");
    });


    describe("when loading", function() {

       it("should generate DynamicallyLoading object for external url", function () {

            var obj = fg.generateDynamicallyLoadingObject("/js/MyObject.js", undefined, function (name) {
                return name;
            });

           expect(obj.getUrl()).toEqual("/js/MyObject.js");
           expect(obj.appendInstallScript("")).toEqual("\nMyObject");

       });

        it("should generate DynamicallyLoading object for internal url", function () {

            var obj = fg.generateDynamicallyLoadingObject("MyObject",
                "js/convention/",
                function (n) { return n;});

            expect(obj.getUrl()).toEqual("js/convention/MyObject.js");
            expect(obj.appendInstallScript("")).toEqual("\nMyObject");
        });

       it("should generate DynamicallyLoading objects from names", function () {
            fg.colorSchemeName = "ColorScheme";
            fg.frameFilterNames = "FrameFilter";

            var objs = fg.objectsToLoad();

            expect(objs.length).toBe(2);
            expect(objs[0].getUrl()).toEqual("js/color/FG_Color_ColorScheme.js");
            expect(objs[0].appendInstallScript("")).toEqual("\ncolorScheme = new FG_Color_ColorScheme();");
            expect(objs[1].getUrl()).toEqual("js/frame/FG_Filter_FrameFilter.js");
            expect(objs[1].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new FG_Filter_FrameFilter());");

        });

        it("should generate DynamicallyLoading objects from urls", function () {
            fg.colorSchemeName = "/js/MyCustomColorScheme.js";
            fg.frameFilterNames = "/js/fgrav/custom/MyFrameFilter.js";

            var objs = fg.objectsToLoad();

            expect(objs.length).toBe(2);
            expect(objs[0].getUrl()).toEqual("/js/MyCustomColorScheme.js");
            expect(objs[0].appendInstallScript("")).toEqual("\ncolorScheme = new MyCustomColorScheme();");
            expect(objs[1].getUrl()).toEqual("/js/fgrav/custom/MyFrameFilter.js");
            expect(objs[1].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new MyFrameFilter());");

        });

        it("should generate multiple DynamicallyLoading objects", function () {
            fg.colorSchemeName = "ColorScheme";
            fg.frameFilterNames = "FrameFilter1,FrameFilter2,/js/MyCustomFilter.js";

            var objs = fg.objectsToLoad();

            expect(objs.length).toBe(4);
            expect(objs[0].getUrl()).toEqual("js/color/FG_Color_ColorScheme.js");
            expect(objs[0].appendInstallScript("")).toEqual("\ncolorScheme = new FG_Color_ColorScheme();");
            expect(objs[1].getUrl()).toEqual("js/frame/FG_Filter_FrameFilter1.js");
            expect(objs[1].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new FG_Filter_FrameFilter1());");
            expect(objs[2].getUrl()).toEqual("js/frame/FG_Filter_FrameFilter2.js");
            expect(objs[2].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new FG_Filter_FrameFilter2());");
            expect(objs[3].getUrl()).toEqual("/js/MyCustomFilter.js");
            expect(objs[3].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new MyCustomFilter());");

        });
    });


    describe("when loading overlay ", function () {

        beforeEach(function () {
            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("js/color/overlay/FG_Overlay_Test.js").andReturn({
                responseText: "" +
                    "function FG_Overlay_Test() {}\n" +
                    "FG_Overlay_Test.prototype.colorFor = function(f, r) {" +
                    "    return (f.name === 'overlay') ? 'rgb(122,122,122)' : colorScheme.colorFor(f, r);" +
                    "}"
            });
            frameFilter.reset();
            colorScheme = {
                legend: {},
                colorFor: function () {
                    return 'rgb(0,0,0)';
                }
            };
        });

        afterEach(function () {
            colorScheme = {
                legend: {}
            };
            jasmine.Ajax.uninstall();
        });


        it("should load dynamic overlay js file", function (done) {
            fg.loadOverlay("Test", function () {

                var request = jasmine.Ajax.requests.mostRecent();
                expect(request.url).toBe("js/color/overlay/FG_Overlay_Test.js");
                expect(request.method).toBe('GET');

                expect(colorScheme.currentOverlay.colorFor({ name: 'overlay'})).toEqual("rgb(122,122,122)");
                expect(colorScheme.currentOverlay.colorFor({ name: 'do not overlay. original color'})).toEqual("rgb(0,0,0)");

                done();
            }, function () {
                fail("ajax should succeed");
                done();
            });
        });
    });

    describe("when invoking get functions on elements in FG ", function () {

        it("should append id to name", function() {
            fg.id = "ID_";

            expect(fg.namePerFG("X")).toEqual("ID_X");
        });

        it("if no id then should return the name", function() {
            expect(fg.namePerFG("X")).toEqual("X");
        });

        it("should return group name", function () {
            expect(g_name(g)).toEqual("NAME");
        });

        it("should return group samples", function () {
            expect(g_samples(g)).toEqual(17);
        });

        it("g_to_func should also return group name", function () {
            expect(g_to_func(g)).toEqual("NAME");
        });

        it("should return group name samples and percentage", function () {
            fg.totalSamples = 170;

            expect(fg.g_details(g).details).toEqual("NAME (17 samples, 10%)");
            expect(fg.g_details(g).tip).toEqual("NAME (17 samples, 10%)");
        });
    });

    describe("when handle group details and tooltip", function () {

        it("should show given details", function() {
            fg.showDetails(g, 0, 0, { tip: "TIP", details:"DETAILS" });
            expect(fg.details.nodeValue).toEqual("DETAILS");
        });


        it("should clear details and hide tooltip", function () {
           fg.clearDetails(g);
            expect(fg.details.nodeValue).toEqual(" ");
            expect(fg.tooltip.getAttribute("visibility")).toEqual("hidden");
        });

        it("should find group below frames container element", function () {
            var group = fg.find_group({ parentElement: g});
            expect(group).toEqual(g);
        });
    });

    describe("when deal with original values", function () {


        it("should store value as an attribute", function() {
            orig_save(textNode, "attr", "val");
            expect(textNode.attributes._orig_attr).toEqual("val");
        });

        it("should store original value as an attribute", function() {
            orig_save(textNode, "attr");
            expect(textNode.attributes._orig_attr).toEqual("VALUE");
        });

        it("should store original value and load it back in element attributes", function() {
            textNode.attributes["attr"] = "MY VALUE";
            orig_save(textNode, "attr");
            orig_load(textNode, "attr");
            expect(textNode.attributes.attr).toEqual("MY VALUE");
        });

        it("original load removes orig attribute", function() {
            orig_save(textNode, "attr");
            expect(textNode.attributes._orig_attr).toEqual("VALUE");
            orig_load(textNode, "attr");
            expect(textNode.attributes._orig_attr).toEqual(undefined);
        });
    });

    describe("when invoking zoom and unzoom", function () {

        var a, b, c, children;

        beforeEach(function () {

            a = domGroupElement();
            b = domGroupElement();
            c = domGroupElement();

            fg.svg = frames([]);

            fg.unzoombtn = domElement();
        });

        it("unzoom should hide unzoom button", function() {
            fg.unzoom();
            expect(fg.unzoombtn.classList.class).toEqual(["hide"]);
        });

        it("unzoom should remove parent and hide class", function() {
            children = [a, b, c];
            fg.svg = frames(children);
            children.forEach(function (el) {
                el.classList.add('hide');
                el.classList.add('parent');
            });
            fg.unzoom();
            expect(a.classList.class.length).toBe(0);
            expect(b.classList.class.length).toBe(0);
            expect(c.classList.class.length).toBe(0);
        });


        it("zoom should expose unzoom button", function() {
            var g = domGroupElement();
            g.rect.setAttributes("width", "17", "x", "19", "y", "23");
            fg.zoom(g);

            expect(fg.unzoombtn.classList.class).toEqual([]);
        });

        it("zoom should add parent class to parent of pressed node", function() {
            var g = domGroupElement();
            children = [g, a];
            fg.svg = frames(children);
            children.forEach(function (el, i) {
                el.rect.setAttributes("width", "17", "x", "19", "y", "23" + i);
                el.text.setAttributes("name", "name"+i, "x", "19", "y", "23"+i);
            });

            fg.zoom(g);

            expect(a.classList.class).toEqual([ "parent" ]);
        });

        it("zoom should add hide class to non related node", function() {
            var g = domGroupElement();
            children = [g, a];
            fg.svg = frames(children);
            children.forEach(function (el, i) {
                el.rect.setAttributes("width", "17", "x", "19"+(i*10), "y", "23");
                el.text.setAttributes("name", "name"+i, "x", "19"+(i*10), "y", "23");
            });

            fg.zoom(g);

            expect(a.classList.class).toEqual([ "hide" ]);
        });

    });


    describe("width and height calculations post stack frames", function () {

        it("should keep default height dimensions when freezeDimensions is true", function () {
            fg.freezeDimensions = true;

            fg.calculateHeight(156);

            expect(fg.height).toEqual(2200);
            expect(fg.frameHeight).toEqual(15);
            expect(fg.fontSize).toEqual(12);
            expect(fg.textPadding).toEqual(10.5);
        });

        it("should keep default width dimensions when freezeDimensions is true", function () {
            fg.freezeDimensions = true;

            fg.calculateWidth(3301, 1, 4);

            expect(fg.width).toEqual(1200);
            expect(fg.margin).toEqual(24);
            expect(fg.fontSize).toEqual(12);
        });

        it("should change dimensions based on stack frames", function () {

            colorScheme.legend = { red: 'a', yellow: 'b'};
            fg.calculateWidth(60, 10, 3);
            fg.calculateHeight(3);

            expect(fg.width).toEqual((2 * 24) + (60 * 14)); // 60 = total samples, 24 = margin
            expect(fg.height).toEqual((3 + 2 + 1) * (15 + 2) + (24 * 4)); // 3 = maxLevel, 2 = legend size
        });

        it("should change dimensions but have minimum constants take effect", function () {

            fg.calculateWidth(10, 10, 3);
            fg.calculateHeight(2);

            expect(fg.width).toEqual(fg.minWidth);
            expect(fg.height).toEqual(fg.minHeight);
        });

        it("should modify margin and font when width is tight", function () {
            fg.calculateWidth(3301, 1, 4);

            expect(fg.width).toEqual(1200);
            expect(fg.margin).toEqual(8);
            expect(fg.fontSize).toEqual(8);
        });

        it("should modify frame height font and text padding when height is tight", function () {
            fg.calculateHeight(156);

            expect(fg.height).toEqual(2200);
            expect(fg.frameHeight).toEqual(14);
            expect(fg.fontSize).toEqual(8);
            expect(fg.textPadding).toEqual(8);
        });
    });
});