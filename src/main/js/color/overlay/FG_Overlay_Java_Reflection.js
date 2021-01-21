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

var reflectionPrefixes = [
    "java/lang/reflect",
    "jdk/internal/reflect",
    "java/lang/Class.",
];

function FG_Overlay_Java_Reflection() {
    FGOverlayMarkByPredicate.call(this,
        function(frame) {
            return function (el) {
                return reflectionPrefixes.find(function (prefix) {
                    return frame.getName().startsWith(prefix);
                });
            }
        }
    );
}
FG_Overlay_Java_Reflection.prototype = Object.create(FGOverlayMarkByPredicate.prototype);
FG_Overlay_Java_Reflection.prototype.constructor = FG_Overlay_Java_Reflection;

