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

function MergedCollapsed(mergedCount) {
    Collapsed.call(this);
    this.merged = (typeof mergedCount !== 'undefined') ? mergedCount : 2;
}

MergedCollapsed.prototype = Object.create(Collapsed.prototype);
MergedCollapsed.prototype.constructor = MergedCollapsed;

MergedCollapsed.prototype.push = function(path) {
    this.paths.push(path);
    this.totalSamples += path.samples;
    this.totalIndividualSamples = (typeof this.totalIndividualSamples !== 'undefined') ?
        increment(this.totalIndividualSamples, path.individualSamples) : path.individualSamples.slice();
    this.minSample = Math.min(this.minSample, path.samples);
};

MergedCollapsed.prototype.clear = function() {
    Collapsed.prototype.clear.call(this);
    this.totalIndividualSamples = undefined;
};

MergedCollapsed.prototype.parseCollapsed = function(codePaths) {
    var collapsed = this;
    $.each(codePaths, function() {
        var codePath = this.trim();
        if (codePath) {
            var i;
            var pattern = '(.*?)';
            for (i = 0; i < collapsed.merged; i++) {
                pattern = pattern + '\\s+(\\d+)';
            }
            pattern = pattern + '$';
            var s = codePath.match(new RegExp(pattern));
            var samples = [];
            for (i = 0; i < collapsed.merged; i++) {
                samples.push(parseInt(s[2 + i]));
            }
            collapsed.push(path(s[1], samples));
        }
    });
    return collapsed;

    function sum(array) {
        var m = 0;
        $.each(array, function (i) {
            m += this;
        });
        return m;
    }

    function path(pathStr, samplesArray) {
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
            samples: sum(samplesArray),
            individualSamples: samplesArray
        };
        p.levels = p.path.length;
        return p;
    }
};

MergedCollapsed.prototype.updateFrame = function (frame, path, ptr) {
    frame.samples += path.samples;
    frame.individualSamples = (typeof frame.individualSamples !== 'undefined') ?
            increment(frame.individualSamples, path.individualSamples) : path.individualSamples.slice();
    frame.lastStackIndex = ptr;
    frame.getDifferentialSamples = function (i) {
        return this.individualSamples[i];
    };
};

function increment(array1, array2) {
    for (var i = 0; i < array1.length; i++) {
        array1[i] += array2[i];
    }
    return array1;
}

MergedCollapsed.prototype.partialStackFrames = function(old, sampleIndex) {
    // var stackFrames = new FGStackFrames();
    // TODO return stackFrames;
    return old;
}