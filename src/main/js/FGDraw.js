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
function FGDraw(fg) {
    FGravDraw.call(this, fg);
    this.fg = fg;
    this.buttonsMargin = 24;
    this.setColorScheme(new FG_Color_Default());
}

FGDraw.prototype = Object.create(FGravDraw.prototype);
FGDraw.prototype.constructor = FGDraw;

FGDraw.prototype.setColorScheme = function(colorSchemeImpl) {
    colorScheme = colorSchemeImpl;
};

FGDraw.prototype.drawCanvas = function(_d) {
    _d = (typeof _d !== 'undefined') ? _d : document;

    this.svg.setAttribute("width", this.fg.width);
    this.svg.setAttribute("height", this.fg.height);
    this.svg.setAttribute("viewBox", "0 0 " + this.fg.width + " " + this.fg.height);

    var background = this.rect(0.0, 0, this.fg.width, this.fg.height, "url(#background)");
    var title = this.text(this.fg.title, "title", this.fg.width / 2, this.buttonsMargin, Math.round(this.fg.fontSize * 1.4), "middle");

    var unzoom = this.text("Reset Zoom", "unzoom", this.buttonsMargin, this.buttonsMargin);
    unzoom.classList.add("hide");
    var legend = this.text("Legend", "legendBtn", this.buttonsMargin * 4.5, this.buttonsMargin);

    var ignorecase = this.text("IC", "ignorecase", this.fg.width - (this.buttonsMargin * 1.5), this.buttonsMargin);
    var search = this.text("Search", "search", this.fg.width - (this.buttonsMargin * 3.5), this.buttonsMargin);

    this.svg.appendChild(background);
    this.svg.appendChild(title);
    this.svg.appendChild(unzoom);
    this.svg.appendChild(search);
    this.svg.appendChild(ignorecase);

    this.drawLegend(legend, _d);

    this.fg.searchbtn = _d.getElementById("search");
    this.fg.ignorecaseBtn = _d.getElementById("ignorecase");
    this.fg.unzoombtn = _d.getElementById("unzoom");

    _d.styleSheets[0].insertRule("text { font-family:Verdana; font-size:"+ this.fg.fontSize +"px; fill:rgb(0,0,0); }", 0);
};

FGDraw.prototype.drawLegend = function(legendBtn, _d) {
    var legendKeys = Object.keys(colorScheme.legend);
    if (legendKeys.length > 0) {
        _d = (typeof _d !== 'undefined') ? _d : document;
        var g = _d.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("id", "legend");
        g.classList.add("hide");
        var draw = this;
        var size = draw.fg.frameHeight - 1;
        $.each(legendKeys, function (i) {
            var text = colorScheme.legend[this];
            var legendEntry = draw.rect(draw.buttonsMargin, (i + 1) * (size + 1) + draw.buttonsMargin, size, size, this);
            legendEntry.setAttribute("rx", "2");
            legendEntry.setAttribute("ry", "2");
            var legendEntryText = draw.text(text, "", draw.buttonsMargin + size * 2, (i + 1) * (size + 1) + draw.buttonsMargin + draw.fg.textPadding);
            g.appendChild(legendEntry);
            g.appendChild(legendEntryText);

        });
        this.svg.appendChild(g);
        this.svg.appendChild(legendBtn);
        this.fg.legendEl = g;
    }
};

FGDraw.prototype.drawInfoElements = function(_d) {
    _d = (typeof _d !== 'undefined') ? _d : document;
    var details = this.text(" ", this.fg.namePerFG("details"),
            this.fg.margin + this.fg.shiftWidth, this.fg.height - 4 + this.fg.shiftHeight);
    var matched = this.text(" ", this.fg.namePerFG("matched"),
            this.fg.width - (this.fg.margin * 6) + this.fg.shiftWidth, this.fg.height - 4 + this.fg.shiftHeight);
    var tooltip = tooltip(this, _d);
    this.svg.appendChild(details);
    this.svg.appendChild(matched);
    this.svg.appendChild(tooltip);

    this.fg.details = _d.getElementById(this.fg.namePerFG("details")).firstChild;
    this.fg.matchedtxt = _d.getElementById(this.fg.namePerFG("matched"));
    this.fg.tooltip = _d.getElementById(this.fg.namePerFG("tooltip"));


    function tooltip(draw, _d) {
        var element = _d.createElementNS("http://www.w3.org/2000/svg", "g");
        element.setAttribute("id", draw.fg.namePerFG("tooltip"));
        element.setAttribute("visibility", "hidden");
        var rectGrey = draw.rect(0, 0, 80, 20, "rgb(90,90,90)");
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

FGDraw.prototype.drawFG = function(stackFrames, _d) {
    _d = (typeof _d !== 'undefined') ? _d : document;
    this.fg.totalSamples = stackFrames.totalSamples;
    var g = _d.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("id", this.fg.namePerFG("frames"));
    var draw = this;
    g.appendChild(draw.drawFrame(stackFrames.allFrame(draw.fg)));
    $.each(stackFrames.stackFrameRows, function() {
        $.each(this, function() {
            if (this.samples >= draw.fg.minDisplaySample) {
                g.appendChild(draw.drawFrame(this));
            }
        });
    });

    this.svg.appendChild(g);
};

FGDraw.prototype.drawFrame = function (f) {
    return frame(this, f.name, f.stack, f.samples, f.x() + this.fg.shiftWidth, f.y() + this.fg.shiftHeight,
        f.w(), colorScheme.colorFor(f));


    function frame(draw, name, id, samples, x, y, w, color) {
        var element = document.createElementNS("http://www.w3.org/2000/svg", "g");
        if (draw.fg.id) {
            element.setAttribute("id", draw.fg.namePerFG(id));
        }

        var frameRect = draw.rect(x, y, w, draw.fg.frameHeight - 1, color);
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

function FG_Color_Default() {
    FG_Color.call(this);
}

FG_Color_Default.prototype = Object.create(FG_Color.prototype);
FG_Color_Default.prototype.constructor = FG_Color_Default;

FG_Color_Default.prototype.colorFor = function(f, r) {
    r = (typeof r !== 'undefined') ? r : Math.random();
    var colors = [ "red", "orange", "yellow" ];
    return colorValueFor(colors[Math.floor(3 * r)], f.name);
};