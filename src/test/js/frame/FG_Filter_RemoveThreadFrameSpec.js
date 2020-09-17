describe("FG_Filter_RemoveThreadFrame", function () {


    it("should return same string", function () {

        expect(filterRemoveFirstFrame('com.ebay.Foo')).toEqual('com.ebay.Foo');
    });

    it("should filter first frame", function () {

        expect(filterRemoveFirstFrame("[reactor-http-nio-32 tid=12051];start_thread;java_start(Thread*);GangWorker::loop()"))
                                                          .toEqual("start_thread;java_start(Thread*);GangWorker::loop()");
    });
});