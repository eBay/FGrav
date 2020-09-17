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
colorScheme.colorFor = diffColorFor;

colorScheme.legend = {
    red: 'Growth',
    blue: 'Reduction'
};

function diffColorFor(frame, totalSamples) {
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
}

