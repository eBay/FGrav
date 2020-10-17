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
function CGDraw(cg, _d) {
    FGravDraw.call(this, cg, _d);
    this.cg = cg;
    colorScheme = new CG_Color_Default();
}

CGDraw.prototype = Object.create(FGravDraw.prototype);
CGDraw.prototype.constructor = CGDraw;

CGDraw.prototype.drawCanvas = function() {
    this.svg.appendChild(this.rect(0.0, 0, this.cg.width, this.cg.height, function (el) {
        el.setAttribute("fill", "url(#background)");
    }));
    this.svg.appendChild(this.text(this.cg.title, "title", 724 / 2, this.cg.margin, 17, "middle"));
    this.svg.appendChild(this.text(" ", "details", this.cg.margin, 150 - 4, 12));
    var self = this;
    $.each(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], function(i, day) {
        self.svg.appendChild(self.text(day, day, self.cg.margin - 20, self.cg.margin + 7 +( 13 * (i + 1)), 9, "left"));
    });

    this.cg.details = this.d.getElementById("details").firstChild;
};

CGDraw.prototype.drawLegend = function() {
    var legendKeys = Object.keys(colorScheme.legend);
    if (legendKeys.length > 0) {
        var g = this.d.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("id", "legend");
        g.classList.add("hide");
        var draw = this;
        var size = 6;
        var margin = 6;
        $.each(legendKeys, function (i) {
            var color = this;
            var text = colorScheme.legend[color];
            var legendEntry = draw.rect(margin, i * (size + 1) + margin, size, size, function (el) {
                el.setAttribute("fill", color);
            });
            legendEntry.setAttribute("rx", "2");
            legendEntry.setAttribute("ry", "2");
            var legendEntryText = draw.text(text, "", margin + size * 2, (i + 1) * size + margin, 7, "left");
            g.appendChild(legendEntry);
            g.appendChild(legendEntryText);

        });
        this.svg.appendChild(g);
    }
};

CGDraw.prototype.drawCG = function(calendarEvents) {
    var i, j, k;
    var date = new Date();
    var lastCol = date.getDay() - 1;
    lastCol = (lastCol < 0) ? 6 : lastCol;
    var draw = this;
    for (k = lastCol; k >= 0; k--) {
        this.svg.appendChild(boxFor(draw, calendarEvents, date, 51, k));
        monthLabel(draw, date, 51 * 13 + this.cg.margin);
        date.setTime(date.getTime() - (1000 * 60 * 60 * 24));
    }
    for (i = 50; i >= 0; i--) {
        for (j = 6; j >= 0; j--) {
            this.svg.appendChild(boxFor(draw, calendarEvents, date, i, j));
            monthLabel(draw, date, i * 13 + this.cg.margin);
            date.setTime(date.getTime() - (1000 * 60 * 60 * 24));
        }
    }

    function monthLabel(draw, date, x) {
        var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        if (date.getDate() === 1) {
            var month = date.getMonth();
            draw.svg.appendChild(draw.text(months[month], months[month], x, 134, 9, "left"));
        }
    };

    function boxFor(draw, calendarEvents, date, i, j) {
        var color = "";
        var title = formatDate(date);
        var samples = 0;
        var url = "";
        var events = calendarEvents.getEvents(date);
        if (events) {
            if (events.length === 1) {
                var event = events[0];
                color = event.type;
                title = title + "," + event.region + "," + event.type;
                samples = event.samples;
                url = event.url;
            }
            else {
                var types = valuesOf(events, function(el) {
                    return el.type;
                });
                var regions = valuesOf(events, function (el) {
                    return el.region;
                });
                title = title + ", [" + types.join(",") + "], [" + regions.join(",")+"]";
                var colors = events.map(function (ev) {
                    return colorScheme.colorFor(ev.type, ev.samples / calendarEvents.maxSamples)
                });
                return box(draw, title, i * 13 + draw.cg.margin, j * 13 + draw.cg.margin + 10, colors, url);

            }
        }
        return box(draw, title, i * 13 + draw.cg.margin, j * 13 + draw.cg.margin + 10, colorScheme.colorFor(color, samples / calendarEvents.maxSamples), url);

        function valuesOf(a, prop) {
            var unique = [];
            $.each(a, function(i, el){
                var v = prop(el);
                if($.inArray(v, unique) === -1) unique.push(v);
            });
            return unique;
        }

        function formatDate(date) {
            var month = '' + (date.getMonth() + 1);
            var day = '' + date.getDate();
            var year = date.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }

        function box(draw, title, x, y, color, url) {
            var element = draw.d.createElementNS("http://www.w3.org/2000/svg", "g");
            element.setAttribute("class", "func_g");
            element.setAttribute("onmouseover", "cg.s(this)");
            element.setAttribute("onmouseout", "cg.c()");
            if (url) {
                element.setAttribute("onclick", "cg.fg('" + url + "')");
            }

            var boxTitle = draw.d.createElementNS("http://www.w3.org/2000/svg", "title");
            boxTitle.innerHTML = escText(title);
            element.appendChild(boxTitle);

            var boxRect = draw.rect(x, y, 12, 12, function (el) {
                el.setAttribute("fill", Array.isArray(color) ? colorScheme.colorFor(undefined, 0) : color);
            });
            boxRect.setAttribute("rx", "2");
            boxRect.setAttribute("ry", "2");
            element.appendChild(boxRect);

            if (Array.isArray(color)) {
                var pos;
                switch (color.length) {
                    case 2:
                        pos = rectangles(2);
                        break;
                    case 3:
                        pos = rectangles(3);
                        break;
                    case 4:
                        pos = squares(2);
                        break;
                    default:
                        pos = squares(3);
                }
                $.each(color, function (i, itemColor) {
                    var boxRect = draw.rect(x + pos.x, y + pos.y, pos.w, pos.h, function (el) {
                        el.setAttribute("fill", itemColor);
                    });
                    boxRect.setAttribute("rx", "2");
                    boxRect.setAttribute("ry", "2");
                    element.appendChild(boxRect);
                    return pos.move();
                });
            }
            return element;
        }

        function rectangles(sep) {
            var s = 12 / sep;
            return {
                size: s,
                x: 0,
                y: 0,
                w: 12,
                h: s,
                move: function () {
                    this.y = this.y + this.size;
                    return this.y <= 12;
                }
            };
        }

        function squares(sep) {
            var s = 12 / sep;
            return {
                size: s,
                x: 0,
                y: 0,
                w: s,
                h: s,
                move: function () {
                    this.x = (this.x + this.size) % 12;
                    this.y = (this.x === 0) ? this.y + this.size : this.y;
                    return this.y <= 12;
                }
            };
        }
    }
};

function CG_Color_Default() {
    this.legend = {
        red: 'CPU',
        blue: 'MEMORY'
    };
}

CG_Color_Default.prototype.colorFor = function(name, value) {
    if (!name) {
        return "rgb(192, 192, 192)"
    }
    var color = "yellow";
    if (name === "CPU") {
        color = "red";
    }
    else if (name === "MEMORY") {
        color = "blue";
    }
    return colorValueFor(color, undefined, value);
};

