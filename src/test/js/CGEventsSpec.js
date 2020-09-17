describe("CalendarEvents", function () {

    describe("when using CalendarEvents ", function () {

        var cgEvents;

        beforeEach(function () {
            cgEvents = new CalendarEvents();
        });

        it("should add event", function () {
            var e = JSON. parse('{"date":"2019-08-23T18:25", "type": "CPU", "region":"ABC", "samples":1500, "url":"/fg.svg?url=collapsed/test.collapsed&color=Java" }');
            cgEvents.addEvent(e);
            expect(cgEvents.getEvents(new Date(e.date))[0]).toBe(e);
            expect(new Date(cgEvents.getEvents(new Date(e.date))[0].date)).toEqual(new Date('2019-08-23T18:25'));
        });

        it("should add event when the event contain more data", function () {
            var e = JSON. parse('{"date":"2019-08-23T18:25", "other": "OTHER", "foo":"bar", "type": "CPU", "region":"ABC", "samples":1500, "url":"/fg.svg?url=collapsed/test.collapsed&color=Java" }');
            cgEvents.addEvent(e);
            expect(cgEvents.getEvents(new Date(e.date))[0]).toBe(e);
            expect(new Date(cgEvents.getEvents(new Date(e.date))[0].date)).toEqual(new Date('2019-08-23T18:25'));
        });

        it("should not add event with unsupported date pattern", function () {
            var e = JSON. parse('{"date":"2019-08-23-18-25", "type": "CPU", "region":"ABC", "samples":1500, "url":"/fg.svg?url=collapsed/test.collapsed&color=Java" }');

            expect(function() {cgEvents.addEvent(e) }).toThrow(new Error("Unsupported date format: 2019-08-23-18-25"));

        });
    });

    describe("when loadCalendarEvents invoked ", function () {

        beforeEach(function() {
            cgEvents = new CalendarEvents();
            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("test.json").andReturn({
                responseText:
                    "[ {\"date\":\"2019-08-23T18:25:00\", \"type\": \"CPU\", \"region\":\"ABC\", \"samples\":1500, \"url\":\"/fg.svg?url=collapsed/test.collapsed&color=Java\" },\n" +
                    "  {\"date\":\"2019-08-21T17:23:00\", \"type\": \"MEMORY\", \"region\":\"ABC\", \"samples\":5000, \"url\":\"/fg.svg?url=collapsed/test.collapsed&color=Java\" },\n" +
                    "  {\"date\":\"2019-08-21T17:22:00\", \"type\": \"CPU\", \"region\":\"ABC\", \"samples\":7000, \"url\":\"/fg.svg?url=collapsed/test.collapsed&color=Java\" },\n" +
                    "  {\"date\":\"2019-08-21T18:22:00\", \"type\": \"CPU\", \"region\":\"ABC\", \"samples\":500, \"url\":\"/fg.svg?url=collapsed/test.collapsed&color=Java\"},\n" +
                    "  {\"date\":\"2019-09-12T15:02:00\", \"type\": \"CPU\", \"region\":\"ABC\", \"samples\":3100, \"url\":\"/fg.svg?url=collapsed/test.collapsed&color=Java\"},\n" +
                    "  {\"date\":\"2019-07-21T18:22:00\", \"type\": \"CPU\", \"region\":\"ABC\", \"samples\":500, \"url\":\"/fg.svg?url=collapsed/test.collapsed&color=Java\"},\n" +
                    "  {\"date\":\"2019-07-21T15:02:00\", \"type\": \"MEMORY\", \"region\":\"XYZ\", \"samples\":14100, \"url\":\"/fg.svg?url=collapsed/test.collapsed&color=Java\"}\n" +
                    "]"
            });
        });

        afterEach(function() {
            jasmine.Ajax.uninstall();
        });

        it("should load calendar events", function () {
            cgEvents.loadCalendarEvents("test.json");

            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe("test.json");
            expect(request.method).toBe('GET');

            expect(cgEvents.maxSamples).toEqual(14100);
            expect(cgEvents.getEvents(new Date("2019-08-24")).length).toEqual(0);
            expect(cgEvents.getEvents(new Date("2019-08-23")).length).toEqual(1);
            expect(cgEvents.getEvents(new Date("2019-08-21")).length).toEqual(3);
            expect(cgEvents.getEvents(new Date("2019-08-21")).map(function (x) { return x.samples; })).toEqual([5000, 7000, 500]);
        });
    });
});