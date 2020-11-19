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
function FG(id, shiftWidth, defaultTitle, minWidth, _w, _prompt) {
    defaultTitle = (typeof defaultTitle !== 'undefined') ? defaultTitle : "Flame Graph";
    FGrav.call(this, 1200, 2200, 24, 12, defaultTitle, _w);
    this.id = id;
    this.minWidth = (typeof minWidth !== "undefined") ? minWidth : 600;
    this.minHeight = 150;
    this.shiftWidth = (typeof shiftWidth !== 'undefined') ? shiftWidth : 0;
    this.shiftHeight = 0;
    this.sampleCoefficient = 14;
    this.frameHeight = 15;
    this.minFlameWidth = 0.1; // 0.1 pixels - increasing this value will ignore tiny flames and will improve performance as we won't create them.
    this.minDisplaySample = 1;
    this.textPadding = 10.5;
    this.freezeDimensions = false;
    this.searching = false;
    this.ignorecase = 0;
    this.legend = 0;
    this.overlay = 0;
    this.overlaying = false;
    this.currentSearchTerm = null;
    this.frameFilterNames = this.getParameter("frameFilter", undefined);
    this.colorSchemeName = this.getParameter("color", undefined);
    this.searchTermPromptFunction = (typeof _prompt !== "undefined") ? _prompt :
        function(ic) {
          return prompt("Enter a search term (regexp " +
            "allowed, eg: ^ext4_)"
            + (ic ? ", ignoring case" : "")
            + "\nPress Ctrl-i to toggle case sensitivity", "");
    }
}

FG.prototype = Object.create(FGrav.prototype);
FG.prototype.constructor = FG;

FG.prototype.setup = function(_w) {
    var fg = this;
    _w = (typeof _w !== 'undefined') ? _w : window;
    _w.addEventListener("click", function(e) {
        var target = fg.find_group(e.target);
        if (target) {
            if (target.nodeName === "a") {
                if (e.ctrlKey === false) return;
                e.preventDefault();
            }
            if (target.classList.contains("parent")) fg.unzoom();
            fg.zoom(target);
        }
        else if (e.target.id === "unzoom") fg.unzoom();
        else if (e.target.id === "search") fg.search_prompt();
        else if (e.target.id === "legendBtn") fg.toggle_legend();
        else if (e.target.id === "overlayBtn") fg.toggle_overlay();
        else if (e.target.id === "ignorecase") fg.toggle_ignorecase();
    }, false);

    // mouse-over for info
    // show
    _w.addEventListener("mouseover", function(e) {
        var target = fg.find_group(e.target);
        if (target) fg.showDetails(target, e.clientX, e.clientY);
    }, false);

    // clear
    _w.addEventListener("mouseout", function(e) {
        var target = fg.find_group(e.target);
        if (target) fg.clearDetails(target);
    }, false);

    // ctrl-F for search
    _w.addEventListener("keydown",function (e) {
        if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
            e.preventDefault();
            fg.search_prompt();
        }
    }, false);

    // ctrl-I to toggle case-sensitive search
    _w.addEventListener("keydown",function (e) {
        if (e.ctrlKey && e.keyCode === 73) {
            e.preventDefault();
            fg.toggle_ignorecase();
        }
    }, false);

    frameFilter.reset();
    return fg;
};

FG.prototype.load = function (successCallback, errorCallback) {
    this.loadDynamicJs(this.objectsToLoad(), successCallback, errorCallback);
};

FG.prototype.objectsToLoad = function() {
    var toLoad = [];
    var fg = this;
    if (typeof this.colorSchemeName !== 'undefined') {
        var obj = fg.generateDynamicallyLoadingObject(this.colorSchemeName, "js/color/FG_Color_", function (objName) {
            return "colorScheme = new " + objName + "();"
        });
        toLoad.push(obj);
    }
    if (typeof this.frameFilterNames !== 'undefined') {
        $.each(this.frameFilterNames.split(",").map(function (n) {
            return fg.generateDynamicallyLoadingObject(n, "js/frame/FG_Filter_", function (objName) {
                return "frameFilter.filters.push(new "+ objName +"());";
            });
        }), function () {
            toLoad.push(this);
        });
    }
    return toLoad;
};

