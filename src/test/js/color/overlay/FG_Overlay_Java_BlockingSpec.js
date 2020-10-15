describe("FG_Overlay_Java_Blocking", function () {

    var overlay;

    beforeEach(function () {
        overlay = new FG_Overlay_Java_Blocking();
    });

    it("should not override original color by returning null", function () {

        expect(overlay.colorFor({name:'java/lang/Thread.run'})).toEqual(null);

    });

    it("should override color to white on blocking code", function () {

        expect(overlay.colorFor({name:'java/lang/Thread.sleep'})).toEqual('white');
    });

});