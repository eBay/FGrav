

describe("FGravDraw", function() {

    var t;
    var d;

    beforeEach(function () {
        d = {
            createElementNS: function(ns, name) {
                return domElement();
            }
        };
        t = new FGravDraw(new FGrav(1, 2, 3, 4, "TITLE"), d);
        colorScheme = {
            legend: {}
        };
    });

    afterEach(function () {
        colorScheme = {
            legend: {}
        };
    });

    describe("draw rect", function () {

        it('should draw rectangle', function () {

            var r = t.rect(17, 19, 23, 29, function (el) {
                el.setAttribute("fill", "red");
                el.setAttribute("style", "fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)");
            });

            expect(r.getAttribute("x")).toEqual(17);
            expect(r.getAttribute("y")).toEqual(19);
            expect(r.getAttribute("width")).toEqual(23);
            expect(r.getAttribute("height")).toEqual(29);
            expect(r.getAttribute("fill")).toEqual("red");
            expect(r.getAttribute("style")).toEqual("fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)");
        });

    });

    describe("when colorValueFor invoked", function () {

        beforeEach(function () {
            spyOn(Math, "random").and.returnValue(0.5);
        });

        it("should return random red color", function () {
            expect(colorValueFor("red")).toEqual("rgb(228,90,90)");
        });

        it("should make red color gradient based on name", function () {
            expect(colorValueFor("red", "name")).toEqual("rgb(218,77,77)");
        });

        it("should make red color gradient based on 0.99", function () {
            expect(colorValueFor("red", undefined, 0.99)).toEqual("rgb(254,129,129)");
        });
    });

    describe("when textToFit is ivoked", function () {

        it("should return full text", function () {
            expect(t.textToFit("text", 80, 8)).toEqual("text");
        });


        it("should crop text to fit width", function () {
            expect(t.textToFit("text", 16, 8)).toEqual("t..");
        });

        it("should crop all text if cannot fit 3 characters", function () {
            expect(t.textToFit("text", 8, 8)).toEqual("");
        });
    });


    function domElement() {
        return {
            attributes: {},
            getAttribute: function(k) {
                return this.attributes[k];
            },
            setAttribute: function(k, v) {
                this.attributes[k] = v;
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
            },
        };
    }

});