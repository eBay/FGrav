describe("FG_Filter_Java8", function () {

    var f =  new FG_Filter_Java8();

    it("should return same string", function () {

        expect(f.filter('com.ebay.Foo')).toEqual('com.ebay.Foo');
    });

    it("should still return same string", function () {

        expect(f.filter('com.ebay.Foo$lambda.main$0')).toEqual('com.ebay.Foo$lambda.main$0');
    });

    it("should replace index numbers with underscore", function () {

        expect(f.filter("com.ebay.Foo$$Lambda$1/791452441.run")).toEqual('com.ebay.Foo$$Lambda$1/_.run');
    });

    it("should replace index hex numbers with underscore", function () {

        expect(f.filter("com.ebay.Foo$$Lambda$1/0x000000080009f040.run")).toEqual('com.ebay.Foo$$Lambda$1/_.run');
    });
});