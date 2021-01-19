describe("FG_Color_Js", function () {

    var color;

    beforeEach(function () {
        color = new FG_Color_Js();
    });

    it("javascript frame color should be green", function () {

        expect(color.colorFor({name:'LazyCompile:*Async$consumeFunctionBuffer /apps/node/webapp/node_modules/xxxxx/js/main/async.js:39_[j]'})).toEqual('rgb(77,225,77)');
        expect(color.colorFor({name:'/apps/node/webapp/node_modules/xxxxx/js/main/async.js:39'})).toEqual('rgb(85,232,85)');

    });

    it("uknown frame color should be red", function () {

        expect(color.colorFor({name:'uv__io_poll'})).toEqual('rgb(215,72,72)');
    });

    it("kernel frame color should be orange", function () {

        expect(color.colorFor({name:'Call_[k]'})).toEqual('rgb(216,116,0)');
    });


    it("VM frame color should be yellow", function () {

        expect(color.colorFor({name:'v8::Function::Call'})).toEqual('rgb(187,187,54)');
        expect(color.colorFor({name:'node::Start'})).toEqual('rgb(193,193,57)');
    });

    it("inlined frame color should be cyan", function () {

        expect(color.colorFor({name:'RegExp:\\bFoo ?Bar_[j]'})).toEqual('rgb(79,192,192)');
        expect(color.colorFor({name:'LazyCompile:_tickDomainCallback node.js:387_[j]'})).toEqual('rgb(77,189,189)');
    });
});