describe("CGDraw", function() {

    var cg;
    var draw;

    beforeEach(function () {
        cg = new CG();
        cg.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        draw = new CGDraw(cg);
    });

    it('should draw blue for type memory', function () {
        expect(draw.colorScheme.colorFor("MEMORY", 1)).toEqual("rgb(140,140,255)");
    });

    it('should draw red for type cpu', function () {
        expect(draw.colorScheme.colorFor("CPU", 1)).toEqual("rgb(255,130,130)");
    });

    it('should draw yellow for other', function () {
        expect(draw.colorScheme.colorFor("OTHER", 1)).toEqual("rgb(230,230,70)");
    });

    it('should draw grey for none', function () {
        expect(draw.colorScheme.colorFor()).toEqual("rgb(192, 192, 192)");
    });

    it('should draw a canvas', function () {
        draw.drawCanvas();

        expect(cg.details).not.toBe(undefined);
    });

    it('should draw legend', function () {
        draw.drawLegend();

        var l = cg.svg.getElementById("legend");

        expect(l.localName).toBe("g");
        expect(l.children.length).toBe(4);
        expect(l.children[0].getAttribute("fill")).toEqual("red");
        expect(l.children[1].innerHTML).toEqual("CPU");
        expect(l.children[2].getAttribute("fill")).toEqual("blue");
        expect(l.children[3].innerHTML).toEqual("MEMORY");
    });

    it('should draw cg', function () {

        var cgEvents = new CalendarEvents();

        draw.drawCG(cgEvents);

        expect(cg.svg.children.length > 0).toBe(true);
    });
});