FG.prototype.generateDynamicallyLoadingObject = function(name, conventionPrefix, generateInstallScript) {
    var url;
    var objName;
    if (name[0] === '/') {
        url = name;
        var nameIndex = name.lastIndexOf('/') + 1;
        objName = name.substring(nameIndex, name.indexOf('.', nameIndex));
    } else {
        url = conventionPrefix + name + ".js";
        objName = conventionPrefix.substring(conventionPrefix.lastIndexOf("/") + 1) + name;
    }
    return new DynamicallyLoading(url, generateInstallScript(objName));
};

FG.prototype.loadOverlay = function(overlayName, overlayUrl, successCallback) {
    var fg = this;
    this.toggle_overlay();
    if (colorScheme.loadedOverlays[overlayName]) {
        colorScheme.currentOverlay = colorScheme.loadedOverlays[overlayName];
        fg.applyingOverlay(overlayName);
    } else {
        this.loadDynamicJs([this.generateDynamicallyLoadingObject(overlayUrl, "js/color/overlay/FG_Overlay_", function (name) {
                return "colorScheme.currentOverlay = new " + name + "();";
            })], function () {
                fg.applyingOverlay(overlayName);
                if (successCallback) {
                    successCallback();
                }
            }, function (response) {
                log.console("Failed to load " + overlayUrl + ": " + response.errorMessage());
            }
        );
    }
};

FG.prototype.applyingOverlay = function(overlayName) {
    this.redrawFrames();
    this.overlayBtn.firstChild.nodeValue = "Reset " + overlayName;
    this.overlayBtn.classList.add("show");
    this.overlaying = true;
    colorScheme.loadedOverlays[overlayName] = colorScheme.currentOverlay;
};

FG.prototype.redrawFrames = function () {
    this.draw.redrawFG();
};

// accessed from eval (yes, I know, see below)
// and global to the window
var frameFilter = {
    filters: [],
    reset: function() {
        this.filters = [];
    }
};

FG.prototype.namePerFG = function(name) {
    if (this.id) {
        return this.id + name;
    }
    return name;
};

FG.prototype.calculateWidth = function(totalSamples, minSample, numberOfPaths) {
    if (!this.freezeDimensions) {
        if (((this.width - (2 * this.margin) - numberOfPaths) / totalSamples) < minSample) {
            this.fontSize = Math.min(this.fontSize, 8);
            this.margin = 8;
        }
        if (!this.forcedWidth) {
            this.width = Math.max(this.minWidth, Math.min(this.width, (this.margin * 2) + (totalSamples * this.sampleCoefficient)));
        }
    }
    this.minDisplaySample = this.minFlameWidth / ((this.width - (2 * this.margin) - this.shiftWidth) / totalSamples);
};


FG.prototype.calculateHeight = function (maxLevel) {
    if (!this.freezeDimensions) {
        var neededFrameHeight = Math.floor(this.height / maxLevel);
        if (neededFrameHeight < this.frameHeight) {
            this.frameHeight = Math.max(this.frameHeight - 4, neededFrameHeight);
            this.fontSize = 8;
            this.textPadding = 8;
        }
        if (!this.forcedHeight) {
            var additional = (colorScheme && colorScheme.legend) ? Object.keys(colorScheme.legend).length : 0;
            this.height = Math.max(this.minHeight, Math.min(this.height, ((maxLevel + additional + 1) * (this.frameHeight + 2)) + (this.margin * 4)));
        }
    }
};

// code below mostly borrowed function names and some impl from original FlameGraph reference

FG.prototype.g_details = function(g) {
    var attr = find_child(g, "text").attributes;
    var name = attr.name.value;
    var samples = parseInt(attr.samples.value);
    var details =  name + " (" + samples + " samples, "+ percentage(this, samples) +"%)";
    return detailsText(escText(details), details);

    function percentage(fg, samples) {
        return Math.floor(samples * 10000 / fg.totalSamples) / 100;
    }
};


