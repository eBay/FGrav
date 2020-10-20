describe("FG_Overlay_Java_Blocking", function () {

    var scheme;
    var overlay;
    var el;

    beforeEach(function () {
        overlay = new FG_Overlay_Java_Blocking();
        scheme = new FG_Color();

        scheme.colorFor = function (frame, samples) {
            return "black";
        };

        el = domElement();
    });

    it("should not overlay style and keep original color on non blocking code", function () {

        var style = overlay.applyStyle(scheme, {name:'java/lang/Thread.run'});

        style(el);

        expect(el.getAttribute("style")).toEqual(undefined);
        expect(el.getAttributeValue("fill")).toEqual('black');

    });

    it("should overlay style and keep original color on blocking code", function () {

        var style = overlay.applyStyle(scheme, {name:'java/lang/Thread.sleep'});

        style(el);

        expect(el.getAttributeValue("style")).toEqual('stroke-width:3;stroke:rgb(0,0,0)');
        expect(el.getAttributeValue("fill")).toEqual('black');
    });

});