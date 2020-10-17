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

function FGDrawTransition(fg) {
    FGDraw.call(this, fg);
}

FGDrawTransition.prototype = Object.create(FGDraw.prototype);
FGDrawTransition.prototype.constructor = FGDrawTransition;

FGDrawTransition.prototype.drawCanvas = function() {
    FGDraw.prototype.drawCanvas();

    var transition = this.text("Transition", "transition", this.fg.width - (this.fg.margin * 7), this.fg.margin);
    transition.setAttribute("onmouseover", "transitionover()");
    transition.setAttribute("onmouseout", "transitionout()");
    transition.setAttribute("onclick", "transition()");
    transition.setAttribute("style", "opacity:0.1;cursor:pointer");

    this.svg.appendChild(transition);

    this.fg.transitionbtn = this.d.getElementById("transition");

}

FGDrawTransition.prototype.drawTransition = function(prevFrames, stackFrames) {
    let previous = prevFrames.stackFrameByPath;
    let draw = this;
    $.each(Object.entries(stackFrames.stackFrameByPath), function(i, entry) {
        var path = entry[0];
        var stackFrame = entry[1];
        if (previous[path]) {
            animateFrame(draw, previous[path], stackFrame);
            previous[path] = null;
        }
        else {
            draw.svg.appendChild(createAnimatedFrame(draw, stackFrame));
        }
    });
    $.each(Object.entries(previous), function (i, entry) {
        var path = entry[0];
        var stackFrame = entry[1];
        if (stackFrame != null) {
            animateFrameToZero(draw, stackFrame);
        }
    });
    animate(draw, previous);

    function animate(draw, previous) {
        window.setTimeout(function () {
            replaceTextWithModifiedText();
            window.setTimeout(function () {
                replaceTextWithModifiedText();
            }, 5000);
        }, 6000);
        window.setTimeout(function () {
            $.each(Object.entries(previous), function (i, entry) {
                var path = entry[0];
                var stackFrame = entry[1];
                if (stackFrame != null) {
                    var g = draw.svg.getElementById(draw.fg.id + stackFrame.stack);
                    draw.svg.removeChild(g);
                }
            });
        }, 10000);
    }

    function animateFrame(draw, from, to) {
        if (from.w() !== to.w()) {
            animateExistingFrameWidth(draw, from, to.w(), to.samples, to.percentage());
        }
        if (from.x() !== to.x()) {
            var g = draw.svg.getElementById(draw.fg.id + from.stack);
            g.appendChild(draw.animatePosition(from.x(), to.x()));
        }
    }

    function animateText(draw, frameText, name, w) {
        var newText = escText(draw.textToFit(name, w - 2, draw.fg.fontSize));
        if (frameText.textContent !== newText) {
            frameText.setAttribute("class", "modify-text");
            frameText.setAttribute("newText", "_" + newText);
        }
    }

    function createAnimatedFrame(draw, f) {
        var newFrame = frame(f.name, f.stack, "0->" + f.samples, "0->" + f.percentage() + "%", f.x(), f.y(), 0, colorScheme.colorFor(f.name));
        var widthMove = draw.animateWidth(0, Math.max(0, f.w() - 1), "3.5s", "7s");
        var frameRect = newFrame.getElementsByTagName("rect")[0];
        var frameText = newFrame.getElementsByTagName("text")[0];
        frameRect.appendChild(widthMove);
        animateText(draw, frameText, f.name, f.w());
        return newFrame;
    }

    function animateFrameToZero(draw, f) {
        animateExistingFrameWidth(draw, f, 0, 0, 0);
    }

    function animateExistingFrameWidth(draw, from, newWidth, newSamples, newPercentage) {
        var g = draw.svg.getElementById(draw.fg.id + from.stack);
        var frameRect = g.getElementsByTagName("rect")[0];
        var start = (newWidth === 0) ? "0.2s" : "0.5s";
        var duration = (newWidth === 0) ? "7s" : "10s";
        frameRect.appendChild(draw.animateWidth(Math.max(0, from.w() - 1), Math.max(0, newWidth - 1), start, duration));
        var frameText = g.getElementsByTagName("text")[0];
        animateText(draw, frameText, from.name, newWidth);
        var frameTitle = g.getElementsByTagName("title")[0];
        frameTitle.innerHTML = escText(from.name + " (" + from.samples + "->" + newSamples + " samples, " + from.percentage() + "->" + newPercentage + "%)");
    }

    function replaceTextWithModifiedText() {
        $.each(document.getElementsByClassName("modify-text"), function (i, element) {
            var newText = element.getAttribute("newText");
            if (newText) {
                element.innerHTML = newText.substring(1);
                element.setAttribute("newText", "");
            }
        });
    }

};
