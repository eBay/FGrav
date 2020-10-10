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
function CG(_w) {
    FGrav.call(this, 724, 150, 24, 12, "Activity", _w);
}

CG.prototype = Object.create(FGrav.prototype);
CG.prototype.constructor = CG;

// mouse-over for info
CG.prototype.s = function(node) {		// show
    var info = g_to_text(node);
    this.details.nodeValue = info;

    // functions
    function find_child(parent, name, attr) {
        var children = parent.childNodes;
        for (var i=0; i<children.length;i++) {
            if (children[i].tagName == name)
                return (attr != undefined) ? children[i].attributes[attr].value : children[i];
        }
    }

    function g_to_text(e) {
        var text = find_child(e, "title").firstChild.nodeValue;
        return (text)
    }
};
CG.prototype.c = function() {			// clear
    this.details.nodeValue = ' ';
};

CG.prototype.fg = function(url, _w) {
    _w = (typeof _w !== 'undefined') ? _w : window;
    _w.open(url);
};