FG.prototype.showDetails = function (g, x, y, detailsText) {
    if (detailsText === undefined) detailsText = this.g_details(g);
    this.details.nodeValue = detailsText.details;
    if (x) {
        showTooltip(this, x, y, detailsText.tip);
    }

    function showTooltip(fg, mouseX, mouseY, tip) {
        var CTM = fg.svg.getScreenCTM();
        var x = (mouseX - CTM.e + 6) / CTM.a;
        var y = (mouseY - CTM.f + 20) / CTM.d;
        var tooltipText = fg.tooltip.getElementsByTagName('text')[0];
        tooltipText.innerHTML = tip;
        var tooltipRect = fg.tooltip.getElementsByTagName('rect')[0];
        var length = tooltipText.getComputedTextLength();
        tooltipRect.setAttributeNS(null, "width", length + 8);
        if (x + length + 8 >  fg.width + fg.shiftWidth) {
            x = Math.max(fg.shiftWidth, fg.shiftWidth + fg.width - length - 8);
        }
        fg.tooltip.setAttributeNS(null, "transform", "translate(" + x + " " + y + ")");
        fg.tooltip.removeAttribute("visibility");
    }

};

FG.prototype.clearDetails = function (g) {
    this.details.nodeValue = " ";
    this.tooltip.setAttribute("visibility", "hidden");
};

// functions
function detailsText(tip, details) {
    return {
        tip: tip,
        details: details
    };
}
function find_child(node, selector) {
    var children = find_children(node, selector);
    if (children.length) return children[0];
}
function find_children(node, selector) {
    return node.querySelectorAll(selector);
}
FG.prototype.find_group = function(node) {
    var parent = node.parentElement;
    if (!parent) return;
    if (parent.id === this.namePerFG("frames")) return node;
    return this.find_group(parent);
};
function orig_save(e, attr, val) {
    if (e.attributes["_orig_"+attr] != undefined) return;
    if (e.attributes[attr] == undefined) return;
    if (val == undefined) val = e.attributes[attr].value;
    e.setAttribute("_orig_"+attr, val);
}
function orig_load(e, attr) {
    if (e.attributes["_orig_"+attr] == undefined) return;
    e.attributes[attr].value = e.attributes["_orig_"+attr].value;
    e.removeAttribute("_orig_"+attr);
}
function g_name(e) {
    var text = find_child(e, "text").attributes.name.value;
    return (text);
}
function g_samples(e) {
    var text = find_child(e, "text").attributes.samples.value;
    return parseInt(text);
}
function g_to_func(e) {
    var func = g_name(e);
    // if there's any manipulation we want to do to the function
    // name before it's searched, do it here before returning.
    return (func);
}

