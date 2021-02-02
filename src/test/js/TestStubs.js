

function frameObject(name, stack, samples, x, y, w) {
    return {
        name: name,
        stack: stack,
        samples: samples,
        x: function () {
            return x;
        },
        y: function () {
            return y;
        },
        w: function() {
            return w;
        },
        getName: function () {
            return name;
        },
        getSamples: function () {
            return samples;
        }
    }
}

function frame(frameText, color) {
    var el = domGroupElement();
    el.text.setAttribute("name", frameText);
    el.rect.setAttribute("width", "17");
    el.rect.setAttribute("x", "19");
    el.rect.setAttribute("fill", color);
    return el;
}

function frames(framesArray) {
    return {
        getElementById: function (id) {
            return {
                children: framesArray
            }
        }
    };
}

function domElement(name) {
    return {
        name: name,
        attributes: {},
        children: [],
        getAttributeValue: function(k) {
            return this.attributes[k].value;
        },
        getAttribute: function(k) {
            return this.attributes[k];
        },
        setAttribute: function(k, v) {
            this.attributes[k] = { value: v };
        },
        setAttributes: function(k1, v1, k2, v2, k3, v3) {
            this.setAttribute(k1, v1);
            this.setAttribute(k2, v2);
            this.setAttribute(k3, v3);
        },
        classList: {
            class: [],
            add: function (c) {
                this.class.push(c);
            },
            remove: function (c) {
                this.class = this.class.filter(function(e) { return e !== c });
            }
        },
        firstChild: {},
        querySelectorAll: function (selector) {},
        getSubStringLength: function (start, end) {
            return 17;
        },
        appendChild: function (child) {
            this.children.push(child);
        }
    };
}

function domGroupElement() {
    var el = domElement();
    el.rect = domElement();
    el.text = domElement();
    el.querySelectorAll = function (selector) {
        if (selector === 'rect') {
            return [this.rect];
        }
        if (selector === 'text') {
            return [this.text];
        }

        return [];
    };
    el.childNodes = [ el.rect, el.text ];
    return el;
}

function FG_Color_Black() {
    FG_Color.call(this);
}

FG_Color_Black.prototype = Object.create(FG_Color.prototype);
FG_Color_Black.prototype.constructor = FG_Color_Black;
FG_Color_Black.prototype.colorFor = function(frame, totalSamples) {
    return "black";
};
