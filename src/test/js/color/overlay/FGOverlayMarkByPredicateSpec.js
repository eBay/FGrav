describe("FGOverlayMarkByPredicate", function () {

    var scheme;
    var overlay;
    var el;

    beforeEach(function () {
        var prefixes = [ "prefix1", "prefix2", "prefix3"];
        overlay = new FGOverlayMarkByPredicate(function (frame) {
            return function () {
                return prefixes.find(function (prefix) {
                    return frame.name.startsWith(prefix);
                });
            };
        });
        scheme = new FG_Color();

        scheme.colorFor = function (frame, samples) {
            return "black";
        };

        el = domElement();
    });

    it("should not overlay style and keep original color when prefix does not match", function () {

        var style = overlay.applyStyle(scheme, {name:'not_a_match_for_prefixes'});

        style(el);

        expect(el.getAttribute("style")).toEqual(undefined);
        expect(el.getAttributeValue("fill")).toEqual('black');

    });

    it("should overlay style and keep original color on a matched prefix", function () {

        var style = overlay.applyStyle(scheme, {name:'prefix222222'});

        style(el);

        expect(el.getAttributeValue("style")).toEqual('stroke-width:3;stroke:rgb(0,0,0)');
        expect(el.getAttributeValue("fill")).toEqual('black');
    });

});