// zoom
FG.prototype.zoom = function(node, topFG) {
    topFG = (typeof topFG !== 'undefined') ? topFG : this;
    var attr = find_child(node, "rect").attributes;
    var width = parseFloat(attr.width.value);
    var xmin = parseFloat(attr.x.value);
    var xmax = parseFloat(xmin + width);
    var ymin = parseFloat(attr.y.value);
    var ratio = (this.width - 2 * this.margin) / width;

    // XXX: Workaround for JavaScript float issues (fix me)
    var fudge = 0.0001;

    topFG.unzoombtn.classList.remove("hide");
    var fg = this;
    var el = this.svg.getElementById(fg.namePerFG("frames")).children;
    for(var i=0;i<el.length;i++){
        var e = el[i];
        if (!fg.id || e.id.startsWith(fg.id)) {
            var a = find_child(e, "rect").attributes;
            var ex = parseFloat(a.x.value);
            var ew = parseFloat(a.width.value);
            // Is it an ancestor
            var upstack = parseFloat(a.y.value) > ymin;
            if (upstack) {
                // Direct ancestor
                if (ex <= xmin && (ex + ew + fudge) >= xmax) {
                    e.classList.add("parent");
                    zoom_parent(e, fg.margin, fg.width, fg.shiftWidth);
                    update_text(e, fg);
                }
                // not in current path
                else
                    e.classList.add("hide");
            }
            // Children maybe
            else {
                // no common path
                if (ex < xmin || ex + fudge >= xmax) {
                    e.classList.add("hide");
                }
                else {
                    zoom_child(e, xmin, ratio, fg.margin, fg.shiftWidth);
                    update_text(e, fg);
                }
            }
        }
        this.search();
    }

    function update_text(e, fg) {
        var r = find_child(e, "rect");
        var t = find_child(e, "text");
        var w = parseFloat(r.attributes.width.value) -3;
        var txt = t.attributes.name.value;
        t.attributes.x.value = parseFloat(r.attributes.x.value) +3;

        // Smaller than this size won't fit anything
        if (w < 2 * fg.fontSize * fg.fontWidthRatio) {
            t.textContent = "";
            return;
        }

        t.textContent = txt;
        // Fit in full text width
        if (/^ *$/.test(txt) || t.getSubStringLength(0, txt.length) < w)
            return;

        for (var x=txt.length-2; x>0; x--) {
            if (t.getSubStringLength(0, x+2) <= w) {
                t.textContent = txt.substring(0,x) + "..";
                return;
            }
        }
        t.textContent = "";
    }

    function  zoom_child(e, x, ratio, margin, shiftX) {
        if (e.attributes != undefined) {
            if (e.attributes.x != undefined) {
                orig_save(e, "x");
                e.attributes.x.value = (parseFloat(e.attributes["x"].value) - x - margin) * ratio + margin + shiftX;
                if(e.tagName == "text") e.attributes["x"].value = find_child(e.parentNode, "rect[x]").attributes.x.value + 3;
            }
            if (e.attributes.width != undefined) {
                orig_save(e, "width");
                e.attributes.width.value = parseFloat(e.attributes.width.value) * ratio;
            }
        }

        if (e.childNodes == undefined) return;
        for(var i=0, c=e.childNodes; i<c.length; i++) {
            zoom_child(c[i], x - margin, ratio, margin, shiftX);
        }
    }

    function zoom_parent(e, margin, fgWidth, shiftX) {
        if (e.attributes) {
            if (e.attributes.x != undefined) {
                orig_save(e, "x");
                e.attributes.x.value = margin + shiftX;
            }
            if (e.attributes.width != undefined) {
                orig_save(e, "width");
                e.attributes.width.value = fgWidth - (margin*2);
            }
        }
        if (e.childNodes == undefined) return;
        for(var i=0, c=e.childNodes; i<c.length; i++) {
            zoom_parent(c[i], margin, fgWidth, shiftX);
        }
    }
};
FG.prototype.unzoom = function(topFG) {
    topFG = (typeof topFG !== 'undefined') ? topFG : this;
    topFG.unzoombtn.classList.add("hide");
    
    var fg = this;
    var el = this.svg.getElementById(fg.namePerFG("frames")).children;
    for(i=0;i<el.length;i++) {
        el[i].classList.remove("parent");
        el[i].classList.remove("hide");
        zoom_reset(el[i]);
    }
    this.search();

    function zoom_reset(e) {
        var r = find_children(e, "rect");
        var t = find_child(e, "text");
        for(var i=0; i<r.length; i++) {
            orig_load(r[i], "x");
            orig_load(r[i], "width");
        }
        orig_load(t, "x");
        t.textContent = t.getAttribute("orig");
    }
};

// legend
FG.prototype.toggle_legend = function() {
    if (this.legendEl) {
        this.legend = !this.legend;
        if (this.legend) {
            this.legendBtn.classList.add("show");
            this.legendEl.classList.remove("hide");
        } else {
            this.legendBtn.classList.remove("show");
            this.legendEl.classList.add("hide");
        }
    }
};

// overlay
FG.prototype.toggle_overlay = function() {
    if (this.overlaying) {
        this.reset_overlay();
    }
    if (this.overlayEl) {
        this.overlay = !this.overlay;
        if (this.overlay) {
            this.overlayBtn.classList.add("show");
            this.overlayEl.classList.remove("hide");
        } else {
            this.overlayBtn.classList.remove("show");
            this.overlayEl.classList.add("hide");
        }
    }
};

