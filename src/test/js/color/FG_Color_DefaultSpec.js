describe("FG_Color_Default", function () {


    it("frame color should match random number and name", function () {

        expect(defaultColorFor({name:'a'},0.5)).toEqual('rgb(239,139,0)');
    });
});