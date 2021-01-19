describe("CG", function() {

    var cg;
    var w;
    var node;

    beforeEach(function () {
        node = {
            childNodes: [ {
                tagName: 'title',
                firstChild: {
                    nodeValue: 'my-value'
                }
            } ]
        };
        w = {
            opened: [],
            open: function(url) {
                this.opened.push(url);
            },
            location: {},
            document: {
                getElementsByTagName: function () {
                    return [ node ];
                },
                getElementById: function (id) {}
            }
        };


        cg = new CG(w);
        cg.details = {};
    });


    it('should show text', function () {

        cg.s(node);

        expect(cg.details.nodeValue).toEqual('my-value');
    });

    it('should clear text', function () {

        cg.s(node);

        cg.c();

        expect(cg.details.nodeValue).toEqual(' ');
    });

    it('should open url', function () {

        cg.fg('my-url', w);

        expect(w.opened[0]).toEqual('my-url');
    });

});