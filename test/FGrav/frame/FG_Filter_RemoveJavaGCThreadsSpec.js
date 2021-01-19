describe("FG_Filter_RemoveJavaGCThreads", function () {

    var f =  new FG_Filter_RemoveJavaGCThreads();

    it("should return same string", function () {

        expect(f.filter('com.ebay.Foo')).toEqual('com.ebay.Foo');
    });

    it("should filter string", function () {

        expect(f.filter("start_thread;java_start(Thread*);GangWorker::loop();ParNewGenTask::work(unsigned int)")).toBeNull();
    });
});