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
function FG_Color() {
    this.legend = {};
    this.overlays = {};
    this.currentOverlay = undefined;
    this.loadedOverlays = {};
}
/*
The function to override when defining a color scheme.
 */
FG_Color.prototype.colorFor = function(frame, samples) {
    throw Error("Did not load any color scheme");
};

/*
Do not override.
This is the function that is being used to apply color and possible style from overlay
 */
FG_Color.prototype.applyColor = function (frame, samples) {
    var c = this;
    return (c.currentOverlay) ? c.currentOverlay.applyStyle(c, frame, samples) : c.applyStyle(c, frame, samples);
};

/*
Do not override.
This allows us to use the 'this' color scheme as overlay.
 */
FG_Color.prototype.applyStyle = function(colorScheme, frame, samples) {
    var c = this;
    return function(el) {
        el.setAttribute("fill", c.colorFor(frame, samples));
    };
};