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
function FG_Color_Flames() {
    FG_Color.call(this);
}

FG_Color_Flames.prototype = Object.create(FG_Color.prototype);
FG_Color_Flames.prototype.constructor = FG_Color_Flames;
FG_Color_Flames.prototype.colorFor = function(frame, totalSamples) {
    totalSamples = (typeof totalSamples !== 'undefined' && totalSamples <= 1 && totalSamples >= 0) ? totalSamples : Math.random();
    var colors = [ "red", "orange", "yellow" ];
    return colorValueFor(colors[Math.floor(3 * totalSamples)], frame.getName());
};