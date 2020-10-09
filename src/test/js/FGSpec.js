describe("FG", function() {

    var loc;
    var fg;
    var g;
    var textNode;

    beforeEach(function () {
        fg = new FG(undefined, 2, "TITLE", loc);
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
        colorScheme.legend = {};

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
            }
        };
    });

    afterEach(function () {
        colorScheme.legend = {};
    });

    describe("when loading", function() {
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
            expect(objs[0].getUrl()).toEqual("js/MyCustomColorScheme.js");
            expect(objs[0].appendInstallScript("")).toEqual("\ncolorScheme = new MyCustomColorScheme();");
            expect(objs[1].getUrl()).toEqual("js/fgrav/custom/MyFrameFilter.js");
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
            expect(objs[3].getUrl()).toEqual("js/MyCustomFilter.js");
            expect(objs[3].appendInstallScript("")).toEqual("\nframeFilter.filters.push(new MyCustomFilter());");

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
            children = [];

            fg.svg = {
                getElementById: function (id) {
                    return {
                        children: children
                    }
                }
            };

            fg.unzoombtn = domElement();
        });

        it("unzoom should hide unzoom button", function() {
            fg.unzoom();
            expect(fg.unzoombtn.classList.class).toEqual(["hide"]);
        });

        it("unzoom should remove parent and hide class", function() {
            children = [a, b, c];
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

    function domElement() {
        return {
            attributes: {},
            getAttribute: function(k) {
                return this.attributes[k];
            },
            setAttribute: function(k, v) {
                this.attributes[k] = { value: v };
            },
            setAttributes: function(k1, v1, k2, v2, k3, v3) {
                this.setAttribute(k1, v1);
                this.setAttribute(k2, v2);
                this.setAttribute(k3, v3);
            },
            classList: {
                class: [],
                add: function (c) {
                    this.class.push(c);
                },
                remove: function (c) {
                    this.class = this.class.filter(function(e) { return e !== c });
                }
            }
        };
    }

    function domGroupElement() {
        var el = domElement();
        el.rect = domElement();
        el.text = domElement();
        el.querySelectorAll = function (selector) {
            if (selector === 'rect') {
                return [this.rect];
            }
            if (selector === 'text') {
                return [this.text];
            }

            return [];
        };
        return el;
    }

});