FG.prototype.reset_overlay = function() {
    this.overlayBtn.firstChild.nodeValue = "Overlay";
    colorScheme.currentOverlay = undefined;
    this.redrawFrames();
    this.overlaying = false;
    this.overlay = true;
};

// search
FG.prototype.toggle_ignorecase = function() {
    this.ignorecase = !this.ignorecase;
    if (this.ignorecase) {
        this.ignorecaseBtn.classList.add("show");
    } else {
        this.ignorecaseBtn.classList.remove("show");
    }
    this.reset_search();
    this.search();
};
FG.prototype.reset_search = function() {
    var el = this.svg.querySelectorAll("#"+this.namePerFG("frames")+" rect");
    for (var i = 0; i < el.length; i++) {
        orig_load(el[i], "fill")
    }
};

FG.prototype.search_prompt = function() {
    if (!this.searching) {
        var term = this.searchTermPromptFunction.call(this.ignorecase);
        if (term != null) {
            this.currentSearchTerm = term;
            this.search();
        }
    } else {
        this.reset_search();
        this.searching = false;
        this.currentSearchTerm = null;
        this.searchbtn.classList.remove("show");
        this.searchbtn.firstChild.nodeValue = "Search";
        this.matchedtxt.classList.add("hide");
        this.matchedtxt.firstChild.nodeValue = ""
    }
};
FG.prototype.search = function(topFG) {
    topFG = (typeof topFG !== 'undefined') ? topFG : this;
    var term;
    if (topFG.currentSearchTerm !== null) {
	    term = topFG.currentSearchTerm;
    } else if (!term) {
        return;
    }

    var re = new RegExp(term, topFG.ignorecase ? 'i' : '');
    var el = this.svg.getElementById(this.namePerFG("frames")).children;
    var matches = new Object();
    var maxwidth = 0;
    for (var i = 0; i < el.length; i++) {
        var e = el[i];
        var func = g_to_func(e);
        var rect = find_child(e, "rect");
        if (func == null || rect == null)
            continue;

        // Save max width. Only works as we have a root frame
        var w = parseFloat(rect.attributes.width.value);
        if (w > maxwidth)
            maxwidth = w;

        if (func.match(re)) {
            // highlight
            var x = parseFloat(rect.attributes.x.value);
            orig_save(rect, "fill");
            rect.attributes.fill.value = "rgb(230,0,230)";

            // remember matches
            if (matches[x] == undefined) {
                matches[x] = w;
            } else {
                if (w > matches[x]) {
                    // overwrite with parent
                    matches[x] = w;
                }
            }
            topFG.searching = true;
        }
    }

    if (!topFG.searching)
        return;

    topFG.searchbtn.classList.add("show");
    topFG.searchbtn.firstChild.nodeValue = "Reset Search";

    // calculate percent matched, excluding vertical overlap
    var count = 0;
    var lastx = -1;
    var lastw = 0;
    var keys = Array();
    for (k in matches) {
        if (matches.hasOwnProperty(k))
            keys.push(k);
    }
    // sort the matched frames by their x location
    // ascending, then width descending
    keys.sort(function(a, b){
        return a - b;
    });
    // Step through frames saving only the biggest bottom-up frames
    // thanks to the sort order. This relies on the tree property
    // where children are always smaller than their parents.
    var fudge = 0.0001;	// JavaScript floating point
    for (var k in keys) {
        var x = parseFloat(keys[k]);
        var w = matches[keys[k]];
        if (x >= lastx + lastw - fudge) {
            count += w;
            lastx = x;
            lastw = w;
        }
    }
    // display matched percent
    this.matchedtxt.classList.remove("hide");
    pct = 100 * count / maxwidth;
    if (pct != 100) pct = pct.toFixed(1);
    this.matchedtxt.firstChild.nodeValue = "Matched: " + pct + "%";
};



