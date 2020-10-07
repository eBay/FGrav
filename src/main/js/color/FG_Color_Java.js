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
function FG_Color_Java() {
    FG_Color.call(this);
    this.legend = {
        lawngreen: 'Java',
        yellow: 'JVM (C++)',
        aqua: 'Inlined',
        orange: 'Kernel',
        red: 'User'
    };
}

FG_Color_Java.prototype = Object.create(FG_Color.prototype);
FG_Color_Java.prototype.constructor = FG_Color_Java;
FG_Color_Java.prototype.colorFor = function(f, r) {
    var name = f.name;
    if (name.match(/_\[j\]$/)) {
        return colorValueFor("green", name);
    }
    if (name.match(/_\[i\]$/)) {
        return colorValueFor("aqua", name);
    }
    if (name.match(/^L?(java|javax|jdk|net|org|com|io|sun|rx|ch)/)) {
        return colorValueFor("green", name);
    }
    if (name.match(/_\[k\]$/)) {
        return colorValueFor("orange", name);
    }
    if (name.match(/::/)) {
        return colorValueFor("yellow", name);
    }
    return colorValueFor("red", name);
};

// # Handle both annotations (_[j], _[i], ...; which are
// # accurate), as well as input that lacks any annotations, as
// # best as possible. Without annotations, we get a little hacky
// # and match on java|org|com, etc.
//     if ($name =~ m:_\[j\]$:) {	# jit annotation
//         $type = "green";
//     } elsif ($name =~ m:_\[i\]$:) {	# inline annotation
//         $type = "aqua";
//     } elsif ($name =~ m:^L?(java|javax|jdk|net|org|com|io|sun)/:) {	# Java
//         $type = "green";
//     } elsif ($name =~ m:_\[k\]$:) {	# kernel annotation
//         $type = "orange";
//     } elsif ($name =~ /::/) {	# C++
//         $type = "yellow";
//     } else {			# system
//         $type = "red";
//     }
