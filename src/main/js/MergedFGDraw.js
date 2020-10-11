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

function MergedFGDraw(fg, collapsed, visualDiff) {
    FGDraw.call(this, fg);
    this.visualDiff = visualDiff;
    this.collapsed = collapsed;
    fg.g_details = function (g) {
        var attr = find_child(g, "text").attributes;
        var name = attr.name.value;
        // var samples = parseInt(attr.samples.value);
        var samples = attr.samples.value;
        var details =  name + " ([" + samples + "] samples, [";
        $.each(samples.split(","), function (i) {
            if (i > 0) {
                details = details + ",";
            }
            details = details + percentage(parseInt(this), collapsed.totalIndividualSamples[i]) + "%";
        });
        details = details + "])";
        return detailsText(escText(details), details);
    };
    this.setDefaultColorScheme(new FG_Color_Diff());
}

MergedFGDraw.prototype = Object.create(FGDraw.prototype);
MergedFGDraw.prototype.constructor = MergedFGDraw;

MergedFGDraw.prototype.drawFrame = function (f) {
    var draw = this;
    if (f.stack === ";all") {
        f.individualSamples = draw.collapsed.totalIndividualSamples;
    }
    var x = f.x() + this.fg.shiftWidth;
    var w = f.w();
    var y = f.y() + this.fg.shiftHeight;
    var element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    if (draw.fg.id) {
        element.setAttribute("id", draw.fg.namePerFG(f.stack));
    }

    var frameRect;
    if (draw.visualDiff) {
        var p0 = percentage(f.individualSamples[0], draw.collapsed.totalIndividualSamples[0]);
        var p1 = percentage(f.individualSamples[1], draw.collapsed.totalIndividualSamples[1]);

        var diff =  p0 - p1;
        frameRect = drawRect(x, y, w, "white");
        if (diff !== 0) {
            diff = (diff < 0) ? diff / p1 : diff / p0;
            var diffW = w * Math.abs(diff);
            var diffRect = drawRect(x, y, diffW, colorScheme.colorFor(f, draw.collapsed.totalIndividualSamples));
        }
    } else {
        frameRect = drawRect(x, y, w, colorScheme.colorFor(f, draw.collapsed.totalIndividualSamples));
    }

    var textInFrame = draw.frameText(draw, f.name, w - 2, draw.fg.fontSize);
    var frameText = draw.text(textInFrame, undefined, x + 2, y + draw.fg.textPadding);
    frameText.setAttribute("orig", textInFrame);
    frameText.setAttribute("name", f.name);
    frameText.setAttribute("samples", f.individualSamples);

    element.appendChild(frameRect);
    if (diffRect) {
        element.appendChild(diffRect);
    }
    element.appendChild(frameText);

    return element;

    function drawRect(x, y, w, color) {
        var frameRect = draw.rect(x, y, w, draw.fg.frameHeight - 1, color);
        frameRect.setAttribute("rx", "2");
        frameRect.setAttribute("ry", "2");
        return frameRect;
    }
};

function percentage(samples, total) {
    return Math.floor(samples * 10000 / total) / 100;
}

function FG_Color_Diff() {
    FG_Color.call(this);
    this.legend = {
        red: 'Growth',
        blue: 'Reduction'
    };
}
FG_Color_Diff.prototype = Object.create(FG_Color.prototype);
FG_Color_Diff.prototype.constructor = FG_Color_Diff;

FG_Color_Diff.prototype.colorFor = function(frame, totalSamples) {
    var p0 = percentage(frame.individualSamples[0], totalSamples[0]);
    var p1 = percentage(frame.individualSamples[1], totalSamples[1]);

    var diff =  p0 - p1;
    if (diff === 0) {
        return "white";
    }
    diff = (diff < 0) ? diff / p1 : diff / p0;
    var variance = Math.floor(diff * diff * 255);
    var r;
    var b;
    var g = 255 - variance;
    if (diff < 0) {
        r = 255;
        b = 255 - variance;
    } else {
        b = 255;
        r = 255 - variance;
    }

    return "rgb(" + r + "," + g + "," + b + ")";

    function percentage(samples, total) {
        return Math.floor(samples * 10000 / total) / 100;
    }
};
