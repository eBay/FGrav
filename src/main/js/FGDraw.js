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

function FGDraw(fg, _d) {
    FGravDraw.call(this, fg, _d);
    this.fg = fg;
    this.fg.draw = this;
    this.buttonsMargin = 24;
    fg.context.setColorScheme(new FG_Color_White());
}

FGDraw.prototype = Object.create(FGravDraw.prototype);
FGDraw.prototype.constructor = FGDraw;

FGDraw.prototype.drawCanvas = function() {
    this.svg.setAttribute("width", this.fg.width);
    this.svg.setAttribute("height", this.fg.height);
    this.svg.setAttribute("viewBox", "0 0 " + this.fg.width + " " + this.fg.height);
    var background = this.rect(0.0, 0, this.fg.width, this.fg.height, function (el) {
        el.setAttribute("fill",  "url(#background)");
    });
    var title = this.text(this.fg.title, "title", this.fg.width / 2, this.buttonsMargin, Math.round(this.fg.fontSize * 1.4), "middle");

    var unzoom = this.text("Reset Zoom", "unzoom", this.buttonsMargin, this.buttonsMargin);
    unzoom.classList.add("hide");
    this.legend = this.text("Legend", "legendBtn", this.buttonsMargin + 90, this.buttonsMargin);
    this.overlay = this.text("Overlay", "overlayBtn", this.buttonsMargin + 90 + 60, this.buttonsMargin);

    var ignorecase = this.text("IC", "ignorecase", this.fg.width - this.buttonsMargin - 12, this.buttonsMargin);
    var search = this.text("Search", "search", this.fg.width - this.buttonsMargin - 12 - 90, this.buttonsMargin);

    this.svg.appendChild(background);
    this.svg.appendChild(title);
    this.svg.appendChild(unzoom);
    this.svg.appendChild(search);
    this.svg.appendChild(ignorecase);

    this.setupColorScheme(this.fg.context.currentColorScheme);
    this.drawLegend(this.fg.context.currentColorScheme);
    this.drawOverlayDropDown(this.fg.context.currentColorScheme);

    this.fg.searchbtn = this.d.getElementById("search");
    this.fg.ignorecaseBtn = this.d.getElementById("ignorecase");
    this.fg.unzoombtn = this.d.getElementById("unzoom");
    this.fg.legendBtn = this.d.getElementById("legendBtn");
    this.fg.overlayBtn = this.d.getElementById("overlayBtn");

    if (this.d.styleSheets[0]) {
        this.d.styleSheets[0].insertRule("text { font-family:Verdana; font-size:" + this.fg.fontSize + "px; fill:rgb(0,0,0); }", 0);
    }
};

FGDraw.prototype.setupColorScheme = function(colorScheme) {
    if (colorScheme.colorsAsOverlays) {

        $.each(Object.entries(this.fg.config.color), function (i, entry) {
            var colorName = entry[0];
            var uri = entry[1].uri;
            if (uri) {
                colorScheme.overlays[colorName] = uri;
            }
        });
    }
};

FGDraw.prototype.drawLegend = function(colorScheme, old) {
    var legendKeys = (colorScheme.legend) ?  Object.keys(colorScheme.legend) : [];
    if (legendKeys.length > 0) {
        var g = this.d.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("id", "legend");
        g.classList.add("hide");
        var draw = this;
        var size = draw.fg.frameHeight - 1;
        $.each(legendKeys, function (i) {
            var color = this;
            var text = colorScheme.legend[color];
            var legendEntry = draw.rect(draw.buttonsMargin, (i + 1) * (size + 1) + draw.buttonsMargin, size, size, function (el) {
                el.setAttribute("fill", color);
            });
            legendEntry.setAttribute("rx", "2");
            legendEntry.setAttribute("ry", "2");
            var legendEntryText = draw.text(text, "", draw.buttonsMargin + size * 2, (i + 1) * (size + 1) + draw.buttonsMargin + draw.fg.textPadding);
            g.appendChild(legendEntry);
            g.appendChild(legendEntryText);

        });
        if (old) {
            this.svg.replaceChild(g, old);
        } else {
            this.svg.appendChild(g);
            this.svg.appendChild(this.legend);
        }
        this.fg.legendEl = g;
    } else if (old) {
        this.svg.removeChild(old);
        this.fg.legendEl = undefined;
    }

};

FGDraw.prototype.drawOverlayDropDown = function(colorScheme, old) {
    var overlayKeys = (colorScheme.overlays) ? Object.keys(colorScheme.overlays): [];
    if (overlayKeys.length > 0) {
        var g = this.d.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("id", "overlay");
        g.classList.add("hide");
        var draw = this;
        var h = draw.fg.frameHeight;
        var x = this.overlay.getAttribute("x");
        var xText = parseInt(x) + 4;
        $.each(overlayKeys, function (i) {
            var uri = colorScheme.overlays[this];
            var y = (i + 1) * (h + draw.buttonsMargin);
            var overlayEntry = draw.rect(x, y, 90, 20, function (el) {
                el.setAttribute("fill", "rgb(90,90,90)");
            });
            overlayEntry.setAttribute("rx", "2");
            overlayEntry.setAttribute("ry", "2");
            overlayEntry.setAttribute("class", "overlay");
            var overlayEntryText = draw.text(this, "", xText, y + draw.fg.textPadding + 4);
            overlayEntryText.setAttribute("class", "overlay");
            overlayEntryText.setAttribute("onclick", "fg.loadOverlay(\""+ this +"\", \"" + uri + "\");");
            g.appendChild(overlayEntry);
            g.appendChild(overlayEntryText);

        });
        if (old) {
            this.svg.replaceChild(g, old);
        } else {
            this.svg.appendChild(g);
            this.svg.appendChild(this.overlay);
        }
        this.fg.overlayEl = g;
    } else if (old) {
        this.svg.removeChild(old);
        this.fg.overlayEl = undefined;
    }
};

