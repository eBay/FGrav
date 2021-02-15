describe("MultiFG", function () {


    var fg1, fg2;
    var multiFg;
    var searchTerm;
    var draw, draw1, draw2;

    describe("set dimensions", function () {


        beforeEach(function () {
            multiFg = new MultiFG();
            fg1 = new FG('1', 2, "TITLE1");
            fg2 = new FG('2', 2, "TITLE2");
            multiFg.registerFG(fg1);
            multiFg.registerFG(fg2);
        });

        it("should set height to be max of all inner FGs", function () {
            fg1.height = 1000;
            fg2.height = 700;

            multiFg.setDimensions();

            expect(multiFg.height).toBe(1000);
        });

        it("should set width to be total of all inner FGs plus margin", function () {
            fg1.width = 1000;
            fg2.width = 700;

            multiFg.setDimensions();

            expect(multiFg.width).toBe(1700 + multiFg.margin);
        });

        it("should set font and frame sizes in all to be minimum of all inner FGs", function () {
            fg1.fontSize = 11;
            fg2.fontSize = 12;
            fg1.frameHeight = 13;
            fg2.frameHeight = 10;
            fg1.textPadding = 5;
            fg2.textPadding = 6;
            fg1.minDisplaySample = 1;
            fg2.minDisplaySample = 2;

            multiFg.setDimensions();

            expect(multiFg.fontSize).toBe(11);
            expect(fg1.fontSize).toBe(11);
            expect(fg2.fontSize).toBe(11);
            expect(multiFg.frameHeight).toBe(10);
            expect(fg1.frameHeight).toBe(10);
            expect(fg2.frameHeight).toBe(10);
            expect(multiFg.textPadding).toBe(5);
            expect(fg1.textPadding).toBe(5);
            expect(fg2.textPadding).toBe(5);
            expect(multiFg.minDisplaySample).toBe(1);
            expect(fg1.minDisplaySample).toBe(1);
            expect(fg2.minDisplaySample).toBe(1);
        });

        it("should set shiftHeight on inner FGs to be the difference between the multi FG height and the original", function () {
            fg1.height = 1000;
            fg2.height = 700;

            multiFg.setDimensions();

            expect(fg1.shiftHeight).toBe(0);
            expect(fg2.shiftHeight).toBe(300);
        });
    });

    describe("compare FGs", function () {

        beforeEach(function() {
            multiFg = new MultiFG();
            fg1 = new FG('1', 2, "TITLE1");
            fg2 = new FG('2', 2, "TITLE2");
            multiFg.registerFG(fg1);
            multiFg.registerFG(fg2);
            fg1.collapsedUrl = "1.collapsed";
            fg2.collapsedUrl = "2.collapsed";
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            multiFg.svg = svg;
            fg1.svg = svg;
            fg2.svg = svg;
            draw = new FGDraw(multiFg);
            draw1 = new FGDraw(fg1);
            draw2 = new FGDraw(fg2);


            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("1.collapsed").andReturn({
                responseText:
                    "a;b;c 1\n" +
                    "a;b;d 3\n"
            });
            jasmine.Ajax.stubRequest("2.collapsed").andReturn({
                responseText:
                    "a;b;c 2\n" +
                    "a;b;d 4\n"
            });
        });

        afterEach(function() {
            jasmine.Ajax.uninstall();
        });

        it('should show details on same node from both FGs and highlight other', function (done) {
            fg1.loadCollapsed(function (frames1) {
                fg2.loadCollapsed(function (frames2) {
                    try {
                        multiFg.setDimensions();
                        draw.drawCanvas();
                        draw1.drawFG(frames1);
                        draw1.drawInfoElements();
                        draw2.drawFG(frames2);
                        draw2.drawInfoElements();

                        var all1 = draw.svg.getElementById("1;all");
                        var all2 = draw.svg.getElementById("2;all");

                        multiFg.showDetails(all1);

                        expect(fg1.details.nodeValue).toEqual("all (4 samples, 100%)");
                        expect(fg2.details.nodeValue).toEqual("all (6 samples, 100%)");
                        expect(all2.getAttribute("class")).toEqual("highlight_g");

                        done();
                    } catch (e) {
                        done(e);
                    }
                },
                undefined,
                function () {
                    done.fail("ajax should succeed");
                });
            },
            undefined,
            function () {
                done.fail("ajax should succeed");
            });
        });

        it('should clear details on same node from both FGs', function (done) {
            fg1.loadCollapsed(function (frames1) {
                    fg2.loadCollapsed(function (frames2) {
                            try {
                                multiFg.setDimensions();
                                draw.drawCanvas();
                                draw1.drawFG(frames1);
                                draw1.drawInfoElements();
                                draw2.drawFG(frames2);
                                draw2.drawInfoElements();

                                var all1 = draw.svg.getElementById("1;all");
                                var all2 = draw.svg.getElementById("2;all");

                                multiFg.showDetails(all1);
                                multiFg.clearDetails(all1);

                                expect(fg1.details.nodeValue).toEqual(" ");
                                expect(fg2.details.nodeValue).toEqual(" ");
                                expect(all2.getAttribute("class")).toEqual(null);

                                done();
                            } catch (e) {
                                done(e);
                            }
                        },
                        undefined,
                        function () {
                            done.fail("ajax should succeed");
                        });
                },
                undefined,
                function () {
                    done.fail("ajax should succeed");
                });
        });
    });

    describe("delegate to FGs", function () {

        beforeEach(function () {
            var myWindow = {
                events: [],
                addEventListener: function (name, eventListener) {
                    this.events.push(name);
                },
                location: {},
                document: {
                    getElementsByTagName: function () {
                        return [ {} ];
                    },
                    getElementById: function (id) {}
                }
            };
            var myPrompt = function () {
                return searchTerm;
            };
            multiFg = new MultiFG(myWindow, myPrompt);
            fg1 = stubFG("1");
            fg2 = stubFG("2");
            multiFg.registerFG(fg1);
            multiFg.registerFG(fg2);
            multiFg.ignorecaseBtn = domElement();
            multiFg.searchbtn = domElement();
            multiFg.matchedtxt = domElement();
        });

        it('should delegate zoom to all FGs', function () {

            var node = {
                id: '1;nodeId'
            };

            multiFg.zoom(node);

            expect(fg1.actions[0]).toEqual("zoom");
            expect(fg2.actions[0]).toEqual("zoom");

        });

        it('should delegate unzoom to all FGs', function () {

            var node = {
                id: '2;nodeId'
            };

            multiFg.unzoom(node);

            expect(fg1.actions[0]).toEqual("unzoom");
            expect(fg2.actions[0]).toEqual("unzoom");

        });

        it('should delegate search to all FGs', function () {

            searchTerm = "search-me";
            var node = {
                id: '2;nodeId'
            };

            multiFg.search_prompt();

            expect(fg1.actions[0]).toEqual("search");
            expect(fg2.actions[0]).toEqual("search");

        });

        it('should toggle search off', function () {
            multiFg.searching = true;
            multiFg.currentSearchTerm = 'search-me';
            multiFg.searchbtn.classList.add("show");

            multiFg.search_prompt();

            expect(fg1.actions[0]).toEqual("reset_search");
            expect(fg2.actions[0]).toEqual("reset_search");
            expect(multiFg.searchbtn.classList.class.length).toEqual(0);
            expect(multiFg.searching).toBe(false);
            expect(multiFg.currentSearchTerm).toBe(null);
            expect(fg1.matchedtxt.classList.class[0]).toBe("hide");
            expect(fg1.matchedtxt.firstChild.nodeValue).toBe("");
            expect(fg2.matchedtxt.classList.class[0]).toBe("hide");
            expect(fg2.matchedtxt.firstChild.nodeValue).toBe("");
        });

        it('should return nothing and allow more searches if nothing was found ', function () {
            multiFg.searching = false;
            searchTerm = "search-this";

            multiFg.search_prompt();

            expect(multiFg.searchbtn.classList.class.length).toEqual(0);
            expect(multiFg.searching).toBe(false);
        });

        it('should delegate redrawFrames to all FGs', function () {

            multiFg.redrawFrames();

            expect(fg1.actions[0]).toEqual("redrawFrames");
            expect(fg2.actions[0]).toEqual("redrawFrames");

        });

        it('should delegate reload to all FGs', function () {

            multiFg.reload();

            expect(fg1.actions[0]).toEqual("reload");
            expect(fg2.actions[0]).toEqual("reload");

        });
    });

    function stubFG(id) {
        return {
            id: id,
            actions: [],
            zoom: function () {
                this.actions.push("zoom");
            },
            unzoom: function () {
                this.actions.push("unzoom");
            },
            search: function () {
                this.actions.push("search");
            },
            reset_search: function() {
                this.actions.push("reset_search");
            },
            reload: function() {
                this.actions.push("reload");
            },
            redrawFrames: function() {
                this.actions.push("redrawFrames");
            },
            svg: {
                getElementById: function(id) {
                    return {
                        id: id
                    };
                }
            },
            matchedtxt: domElement()
        }
    }

});