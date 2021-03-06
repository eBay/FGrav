

describe("MergedCollapsed", function() {

    var collapsed;

    beforeEach(function () {
        collapsed = new MergedCollapsed(2);
    });

    describe("when parseCollapsed invoked ", function () {

        it("should parsed merged collapsed content", function () {
            collapsed.parseCollapsed(["a;b;c 1 0","a;b;d 0 2","a;x;d 3 4"]);

            expect(collapsed.paths.length).toEqual(3);
            expect(collapsed.totalSamples).toEqual(10);
            expect(collapsed.minSample).toEqual(1);
            expect(collapsed.totalIndividualSamples.length).toEqual(2);
            expect(collapsed.totalIndividualSamples[0]).toEqual(4);
            expect(collapsed.totalIndividualSamples[1]).toEqual(6);
        });
    });



    describe("when updating a frame ", function () {

        it("should calculate individual samples count for every case", function () {
            collapsed.parseCollapsed(["a;b;c 1 0","a;b;c;d 0 2","a;x;d 3 4"]);
            var f = {samples:0};
            collapsed.updateFrame(f, collapsed.paths[2], 0);

            expect(f.individualSamples[0]).toEqual(3);
            expect(f.individualSamples[1]).toEqual(4);


            collapsed.updateFrame(f, collapsed.paths[2], 0);

            expect(f.individualSamples[0]).toEqual(6);
            expect(f.individualSamples[1]).toEqual(8);
        });
    });

    it('should clear state', function () {
        collapsed.parseCollapsed(["a;b;c 1 0","a;b;d 0 2","a;x;d 3 4"]);

        expect(collapsed.merged).toEqual(2);
        expect(collapsed.totalSamples).toEqual(10);

        collapsed.clear();

        expect(collapsed.merged).toEqual(2);
        expect(collapsed.totalSamples).toEqual(0);
        expect(collapsed.paths.length).toEqual(0);
        expect(collapsed.totalIndividualSamples).toBe(undefined);

    });

    describe("MergedComponentCollapsed", function () {

        var collapsed;

        it("should parsed first component from merged collapsed content", function () {
            collapsed = new MergedComponentCollapsed(2, 0);
            collapsed.parseCollapsed(["a;b;c 1 0","a;b;d 0 2","a;x;d 3 4"]);

            expect(collapsed.paths.length).toEqual(3);
            expect(collapsed.paths[0].samples).toEqual(1);
            expect(collapsed.paths[1].samples).toEqual(0);
            expect(collapsed.paths[2].samples).toEqual(3);

            expect(collapsed.totalSamples).toEqual(4);
            expect(collapsed.minSample).toEqual(0);
            expect(collapsed.totalIndividualSamples.length).toEqual(2);
            expect(collapsed.totalIndividualSamples[0]).toEqual(4);
            expect(collapsed.totalIndividualSamples[1]).toEqual(6);
        });

        it("should parsed second component from merged collapsed content", function () {
            collapsed = new MergedComponentCollapsed(2, 1);
            collapsed.parseCollapsed(["a;b;c 1 0","a;b;d 0 2","a;x;d 3 4"]);

            expect(collapsed.paths.length).toEqual(3);
            expect(collapsed.paths[0].samples).toEqual(0);
            expect(collapsed.paths[1].samples).toEqual(2);
            expect(collapsed.paths[2].samples).toEqual(4);

            expect(collapsed.totalSamples).toEqual(6);
            expect(collapsed.minSample).toEqual(0);
            expect(collapsed.totalIndividualSamples.length).toEqual(2);
            expect(collapsed.totalIndividualSamples[0]).toEqual(4);
            expect(collapsed.totalIndividualSamples[1]).toEqual(6);
        });

    });
});