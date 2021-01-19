/************************************************************************
 Copyright 2020 eBay Inc.
 Author/Developer: Amir Langer

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 **************************************************************************/
function CalendarEvents() {
    this.eventsByYyyyMMdd = {};
    this.maxSamples = 0;
    this.toYyyyMMdd = function(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        return "" + year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
    }
}

CalendarEvents.prototype.addEvent = function(event) {
    var yyyyMMdd = this.toYyyyMMdd(new CalendarEvent(event).dateObj());
    var list = this.eventsByYyyyMMdd[yyyyMMdd];
    if (list) {
        list.push(event);
    }
    else {
        this.eventsByYyyyMMdd[yyyyMMdd] = [event];
    }
    this.maxSamples = Math.max(this.maxSamples, event.samples);
};

CalendarEvents.prototype.getEvents = function(date) {
    var events = this.eventsByYyyyMMdd[this.toYyyyMMdd(date)];
    return (undefined === events) ? [] : events;
};

CalendarEvents.prototype.loadCalendarEvents = function(calEventsFile, successCallback, errorCallback) {
    var events = this;
    var response = new FGravResponse();
    $.ajax({
        type: "GET",
        url: calEventsFile,
        dataType: "json",
        processData: false,
        success : function(data) {
            $.each(data, function( i, item ) {
                events.addEvent(item);
            });
            successCallback(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            response.setError(errorThrown, textStatus);
            errorCallback(response);
        }
    });
};

function CalendarEvent(data) {
    $.extend(this, data);
}

CalendarEvent.prototype.dateObj = function() {
    var time = new Date(this.date);
    if (isNaN(time.valueOf())) {
        throw new Error("Unsupported date format: " + this.date);
    }
    return time;
};
