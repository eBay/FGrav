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
colorScheme.colorFor = cgDefaultColorFor;


colorScheme.legend = {
    red: 'CPU',
    blue: 'MEMORY'
};


function cgDefaultColorFor(name, value) {
    if (!name) {
        return "rgb(192, 192, 192)"
    }
    var color = "yellow";
    if (name === "CPU") {
        color = "red";
    }
    else if (name === "MEMORY") {
        color = "blue";
    }
    return colorValueFor(color, undefined, value);
}

