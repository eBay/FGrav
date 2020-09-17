describe("FG_Filter_RemoveJavaGCThreads", function () {


    it("should return same string", function () {

        expect(filterJavaGCThreads('com.ebay.Foo')).toEqual('com.ebay.Foo');
    });

    it("should filter string", function () {

        expect(filterJavaGCThreads("start_thread;java_start(Thread*);GangWorker::loop();ParNewGenTask::work(unsigned int)")).toBeNull();
    });
});