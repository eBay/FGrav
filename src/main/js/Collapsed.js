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
function Collapsed() {
    this.paths = [];
    this.totalSamples = 0;
    this.minSample = Number.MAX_VALUE;
    this.maxLevel = 0;
    this.offset = [];
}

Collapsed.prototype.push = function(path) {
    this.paths.push(path);
    this.totalSamples += path.samples;
    this.minSample = Math.min(this.minSample, path.samples);
};

Collapsed.prototype.parseCollapsed = function(codePaths) {
    var collapsed = this;
    $.each(codePaths, function() {
        var codePath = this.trim();
        if (codePath) {
            var s = codePath.match(/(.*?)\s+(\d+)$/);
            collapsed.push(path(s[1], parseInt(s[2])));
        }
    });
    return collapsed;

    function path(pathStr, samplesCount) {
        var p = {
            pathStr: "",
            popFrame: function() {
                var p = this.path.pop();
                if (p) {
                    p = p.trim();
                    this.pathStr = this.pathStr + ";" + p;
                }
                return p;
            },
            path: pathStr.split(";").reverse(),
            samples: samplesCount
        };
        p.levels = p.path.length;
        return p;
    }
};

Collapsed.prototype.calculateOffsets = function(fgWidth, fgMargin, minDisplaySample) {
    var collapsed = this;
    var aggSamples = 0;
    $.each(this.paths, function(i) {
        aggSamples += this.samples;
        var result = collapsed.frameWidth(fgWidth, fgMargin, aggSamples);
        collapsed.offset.push(result);
        if (this.samples >= minDisplaySample) {
            collapsed.maxLevel = Math.max(collapsed.maxLevel, this.levels);
        }
    });
};

Collapsed.prototype.updateFrame = function (frame, path, ptr) {
    frame.samples += path.samples;
    frame.lastStackIndex = ptr;
};

Collapsed.prototype.frameWidth = function(fgWidth, fgMargin, samples) {
    var w = (fgWidth - (2 * fgMargin)) * samples / this.totalSamples;
    return parseFloat(w.toFixed(4));
};
