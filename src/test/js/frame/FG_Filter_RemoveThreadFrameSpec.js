describe("FG_Filter_RemoveThreadFrame", function () {

    var f = new FG_Filter_RemoveThreadFrame();

    it("should return same string", function () {

        expect(f.filter('com.ebay.Foo')).toEqual('com.ebay.Foo');
    });

    it("should filter first frame", function () {

        expect(f.filter("[reactor-http-nio-32 tid=12051];start_thread;java_start(Thread*);GangWorker::loop()"))
                                                          .toEqual("start_thread;java_start(Thread*);GangWorker::loop()");
    });
});