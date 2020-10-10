describe("MultiFG", function () {


    var fg1, fg2;
    var multiFg = new MultiFG();


    beforeEach(function () {
        fg1 = new FG('1', 2, "TITLE1", undefined);
        fg2 = new FG('2', 2, "TITLE2", undefined);
        multiFg.registerFG(fg1);
        multiFg.registerFG(fg2);
    });

    describe("set dimensions", function () {

        it("should set height to be max of all inner FGs", function () {
            fg1.height = 1000;
            fg2.height = 700;

            multiFg.setDimensions();

            expect(multiFg.height).toBe(1000);
        });

        it("should set width to be total of all inner FGs plus margin", function () {
            fg1.width = 1000;
            fg2.width = 700;

            multiFg.setDimensions();

            expect(multiFg.width).toBe(1700 + multiFg.margin);
        });

        it("should set font and frame sizes in all to be minimum of all inner FGs", function () {
            fg1.fontSize = 11;
            fg2.fontSize = 12;
            fg1.frameHeight = 13;
            fg2.frameHeight = 10;
            fg1.textPadding = 5;
            fg2.textPadding = 6;
            fg1.minDisplaySample = 1;
            fg2.minDisplaySample = 2;

            multiFg.setDimensions();

            expect(multiFg.fontSize).toBe(11);
            expect(fg1.fontSize).toBe(11);
            expect(fg2.fontSize).toBe(11);
            expect(multiFg.frameHeight).toBe(10);
            expect(fg1.frameHeight).toBe(10);
            expect(fg2.frameHeight).toBe(10);
            expect(multiFg.textPadding).toBe(5);
            expect(fg1.textPadding).toBe(5);
            expect(fg2.textPadding).toBe(5);
            expect(multiFg.minDisplaySample).toBe(1);
            expect(fg1.minDisplaySample).toBe(1);
            expect(fg2.minDisplaySample).toBe(1);
        });

        it("should set shiftHeight on inner FGs to be the difference between the multi FG height and the original", function () {
            fg1.height = 1000;
            fg2.height = 700;

            multiFg.setDimensions();

            expect(fg1.shiftHeight).toBe(0);
            expect(fg2.shiftHeight).toBe(300);
        });
    });

});