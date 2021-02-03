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
function FG_Color_Js() {
    FG_Color.call(this);
    this.legend = {
        lawngreen: 'JIT (Node.js)',
        yellow: 'C++',
        aqua: 'Inlined',
        orange: 'Kernel',
        red: 'User'
    };
}

FG_Color_Js.prototype = Object.create(FG_Color.prototype);
FG_Color_Js.prototype.constructor = FG_Color_Js;
FG_Color_Js.prototype.colorFor = function(f, totalSamples) {
    var name = f.getName();
    if (name.match(/_\[j\]$/)) {
        if (name.match(/\//)) {
            return colorValueFor("green", name);
        } else {
            return colorValueFor("aqua", name);
        }
    }
    if (name.match(/::/)) {
        return colorValueFor("yellow", name);
    }
    if (name.match(/.*\.js/)) {
        return colorValueFor("green", name);
    }
    if (name.match(/:/)) {
        return colorValueFor("aqua", name);
    }
    if (name.match(/^ $/)) {
        return colorValueFor("green", name);
    }
    if (name.match(/_\[k\]/)) {
        return colorValueFor("orange", name);
    }
    return colorValueFor("red", name);
};

//     # Handle both annotations (_[j], _[i], ...; which are
//     # accurate), as well as input that lacks any annotations, as
//     # best as possible. Without annotations, we get a little hacky,
//         # and match on a "/" with a ".js", etc.
//     if ($name =~ m:_\[j\]$:) {	# jit annotation
//         if ($name =~ m:/:) {
//         $type = "green";	# source
//     } else {
//         $type = "aqua";		# builtin
//     }
// } elsif ($name =~ /::/) {	# C++
//     $type = "yellow";
// } elsif ($name =~ m:/.*\.js:) {	# JavaScript (match "/" in path)
// $type = "green";
// } elsif ($name =~ m/:/) {	# JavaScript (match ":" in builtin)
// $type = "aqua";
// } elsif ($name =~ m/^ $/) {	# Missing symbol
//     $type = "green";
// } elsif ($name =~ m:_\[k\]:) {	# kernel
//     $type = "orange";
// } else {			# system
//     $type = "red";
// }
