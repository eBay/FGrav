describe("FG_Color", function () {

    var scheme;
    var el;

    beforeEach(function () {
        scheme = new FG_Color();

        scheme.colorFor = function (frame, samples) {
            return "black";
        };

        el = domElement();
    });

    it("should apply style from overlay only", function () {

        scheme.currentOverlay = new FG_MyOverlay();


        var style = scheme.applyColor("override", 17);
        style(el);

        expect(el.getAttributeValue("fill")).toEqual('white');
        expect(el.getAttribute("style")).toEqual(undefined);
    });

    it("should apply style from both overlay and color scheme", function () {

        scheme.currentOverlay = new FG_MyOverlay();

        var style = scheme.applyColor("overlay", 17);
        style(el);

        expect(el.getAttributeValue("fill")).toEqual('black');
        expect(el.getAttributeValue("style")).toEqual("stroke-width:3;stroke:rgb(0,0,0)");
    });

    it("should ignore overlay if no current is assigned", function () {

        var style = scheme.applyColor("name", 17);
        style(el);

        expect(el.getAttributeValue("fill")).toEqual('black');
        expect(el.getAttribute("style")).toEqual(undefined);
    });

    function FG_MyOverlay() {}

    FG_MyOverlay.prototype.applyStyle = function (colorScheme, frame, samples) {
        if (frame === "override") {
            return function (el) {
                el.setAttribute("fill", "white");
            };
        }
        else if (frame === "overlay"){
            return function (el) {
                el.setAttribute("style", "stroke-width:3;stroke:rgb(0,0,0)");
                el.setAttribute("fill", colorScheme.colorFor(frame, samples));
            };
        }
        return colorScheme.colorFor(frame, samples); // fallback to original color
    };

});