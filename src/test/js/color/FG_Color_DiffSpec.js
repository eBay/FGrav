describe("FG_Color_Diff", function () {


    it("frame color should be red for growth", function () {
        expect(diffColorFor({individualSamples:[50, 80]}, [100, 100])).toEqual('rgb(255,220,220)');
    });

    it("frame color should be blue for reduction", function () {
        expect(diffColorFor({individualSamples:[80, 50]}, [100, 100])).toEqual('rgb(220,220,255)');
    });

    it("frame color should be vary relative to change", function () {
        expect(diffColorFor({individualSamples:[100, 50]}, [100, 100])).toEqual('rgb(192,192,255)');
        expect(diffColorFor({individualSamples:[80, 50]}, [100, 100])).toEqual('rgb(220,220,255)');
        expect(diffColorFor({individualSamples:[75, 50]}, [100, 100])).toEqual('rgb(227,227,255)');
        expect(diffColorFor({individualSamples:[55, 50]}, [100, 100])).toEqual('rgb(253,253,255)');
        expect(diffColorFor({individualSamples:[50, 100]}, [100, 100])).toEqual('rgb(255,192,192)');
        expect(diffColorFor({individualSamples:[50, 80]}, [100, 100])).toEqual('rgb(255,220,220)');
        expect(diffColorFor({individualSamples:[50, 75]}, [100, 100])).toEqual('rgb(255,227,227)');
        expect(diffColorFor({individualSamples:[50, 55]}, [100, 100])).toEqual('rgb(255,253,253)');
    });

    it("frame color should be white for no change", function () {

        expect(diffColorFor({individualSamples:[50, 50]}, [100, 100])).toEqual('white');
    });
});