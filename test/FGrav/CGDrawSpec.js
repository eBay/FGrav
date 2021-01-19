describe("CGDraw", function() {

    var d;
    var w;
    var draw;

    beforeEach(function () {
        draw = new CGDraw(new CG(w), d);
    });

    afterEach(function () {
        colorScheme = undefined;
    });

    it('should draw blue for type memory', function () {
        expect(colorScheme.colorFor("MEMORY", 1)).toEqual("rgb(140,140,255)");
    });

    it('should draw red for type cpu', function () {
        expect(colorScheme.colorFor("CPU", 1)).toEqual("rgb(255,130,130)");
    });

    it('should draw yellow for other', function () {
        expect(colorScheme.colorFor("OTHER", 1)).toEqual("rgb(230,230,70)");
    });

    it('should draw grey for none', function () {
        expect(colorScheme.colorFor()).toEqual("rgb(192, 192, 192)");
    });
});