describe("FG_Color_Java", function () {


    it("java frame color should be green", function () {

        expect(javaColorFor({name:'Lorg/eclipse/jetty/util/thread/QueuedThreadPool:::runJob'})).toEqual('rgb(86,233,86)');
        expect(javaColorFor({name:'java/lang/Thread.run'})).toEqual('rgb(75,223,75)');

    });

    it("uknown frame color should be red", function () {

        expect(javaColorFor({name:'[libjvm.so]'})).toEqual('rgb(226,88,88)');
        expect(javaColorFor({name:'Interpreter'})).toEqual('rgb(225,87,87)');
    });

    it("kernel frame color should be orange", function () {

        expect(javaColorFor({name:'tcp_transmit_skb_[k]'})).toEqual('rgb(224,124,0)');
    });

    it("inlined frame color should be cyan", function () {

        expect(javaColorFor({name:'Lorg/eclipse/jetty/util/thread/M:::produce_[i]'})).toEqual('rgb(73,186,186)');
    });

    it("jit annotated frame color should be green", function () {

        expect(javaColorFor({name:'Lorg/eclipse/jetty/util/thread/M:::produce_[j]'})).toEqual('rgb(75,223,75)');
    });

    it("JVM frame color should be yellow", function () {

        expect(javaColorFor({name:'ParNewGenTask::work(unsigned int)'})).toEqual('rgb(205,205,61)');
    });
});