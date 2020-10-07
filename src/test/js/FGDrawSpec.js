describe("FGDraw", function () {

    describe("FG_Color_Default", function () {

        it("frame color should match random number and name", function () {
            expect(new FG_Color_Default().colorFor({name: 'a'}, 0.5)).toEqual('rgb(239,139,0)');
        });
    });
});