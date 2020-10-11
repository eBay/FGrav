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

/**
 * Represents multiple FGs that can be operated on at the same time.
 */

function MultiFG(_loc) {
    FG.call(this, "multi", 0, "Flame Graph Diff", _loc);
    this.fgs = {};
}
MultiFG.prototype = Object.create(FG.prototype);
MultiFG.prototype.constructor = MultiFG;

MultiFG.prototype.registerFG = function(fg) {
    this.fgs[fg.id] = fg;
};

MultiFG.prototype.setDimensions = function () {
    var self = this;
    self.width = self.margin;
    self.height = 0;
    this.onAllFGs(function (fg) {
        self.width += fg.width;
        self.height = Math.max(self.height, fg.height);
        self.fontSize = Math.min(self.fontSize, fg.fontSize);
        self.frameHeight = Math.min(self.frameHeight, fg.frameHeight);
        self.textPadding = Math.min(self.textPadding, fg.textPadding);
        self.minDisplaySample = Math.min(self.minDisplaySample, fg.minDisplaySample);
    });
    this.onAllFGs(function (fg) {
        fg.shiftHeight = self.height - fg.height;
        fg.fontSize = self.fontSize;
        fg.frameHeight = self.frameHeight;
        fg.textPadding = self.textPadding;
        fg.minDisplaySample = self.minDisplaySample;
    });
};

function findNode(fg, nodeId) {
    var id = fg.id + nodeId.substring(nodeId.indexOf(';'));
    return fg.svg.getElementById(id);
}

MultiFG.prototype.getFG = function(id) {
    id = id.substring(0, id.indexOf(';'));
    return this.fgs[id];
};

MultiFG.prototype.onAllFGs = function(operation, except) {
    $.each(Object.values(this.fgs), function (i, fg) {
        if (fg !== except) {
            operation(fg);
        }
    });
};

MultiFG.prototype.delegateToFG = function(node, func) {
    var fg = this.getFG(node.id);
    func(fg, node, true);
    this.onAllFGs(function (other) {
        var otherNode = findNode(other, node.id);
        if (otherNode) {
            func(other, otherNode, false);
        }
    }, fg);
};

MultiFG.prototype.g_details = function(g) {
    var attr = find_child(g, "text").attributes;
    var name = attr.name.value;
    var samples = parseInt(attr.samples.value);
    var others = [];
    var triggerFg = this.getFG(g.id);
    $.each(Object.values(this.fgs), function (i, fg) {
        if (fg !== triggerFg) {
            var otherG = findNode(fg, g.id);
            if (otherG) {
                var otherAttr = find_child(otherG, "text").attributes;
                others.push(percentage(fg, parseInt(otherAttr.samples.value)));
            } else {
                others.push(0.0);
            }
        }
    });
    var thisPct = percentage(triggerFg, samples);
    var samplesText = " (" + samples + " samples, "+ thisPct +"%)";
    var details = name + samplesText;
    var tip = escText(name) + samplesText;
    $.each(others, function (i, pct) {
        var diff = Math.floor((thisPct - pct) * 100) / 100.0;
        if (diff < 0) {
            tip = tip + " <tspan fill=\"rgb(255,77,77)\">" + diff + "%</tspan>";
        }
        else if (diff > 0) {
            tip = tip + " <tspan fill=\"rgb(179,179,255)\">+" + diff + "%</tspan>";
        }
        else { // tip == 0
            tip = tip + " 0%";
        }
    });

    return detailsText(tip, details);

    function percentage(fg, samples) {
        return Math.floor(samples * 10000 / fg.totalSamples) / 100;
    }
};

MultiFG.prototype.showDetails = function (node, x, y, detailsText) {
    if (detailsText === undefined) detailsText = this.g_details(node);
    this.delegateToFG(node, function (fg, n, original) {
        if (original) {
            fg.showDetails(n, x, y, detailsText);
        }
        else {
            fg.showDetails(n, 0, 0);
            n.setAttribute("class", "highlight_g");
        }
    });
};
MultiFG.prototype.clearDetails = function (node) {
    this.delegateToFG(node, function (fg, n, original) {
        fg.clearDetails(n);
        if (!original) {
            n.removeAttribute("class");
        }
    });
};
MultiFG.prototype.find_group = function(node) {
    var parent = node.parentElement;
    if (!parent) return;
    if (parent.id.endsWith("frames")) return node;
    return this.find_group(parent);
};

// zoom
MultiFG.prototype.zoom = function(node) {
    var multiFG = this;
    this.delegateToFG(node, function (fg, n, original) {
        fg.zoom(n, multiFG);
    });
};

MultiFG.prototype.unzoom = function() {
    var multiFG = this;
    this.onAllFGs(function (fg) {
        fg.unzoom(multiFG);
    });
};
MultiFG.prototype.search_prompt = function() {
    if (!this.searching) {
        var term = prompt("Enter a search term (regexp " +
            "allowed, eg: ^ext4_)"
            + (this.ignorecase ? ", ignoring case" : "")
            + "\nPress Ctrl-i to toggle case sensitivity", "");
        if (term != null) {
            this.currentSearchTerm = term;
            var multiFG = this;
            this.onAllFGs(function (fg) {
                fg.search(multiFG);
            });
        }
    } else {
        this.searching = 0;
        this.currentSearchTerm = null;
        this.searchbtn.classList.remove("show");
        this.searchbtn.firstChild.nodeValue = "Search";
        this.onAllFGs(function (fg) {
            fg.reset_search();
            fg.matchedtxt.classList.add("hide");
            fg.matchedtxt.firstChild.nodeValue = "";
        });
    }
};


