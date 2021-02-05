var loaded1;
var loaded2;
var loadedO;
var loadedC;

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
        fg.context.currentColorScheme = {
            legend: {},
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

    describe('context', function () {

        it('should set loaded color scheme to both current and by its name', function () {

            var scheme = new FG_Color_Black();

            fg.context.setColorScheme(scheme);

            expect(fg.context.currentColorScheme).toBe(scheme);
            expect(fg.context.color["Black"]).toBe(scheme);
        });

        it('should set first loaded color scheme name to be initial name', function () {

            fg.context = new FG_Context();
            fg.context.setColorScheme(new FG_Color_Black());
            fg.context.setColorScheme(new FG_Color_Clear());

            expect(fg.context.initialColorSchemeName).toBe('Black');
        });

        it('should set loaded custom color scheme to both current and by its full name', function () {

            var scheme = new MyCustomColorScheme();

            fg.context.setColorScheme(scheme);

            expect(fg.context.currentColorScheme).toBe(scheme);
            expect(fg.context.color["MyCustomColorScheme"]).toBe(scheme);
        });

        it('should set loaded color overlay to both current and by its name', function () {

            var overlay = new FG_Overlay_Java_Blocking();

            fg.context.setColorOverlay(overlay);

            expect(fg.context.currentColorScheme.currentOverlay).toBe(overlay);
            expect(fg.context.overlay["Java_Blocking"]).toBe(overlay);
        });

        it('should set loaded custom color overlay to both current and by its full name', function () {

            var overlay = new MyCustomColorScheme();

            fg.context.setColorOverlay(overlay);

            expect(fg.context.currentColorScheme.currentOverlay).toBe(overlay);
            expect(fg.context.overlay["MyCustomColorScheme"]).toBe(overlay);
        });

        it('should set color scheme if none was there before', function () {

            fg.context = new FG_Context();
            var scheme = new FG_Color_Black();

            fg.context.optionallySetColorScheme(scheme);

            expect(fg.context.currentColorScheme).toBe(scheme);
            expect(fg.context.color["Black"]).toBe(scheme);
        });

        it('should NOT set color scheme if one was set before it', function () {

            fg.context = new FG_Context();
            var firstScheme = new FG_Color_Clear();
            fg.context.setColorScheme(firstScheme);


            var scheme = new FG_Color_Black();

            fg.context.optionallySetColorScheme(scheme);

            expect(fg.context.currentColorScheme).toBe(firstScheme);
            expect(fg.context.color["Black"]).toBe(undefined);
        });

        it('should fill all overlays for current color scheme on init', function () {
            var config = {
                color: {
                    Clear: {
                        uri: "color:Clear",
                        overlays: [ "A", "B" ]
                    },
                    C: {
                        uri: "color:C"
                    }
                },
                overlay: {
                    A: {
                        uri: "overlay:A"
                    },
                    B: {
                        uri: "overlay:B"
                    }
                }
            };
            fg.context = new FG_Context();
            var clear = new FG_Color_Clear();
            fg.context.setColorScheme(clear);

            fg.context.init(config);

            expect(fg.context.currentColorScheme).toBe(clear);
            expect(Object.keys(clear.overlays).length).toBe(4);
            expect(clear.overlays["A"]).toBe("overlay:A");
            expect(clear.overlays["B"]).toBe("overlay:B");
            expect(clear.overlays["C"]).toBe("color:C");
            expect(clear.overlays["Clear"]).toBe("color:Clear");
        });

        it('should fill all overlays for current color scheme on setting if config exist', function () {
            var config = {
                color: {
                    Clear: {
                        uri: "color:Clear",
                        overlays: [ "A", "B" ]
                    },
                    C: {
                        uri: "color:C"
                    }
                },
                overlay: {
                    A: {
                        uri: "overlay:A"
                    },
                    B: {
                        uri: "overlay:B"
                    }
                }
            };
            fg.context = new FG_Context();
            fg.context.init(config);


            var clear = new FG_Color_Clear();
            fg.context.setColorScheme(clear);


            expect(fg.context.currentColorScheme).toBe(clear);
            expect(Object.keys(clear.overlays).length).toBe(4);
            expect(clear.overlays["A"]).toBe("overlay:A");
            expect(clear.overlays["B"]).toBe("overlay:B");
            expect(clear.overlays["C"]).toBe("color:C");
            expect(clear.overlays["Clear"]).toBe("color:Clear");
        });


        it('should not fill overlays if config does not exist', function () {
            fg.context = new FG_Context();
            var clear = new FG_Color_Clear();
            fg.context.setColorScheme(clear);


            expect(fg.context.currentColorScheme).toBe(clear);
            expect(Object.keys(clear.overlays).length).toBe(0);
        });
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

        it('should reset overlay', function () {
            fg.overlaying = true;
            fg.context.currentColorScheme.currentOverlay = "some overlay";
            var redrawn = false;

            fg.draw = {
                reapplyColor: function (c) {
                    redrawn = true;
                }
            };
            fg.toggle_overlay();

            expect(fg.overlayEl.classList.class[0]).toEqual("hide");
            expect(fg.overlayBtn.classList.class.length).toEqual(0);
            expect(fg.overlay).toBe(false);
            expect(fg.overlaying).toBe(false);
            expect(redrawn).toBe(true);
            expect(fg.context.currentColorScheme.currentOverlay).toBe(undefined);
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
            fg.colorSchemeUri = "ColorScheme";
            fg.frameFilterNames = "FrameFilter";

            var objs = fg.objectsToLoad();

            expect(objs.length).toBe(2);
            expect(objs[0].getUrl()).toEqual("js/color/FG_Color_ColorScheme.js");
            expect(objs[0].appendInstallScript("")).toEqual("\nfg.context.setColorScheme(new FG_Color_ColorScheme());");
            expect(objs[1].getUrl()).toEqual("js/frame/FG_Filter_FrameFilter.js");
            expect(objs[1].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new FG_Filter_FrameFilter());");

        });

        it("should generate DynamicallyLoading objects from urls", function () {
            fg.colorSchemeUri = "/js/MyCustomColorScheme.js";
            fg.frameFilterNames = "/js/fgrav/custom/MyFrameFilter.js";

            var objs = fg.objectsToLoad();

            expect(objs.length).toBe(2);
            expect(objs[0].getUrl()).toEqual("/js/MyCustomColorScheme.js");
            expect(objs[0].appendInstallScript("")).toEqual("\nfg.context.setColorScheme(new MyCustomColorScheme());");
            expect(objs[1].getUrl()).toEqual("/js/fgrav/custom/MyFrameFilter.js");
            expect(objs[1].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new MyFrameFilter());");

        });

        it("should generate multiple DynamicallyLoading objects", function () {
            fg.colorSchemeUri = "ColorScheme";
            fg.frameFilterNames = "FrameFilter1,FrameFilter2,/js/MyCustomFilter.js";

            var objs = fg.objectsToLoad();

            expect(objs.length).toBe(4);
            expect(objs[0].getUrl()).toEqual("js/color/FG_Color_ColorScheme.js");
            expect(objs[0].appendInstallScript("")).toEqual("\nfg.context.setColorScheme(new FG_Color_ColorScheme());");
            expect(objs[1].getUrl()).toEqual("js/frame/FG_Filter_FrameFilter1.js");
            expect(objs[1].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new FG_Filter_FrameFilter1());");
            expect(objs[2].getUrl()).toEqual("js/frame/FG_Filter_FrameFilter2.js");
            expect(objs[2].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new FG_Filter_FrameFilter2());");
            expect(objs[3].getUrl()).toEqual("/js/MyCustomFilter.js");
            expect(objs[3].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new MyCustomFilter());");

        });
    });


    describe("when loadDynamicJs invoked ", function () {

        beforeEach(function () {
            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("js/frame/FG_Filter_Test.js").andReturn({
                responseText: "function FG_Filter_Test() {}\n" +
                    " FG_Filter_Test.prototype.filter = function(name) {" +
                    "    return name + name;" +
                    "}"
            });
            jasmine.Ajax.stubRequest("js/frame/FG_Filter_Other.js").andReturn({
                responseText: "function FG_Filter_Other() {}\n" +
                    " FG_Filter_Other.prototype.filter = function(name) {" +
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
                    "FG_Color_Test.prototype.colorFor = function(f, s) {" +
                    "    return 'rgb(122,122,122)';" +
                    "}"
            });
            frameFilter.reset();
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });


        it("should load dynamic js file", function (done) {
            fg.loadDynamicJs([new DynamicallyLoading("js/frame/FG_Filter_Test.js", "frameFilter.filters.push(new FG_Filter_Test());")], function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("js/frame/FG_Filter_Test.js");
                    expect(request.method).toBe('GET');

                    expect(frameFilter.filters[0].filter('foo')).toEqual("foofoo");

                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });
        });

        it("should load dynamic js file with additional installation script", function (done) {
            fg.loadDynamicJs([new DynamicallyLoading("js/color/FG_Color_Test.js", "loaded1 = new FG_Color_Test();")], function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("js/color/FG_Color_Test.js");
                    expect(request.method).toBe('GET');

                    expect(loaded1.colorFor()).toEqual("rgb(122,122,122)");

                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });
        });

        it("should load multiple dynamic js filters and colors", function (done) {
            fg.loadDynamicJs([
                new DynamicallyLoading("js/frame/FG_Filter_Other.js", "frameFilter.filters.push(new FG_Filter_Other());"),
                new DynamicallyLoading("js/color/FG_Color_Test.js", "loaded2 = new FG_Color_Test();"),
                new DynamicallyLoading("js/frame/FG_Filter_Test.js", "frameFilter.filters.push(new FG_Filter_Test());")], function () {

                try {
                    expect(frameFilter.filters.length).toEqual(2);
                    expect(frameFilter.filters[0].filter('foo')).toEqual("x");
                    expect(frameFilter.filters[1].filter('foo')).toEqual("foofoo");
                    expect(loaded2.colorFor()).toEqual("rgb(122,122,122)");

                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });
        });
    });

    describe("when loading overlay ", function () {

        beforeEach(function () {
            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("js/color/overlay/FG_Overlay_Test.js").andReturn({
                responseText: "" +
                    "function FG_Overlay_Test() {}\n" +
                    "FG_Overlay_Test.prototype.applyStyle = function(c, f, s) {" +
                    "    return function(element) {" +
                    "       element.setAttribute('fill', (f.name === 'overlay') ? 'rgb(123,123,123)' : c.colorFor(f, s));" +
                    "    }" +
                    "};"
            });
            jasmine.Ajax.stubRequest("js/color/FG_Color_Test.js").andReturn({
                responseText: "" +
                    "function FG_Color_Test() {\n" +
                    "    FG_Color.call(this);\n" +
                    "}\n" +
                    "FG_Color_Test.prototype = Object.create(FG_Color.prototype);\n" +
                    "FG_Color_Test.prototype.constructor = FG_Color_Test;\n" +
                    "FG_Color_Test.prototype.colorFor = function(f, s) {" +
                    "    return 'rgb(66,66,66)';" +
                    "}"
            });
            frameFilter.reset();
            fg.context.currentColorScheme = new FG_Color_Black();
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });


        it("should load dynamic overlay js file", function (done) {
            var redrawn = false;

            fg.overlayBtn = domElement();
            fg.draw = {
              reapplyColor: function (c) {
                  redrawn = true;
              }
            };
            loadedO = {
                context: new FG_Context()
            };
            loadedO.context.setColorScheme(new FG_Color_Black());

            fg.loadOverlay("MyOTest", "overlay:Test", function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("js/color/overlay/FG_Overlay_Test.js");
                    expect(request.method).toBe('GET');
                    expect(redrawn).toBe(true);
                    expect(fg.overlayBtn.firstChild.nodeValue).toBe("Reset MyOTest");

                    var el = domElement();
                    loadedO.context.currentColorScheme.applyColor({ name: 'overlay'})(el);
                    expect(el.getAttributeValue("fill")).toEqual("rgb(123,123,123)");
                    loadedO.context.currentColorScheme.applyColor({ name: 'do not overlay. original color'})(el);
                    expect(el.getAttributeValue("fill")).toEqual("black");

                    done();
                } catch (e) {
                    done(e);
                }
            }, "loadedO");
        });


        it("should load dynamic color scheme js file as overlay", function (done) {
            var redrawn = false;
            var redrawnLegend = false;
            var redrawnOverlayDropDown = false;
            fg.draw = {
                reapplyColor: function (c) {
                    redrawn = true;
                },
                drawLegend: function (c, old) {
                    redrawnLegend = true;
                },
                drawOverlayDropDown: function (c, btn, old) {
                    redrawnOverlayDropDown = true;
                }
            };
            loadedC = {
                context: new FG_Context()
            };
            loadedC.context.setColorScheme(new FG_Color_Black());


            fg.loadOverlay("MyCTest", "color:Test", function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("js/color/FG_Color_Test.js");
                    expect(request.method).toBe('GET');

                    var el = domElement();
                    loadedC.context.currentColorScheme.applyColor({ name: 'x'})(el);
                    expect(el.getAttributeValue("fill")).toEqual("rgb(66,66,66)");

                    expect(redrawn).toBe(true);
                    expect(redrawnLegend).toBe(true);
                    expect(redrawnOverlayDropDown).toBe(true);

                    done();
                } catch (e) {
                    done(e);
                }
            }, "loadedC");
        });

        it("should load already loaded overlay object", function () {
            var redrawn = false;

            fg.overlayBtn = domElement();
            fg.draw = {
                reapplyColor: function (c) {
                    redrawn = true;
                }
            };

            fg.context.overlay["My Test"] = {
                applyStyle: function(c, f, s) {
                    return function(element) {
                        element.setAttribute("fill", (f.name === 'overlay') ?  'rgb(80,80,80)': c.colorFor(f, s));
                    }
                }
            };

            fg.loadOverlay("My Test", "overlay:Test");

            var el = domElement();
            fg.context.currentColorScheme.applyColor({ name: 'overlay'})(el);
            expect(el.getAttributeValue("fill")).toEqual("rgb(80,80,80)");
            fg.context.currentColorScheme.applyColor({ name: 'do not overlay. original color'})(el);
            expect(el.getAttributeValue("fill")).toEqual("black");

            expect(redrawn).toBe(true);

            expect(fg.overlayBtn.firstChild.nodeValue).toBe("Reset My Test");
        });

        it("should load already loaded color scheme object", function () {
            var redrawn = false;
            var redrawnLegend = false;
            var redrawnOverlayDropDown = false;
            fg.draw = {
                reapplyColor: function (c) {
                    redrawn = true;
                },
                drawLegend: function (c, old) {
                    redrawnLegend = true;
                },
                drawOverlayDropDown: function (c, btn, old) {
                    redrawnOverlayDropDown = true;
                }
            };

            fg.context.color["My Test"] = new MyCustomColorScheme();

            fg.loadOverlay("My Test", "color:Test");

            var el = domElement();
            fg.context.currentColorScheme.applyColor({ name: 'x'})(el);
            expect(el.getAttributeValue("fill")).toEqual("orange");

            expect(redrawn).toBe(true);
            expect(redrawnLegend).toBe(true);
            expect(redrawnOverlayDropDown).toBe(true);
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

            fg.context.currentColorScheme = {
                legend: { red: 'a', yellow: 'b'}
            };
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