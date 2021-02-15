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

function FGravDraw(fgrav, _d) {
    this.fgrav = fgrav;
    this.svg = fgrav.svg;
    this.d = (typeof _d !== 'undefined') ? _d : document;

}

function escText(text) {
    text = text.replace(/&/g, "&amp;");
    text = text.replace(/</g, "&lt;");
    return text.replace(/>/g, "&gt;");
}

function mark(element) {
    element.setAttribute("style", "stroke-width:3;stroke:rgb(0,0,0)");
}

// accessed from potentially remote code evaluated only when loaded.
function colorValueFor(palette, name, value) {
    var v = typeof value !== 'undefined' ? value : Math.random();
    var colorVar = typeof name !== 'undefined' ? colorVarianceBy(name) : v;

    var r = 0, g = 0, b = 0;

    switch (palette) {
        case "red":
            r = 200 + Math.round(55 * colorVar);
            g = b = 50 + Math.round(80 * colorVar);
            break;
        case "green":
            g = 200 + Math.round(55 * colorVar);
            r = b = 50 + Math.round(60 * colorVar);
            break;
        case "blue":
            b = 205 + Math.round(50 * colorVar);
            r = g = 80 + Math.round(60 * colorVar);
            break;
        case "yellow":
            b = 50 + Math.round(20 * colorVar);
            r = g = 175 + Math.round(55 * colorVar);
            break;
        case "purple":
            g = 80 + Math.round(60 * colorVar);
            r = b = 190 + Math.round(65 * colorVar);
            break;
        case "aqua":
            g = 165 + Math.round(55 * colorVar);
            r = 50 + Math.round(60 * colorVar);
            b = 165 + Math.round(55 * colorVar);
            break;
        case "orange":
            g = 90 + Math.round(65 * colorVar);
            r = 190 + Math.round(65 * colorVar);
            break;
    }
    return "rgb(" + r + "," + g + "," + b + ")";

    function colorVarianceBy(name) {
        var acc = 0;
        var max = 0;
        var weight = 1;
        name = name.split("").reverse().join("");
        for (var i = 0; i < name.length; i++) {
            var c = name.charCodeAt(i);
            acc += (((c * 31 % 256) / 255) * weight);
            max += weight;
            weight *= 0.7;
        }
        return acc / max;
    }
}

FGravDraw.prototype.rect = function(x, y, width, height, styleFunction) {
    var element = this.d.createElementNS("http://www.w3.org/2000/svg", "rect");
    element.setAttribute("x", x);
    element.setAttribute("y", y);
    element.setAttribute("width", width);
    element.setAttribute("height", height);
    styleFunction(element);
    return element;
};

FGravDraw.prototype.text = function(text, id, x, y, fontSize, anchor, fill) {
    var element = this.textBox(id, x, y, fontSize, anchor, fill);
    element.innerHTML = escText(text);

    return element;
};

FGravDraw.prototype.textBox = function(id, x, y, fontSize, anchor, fill) {
    var element = this.d.createElementNS("http://www.w3.org/2000/svg", "text");
    element.setAttribute("x", x);
    element.setAttribute("y", y);
    if (id) element.setAttribute("id", id);
    if (anchor) element.setAttribute("text-anchor", anchor);
    if (fontSize) element.setAttribute("font-size", fontSize);
    if (fill) element.setAttribute("fill", fill);

    return element;
};

FGravDraw.prototype.textToFit = function(text, widthToFit, fontSize) {
    var chars = Math.floor(widthToFit / (this.fgrav.fontWidthRatio * fontSize));

    if (chars < 3 || text.length === 0) {
        return "";
    }

    if (text.length > chars) {
        text = text.substring(0, chars - 2) + "..";
    }

    return text;
};

FGravDraw.prototype.drawError = function(errorMsg) {
    var background = this.rect(0.0, 0, 500, 150, function (el) {
        el.setAttribute("fill", "url(#background)");
    });
    var err = this.text(errorMsg, "error", 250, 75, 17, "middle");

    this.svg.appendChild(background);
    this.svg.appendChild(err);
};