FGDraw.prototype.drawInfoElements = function() {
    var details = this.text(" ", this.fg.namePerFG("details"),
            this.fg.margin + this.fg.shiftWidth, this.fg.height - 4 + this.fg.shiftHeight);
    var matched = this.text(" ", this.fg.namePerFG("matched"),
            this.fg.width - 70 - this.fg.margin + this.fg.shiftWidth, this.fg.height - 4 + this.fg.shiftHeight);
    var tooltip = tooltip(this);
    this.svg.appendChild(details);
    this.svg.appendChild(matched);
    this.svg.appendChild(tooltip);

    this.fg.details = this.svg.getElementById(this.fg.namePerFG("details")).firstChild;
    this.fg.matchedtxt = this.svg.getElementById(this.fg.namePerFG("matched"));
    this.fg.tooltip = this.svg.getElementById(this.fg.namePerFG("tooltip"));


    function tooltip(draw) {
        var element = draw.d.createElementNS("http://www.w3.org/2000/svg", "g");
        element.setAttribute("id", draw.fg.namePerFG("tooltip"));
        element.setAttribute("visibility", "hidden");
        var rectGrey = draw.rect(0, 0, 80, 20, function (el) {
            el.setAttribute("fill", "rgb(90,90,90)");
        });
        rectGrey.setAttribute("rx", "2");
        rectGrey.setAttribute("ry", "2");
        rectGrey.setAttribute("class", "tooltip");
        var tooltipText = draw.text("", "", 4, draw.fg.textPadding + 4);
        tooltipText.setAttribute("class", "tooltip");

        element.appendChild(rectGrey);
        element.appendChild(tooltipText);

        return element;
    }
};

FGDraw.prototype.drawFG = function(stackFrames) {
    this.currentDrawnFrames = stackFrames;
    this.fg.totalSamples = stackFrames.totalSamples;
    var g = this.generateFramesCells(this.fg.context.currentColorScheme);
    this.svg.appendChild(g);
};

FGDraw.prototype.redrawFG = function() {
    var old = this.svg.getElementById(this.fg.namePerFG("frames"));
    var g = this.generateFramesCells(this.fg.context.currentColorScheme);
    this.svg.replaceChild(g, old);
};

FGDraw.prototype.reapplyColor = function(colorScheme) {
    var g = this.svg.getElementById(this.fg.namePerFG("frames"));
    var c = find_children(g, "g");
    var f = frameFlyweight();
    for(var i=0; i<c.length; i++) {
        var r = find_child(c[i], "rect");
        r.removeAttribute("style");
        f.e = find_child(c[i], "text");
        var styleFunction = colorScheme.applyColor(f);
        styleFunction(r);
    }

    function frameFlyweight() {
        return {
            e: undefined,
            getName: function () { return this.e.getAttribute("name") },
            getSamples: function () { return parseInt(this.e.getAttribute("samples")) }
        };
    }
};


FGDraw.prototype.generateFramesCells = function(colorScheme) {
    var stackFrames = this.currentDrawnFrames;
    var g = this.d.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("id", this.fg.namePerFG("frames"));
    var draw = this;
    g.appendChild(draw.drawFrame(colorScheme, stackFrames.allFrame(draw.fg)));
    $.each(stackFrames.stackFrameRows, function() {
        $.each(this, function() {
            if (this.samples >= draw.fg.minDisplaySample) {
                g.appendChild(draw.drawFrame(colorScheme, this));
            }
        });
    });
    return g;
};


FGDraw.prototype.drawFrame = function (colorScheme, f) {
    return frame(this, f.name, f.stack, f.samples, f.x() + this.fg.shiftWidth, f.y() + this.fg.shiftHeight,
        f.w(), colorScheme.applyColor(f), this.d);


    function frame(draw, name, id, samples, x, y, w, styleFunction, d) {
        var element = d.createElementNS("http://www.w3.org/2000/svg", "g");
        if (draw.fg.id) {
            element.setAttribute("id", draw.fg.namePerFG(id));
        }

        var frameRect = draw.rect(x, y, w, draw.fg.frameHeight - 1, styleFunction);
        frameRect.setAttribute("rx", "2");
        frameRect.setAttribute("ry", "2");

        var textInFrame = draw.frameText(draw, name, w - 2, draw.fg.fontSize);
        var frameText = draw.text(textInFrame, undefined, x + 2, y + draw.fg.textPadding);
        frameText.setAttribute("orig", textInFrame);
        frameText.setAttribute("name", name);
        frameText.setAttribute("samples", samples);

        element.appendChild(frameRect);
        element.appendChild(frameText);

        return element;
    }
};

FGDraw.prototype.frameText = function(draw, text, widthToFit, fontSize) {
    widthToFit = typeof widthToFit !== 'undefined' ? widthToFit : 0;
    if (widthToFit <= 0) {
        return "";
    }
    return draw.textToFit(text, widthToFit, fontSize);
};

function FG_Color_White() {
    FG_Color.call(this);
    this.colorsAsOverlays = true;
}
FG_Color_White.prototype = Object.create(FG_Color.prototype);
FG_Color_White.prototype.constructor = FG_Color_White;
FG_Color_White.prototype.colorFor = function(frame, totalSamples) {
    return "white";
};