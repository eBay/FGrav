describe("FG_Overlay_Java_Reflection", function () {

    var scheme;
    var overlay;
    var el;

    beforeEach(function () {
        overlay = new FG_Overlay_Java_Reflection();
        scheme = new FG_Color();

        scheme.colorFor = function (frame, samples) {
            return "black";
        };

        el = domElement();
    });

    it("should not overlay style and keep original color on non reflection code", function () {

        var style = overlay.applyStyle(scheme, {name:'java/lang/String.toString'});

        style(el);

        expect(el.getAttribute("style")).toEqual(undefined);
        expect(el.getAttributeValue("fill")).toEqual('black');

    });

    it("should overlay style and keep original color on reflection code", function () {

        var style = overlay.applyStyle(scheme, {name:'java/lang/Class.loadClass'});

        style(el);

        expect(el.getAttributeValue("style")).toEqual('stroke-width:3;stroke:rgb(0,0,0)');
        expect(el.getAttributeValue("fill")).toEqual('black');
    });

});