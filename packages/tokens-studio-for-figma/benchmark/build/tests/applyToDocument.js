/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/figma-api-stub/dist/applyMixins.js":
/*!*************************************************************!*\
  !*** ../../node_modules/figma-api-stub/dist/applyMixins.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}
exports.applyMixins = applyMixins;
//# sourceMappingURL=applyMixins.js.map

/***/ }),

/***/ "../../node_modules/figma-api-stub/dist/componentStubs.js":
/*!****************************************************************!*\
  !*** ../../node_modules/figma-api-stub/dist/componentStubs.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var fonts_1 = __webpack_require__(/*! ./fonts */ "../../node_modules/figma-api-stub/dist/fonts.js");
var nanoid_1 = __webpack_require__(/*! nanoid */ "../../node_modules/nanoid/index.browser.js");
var rxjs_1 = __webpack_require__(/*! rxjs */ "../../node_modules/rxjs/_esm5/index.js");
exports.selectionChangeSubject = new rxjs_1.Subject();
var RectangleNodeStub = /** @class */ (function () {
    function RectangleNodeStub(config) {
        this.config = config;
        this.type = "RECTANGLE";
    }
    return RectangleNodeStub;
}());
exports.RectangleNodeStub = RectangleNodeStub;
var defaultFont = { family: "Inter", style: "Regular" };
var TextNodeStub = /** @class */ (function () {
    function TextNodeStub(config) {
        this.config = config;
        this.type = "TEXT";
    }
    Object.defineProperty(TextNodeStub.prototype, "fontName", {
        get: function () {
            return this._fontName || defaultFont;
        },
        set: function (fontName) {
            if (this.config.simulateErrors && !fontName) {
                throw new Error("Error: fontName is undefined");
            }
            this._fontName = fontName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextNodeStub.prototype, "characters", {
        get: function () {
            return this._characters || "";
        },
        set: function (characters) {
            if (this.config.simulateErrors && !fonts_1.Fonts.isFontLoaded(this.fontName)) {
                throw new Error("Error: font is not loaded " + this.fontName.family + " " + this.fontName.style);
            }
            this._characters = characters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextNodeStub.prototype, "textAutoResize", {
        get: function () {
            return this._textAutoResize;
        },
        set: function (value) {
            if (this.config.simulateErrors && !fonts_1.Fonts.isFontLoaded(this.fontName)) {
                throw new Error("Error: font is not loaded " + this.fontName.family + " " + this.fontName.style);
            }
            this._textAutoResize = value;
        },
        enumerable: true,
        configurable: true
    });
    TextNodeStub.prototype.getRangeFontName = function (start, end) {
        if (this.config.simulateErrors && start < 0) {
            throw new Error("Error: Expected \"start\" to have value >=0");
        }
        if (this.config.simulateErrors && end < 0) {
            throw new Error("Error: Expected \"end\" to have value >=0");
        }
        if (this.config.simulateErrors && end > this._characters.length) {
            throw new Error("Error: Range outside of available characters. 'start' must be less than node.characters.length and 'end' must be less than or equal to node.characters.length");
        }
        if (this.config.simulateErrors && end === start) {
            throw new Error("Error: Empty range selected. 'end' must be greater than 'start'");
        }
        return this._fontName || defaultFont;
    };
    TextNodeStub.prototype.deleteCharacters = function (start, end) {
        if (this.config.simulateErrors && !fonts_1.Fonts.isFontLoaded(this.fontName)) {
            throw new Error("Error: font is not loaded " + this.fontName.family + " " + this.fontName.style);
        }
        if (this.config.simulateErrors && start < 0) {
            throw new Error("Error: Expected \"start\" to have value >=0");
        }
        if (this.config.simulateErrors && end < 0) {
            throw new Error("Error: Expected \"end\" to have value >=0");
        }
        if (this.config.simulateErrors && end > this._characters.length) {
            throw new Error("Error: Cannot delete characters at index greater than the length of the text");
        }
        this._characters =
            this._characters.slice(start, end) +
                (end === this._characters.length ? "" : this._characters.slice(end + 1));
    };
    TextNodeStub.prototype.insertCharacters = function (start, characters, _useStyle) {
        if (_useStyle === void 0) { _useStyle = "BEFORE"; }
        if (this.config.simulateErrors && !fonts_1.Fonts.isFontLoaded(this.fontName)) {
            throw new Error("Error: font is not loaded " + this.fontName.family + " " + this.fontName.style);
        }
        if (this.config.simulateErrors && start < 0) {
            throw new Error("Error: Expected \"start\" to have value >=0");
        }
        if (this.config.simulateErrors && start > this._characters.length) {
            throw new Error("Error: Cannot insert characters at index greater than the length of the text");
        }
        this._characters = [
            this._characters.slice(0, start),
            characters,
            this._characters.slice(start)
        ].join("");
    };
    return TextNodeStub;
}());
exports.TextNodeStub = TextNodeStub;
var TextSublayerNode = /** @class */ (function () {
    function TextSublayerNode(config) {
        this.config = config;
    }
    Object.defineProperty(TextSublayerNode.prototype, "fontName", {
        get: function () {
            return this._fontName || defaultFont;
        },
        set: function (fontName) {
            if (this.config.simulateErrors && !fontName) {
                throw new Error("Error: fontName is undefined");
            }
            this._fontName = fontName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextSublayerNode.prototype, "characters", {
        get: function () {
            return this._characters || "";
        },
        set: function (characters) {
            if (this.config.simulateErrors && !fonts_1.Fonts.isFontLoaded(this.fontName)) {
                throw new Error("Error: font is not loaded " + this.fontName.family + " " + this.fontName.style);
            }
            this._characters = characters;
        },
        enumerable: true,
        configurable: true
    });
    TextSublayerNode.prototype.insertCharacters = function (start, characters, _useStyle) {
        if (_useStyle === void 0) { _useStyle = "BEFORE"; }
        if (this.config.simulateErrors && !fonts_1.Fonts.isFontLoaded(this._fontName)) {
            throw new Error("Error: font is not loaded " + this._fontName.family + " " + this._fontName.style);
        }
        if (this.config.simulateErrors && start < 0) {
            throw new Error("Error: Expected \"start\" to have value >=0");
        }
        if (this.config.simulateErrors && start > this._characters.length) {
            throw new Error("Error: Cannot insert characters at index greater than the length of the text");
        }
        this._characters = [
            this._characters.slice(0, start),
            characters,
            this._characters.slice(start)
        ].join("");
    };
    TextSublayerNode.prototype.deleteCharacters = function (start, end) {
        if (this.config.simulateErrors && !fonts_1.Fonts.isFontLoaded(this._fontName)) {
            throw new Error("Error: font is not loaded " + this._fontName.family + " " + this._fontName.style);
        }
        if (this.config.simulateErrors && start < 0) {
            throw new Error("Error: Expected \"start\" to have value >=0");
        }
        if (this.config.simulateErrors && end < 0) {
            throw new Error("Error: Expected \"end\" to have value >=0");
        }
        if (this.config.simulateErrors && end > this._characters.length) {
            throw new Error("Error: Cannot delete characters at index greater than the length of the text");
        }
        this._characters =
            this._characters.slice(start, end) +
                (end === this._characters.length ? "" : this._characters.slice(end + 1));
    };
    TextSublayerNode.prototype.getRangeFontName = function (start, end) {
        if (this.config.simulateErrors && start < 0) {
            throw new Error("Error: Expected \"start\" to have value >=0");
        }
        if (this.config.simulateErrors && end < 0) {
            throw new Error("Error: Expected \"end\" to have value >=0");
        }
        if (this.config.simulateErrors && end > this._characters.length) {
            throw new Error("Error: Range outside of available characters. 'start' must be less than node.characters.length and 'end' must be less than or equal to node.characters.length");
        }
        if (this.config.simulateErrors && end === start) {
            throw new Error("Error: Empty range selected. 'end' must be greater than 'start'");
        }
        return this._fontName || defaultFont;
    };
    return TextSublayerNode;
}());
exports.TextSublayerNode = TextSublayerNode;
var ShapeWithTextNodeStub = /** @class */ (function () {
    function ShapeWithTextNodeStub(config) {
        this.config = config;
        this.type = "SHAPE_WITH_TEXT";
        this._cornerRadius = 50;
        this.shapeType = "ELLIPSE";
        this.rotation = 0;
        this._text = new TextSublayerNode(this.config);
    }
    Object.defineProperty(ShapeWithTextNodeStub.prototype, "text", {
        get: function () {
            return this._text;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShapeWithTextNodeStub.prototype, "cornerRadius", {
        get: function () {
            return this._cornerRadius;
        },
        enumerable: true,
        configurable: true
    });
    return ShapeWithTextNodeStub;
}());
exports.ShapeWithTextNodeStub = ShapeWithTextNodeStub;
var StickyNodeStub = /** @class */ (function () {
    function StickyNodeStub(config) {
        this.config = config;
        this.type = "STICKY";
        this.authorVisible = true;
        this.authorName = "";
        this._text = new TextSublayerNode(this.config);
    }
    Object.defineProperty(StickyNodeStub.prototype, "text", {
        get: function () {
            return this._text;
        },
        enumerable: true,
        configurable: true
    });
    return StickyNodeStub;
}());
exports.StickyNodeStub = StickyNodeStub;
var ConnectorNodeStub = /** @class */ (function () {
    function ConnectorNodeStub(config) {
        this.config = config;
        this.type = "CONNECTOR";
        this._text = new TextSublayerNode(config);
    }
    Object.defineProperty(ConnectorNodeStub.prototype, "cornerRadius", {
        get: function () {
            return this._cornerRadius;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectorNodeStub.prototype, "textBackground", {
        get: function () {
            return this._textBackground;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectorNodeStub.prototype, "text", {
        get: function () {
            return this._text;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectorNodeStub;
}());
exports.ConnectorNodeStub = ConnectorNodeStub;
var DocumentNodeStub = /** @class */ (function () {
    function DocumentNodeStub(config) {
        this.config = config;
        this.type = "DOCUMENT";
        this.children = [];
    }
    return DocumentNodeStub;
}());
exports.DocumentNodeStub = DocumentNodeStub;
var PageNodeStub = /** @class */ (function () {
    function PageNodeStub(config) {
        this.config = config;
        this.type = "PAGE";
        this.children = [];
    }
    Object.defineProperty(PageNodeStub.prototype, "selection", {
        get: function () {
            return this._selection || [];
        },
        set: function (value) {
            this._selection = value;
            exports.selectionChangeSubject.next();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageNodeStub.prototype, "backgrounds", {
        get: function () {
            return (this._backgrounds || [
                {
                    type: "SOLID",
                    visible: true,
                    opacity: 1,
                    blendMode: "NORMAL",
                    color: {
                        r: 0.9607843160629272,
                        g: 0.9607843160629272,
                        b: 0.9607843160629272
                    }
                }
            ]);
        },
        set: function (value) {
            if (this.config.simulateErrors &&
                (value.length !== 1 || value[0].type !== "SOLID")) {
                throw new Error("Error: in set_backgrounds: Page backgrounds must be a single solid paint");
            }
            this._backgrounds = value;
        },
        enumerable: true,
        configurable: true
    });
    return PageNodeStub;
}());
exports.PageNodeStub = PageNodeStub;
var FrameNodeStub = /** @class */ (function () {
    function FrameNodeStub(config) {
        this.config = config;
        this.type = "FRAME";
        this.children = [];
    }
    return FrameNodeStub;
}());
exports.FrameNodeStub = FrameNodeStub;
var GroupNodeStub = /** @class */ (function () {
    function GroupNodeStub(config) {
        this.config = config;
        this.type = "GROUP";
    }
    Object.defineProperty(GroupNodeStub.prototype, "constraints", {
        set: function (value) {
            if (this.config.simulateErrors) {
                throw new Error("Error: Cannot add property constraints, object is not extensible");
            }
        },
        enumerable: true,
        configurable: true
    });
    return GroupNodeStub;
}());
exports.GroupNodeStub = GroupNodeStub;
var BooleanOperationNodeStub = /** @class */ (function () {
    function BooleanOperationNodeStub(config) {
        this.config = config;
        this.type = "BOOLEAN_OPERATION";
        this.expand = false;
    }
    return BooleanOperationNodeStub;
}());
exports.BooleanOperationNodeStub = BooleanOperationNodeStub;
function cloneChildren(node) {
    var clone = new node.constructor();
    for (var key in node) {
        if (typeof node[key] === "function") {
            clone[key] = node[key].bind(clone);
        }
        else {
            clone[key] = node[key];
        }
    }
    clone._orig = node;
    clone.pluginData = {};
    clone.sharedPluginData = {};
    if ("children" in node) {
        clone.children = node.children.map(function (child) { return cloneChildren(child); });
        clone.children.forEach(function (child) {
            child.parent = clone;
        });
    }
    return clone;
}
var ComponentNodeStub = /** @class */ (function () {
    function ComponentNodeStub(config) {
        this.config = config;
        this.type = "COMPONENT";
        this.key = nanoid_1.nanoid(40);
        this.children = [];
    }
    ComponentNodeStub.prototype.createInstance = function () {
        var _this = this;
        var instance = new InstanceNodeStub(this.config);
        instance.children = this.children.map(function (child) { return cloneChildren(child); });
        instance.children.forEach(function (child) {
            child.parent = _this;
        });
        // instance.pluginData = {};
        instance._orig = this;
        instance.mainComponent = this;
        return instance;
    };
    return ComponentNodeStub;
}());
exports.ComponentNodeStub = ComponentNodeStub;
var InstanceNodeStub = /** @class */ (function () {
    function InstanceNodeStub(config) {
        this.config = config;
        this.type = "INSTANCE";
    }
    InstanceNodeStub.prototype.detachInstance = function () {
        this.type = "FRAME";
    };
    return InstanceNodeStub;
}());
exports.InstanceNodeStub = InstanceNodeStub;
//# sourceMappingURL=componentStubs.js.map

/***/ }),

/***/ "../../node_modules/figma-api-stub/dist/config.js":
/*!********************************************************!*\
  !*** ../../node_modules/figma-api-stub/dist/config.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultConfig = {
    simulateErrors: false,
    isWithoutTimeout: false
};
//# sourceMappingURL=config.js.map

/***/ }),

/***/ "../../node_modules/figma-api-stub/dist/fonts.js":
/*!*******************************************************!*\
  !*** ../../node_modules/figma-api-stub/dist/fonts.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Inter = [
    {
        fontName: {
            family: "Inter",
            style: "Thin"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Extra Light"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Light"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Regular"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Medium"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Semi Bold"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Bold"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Extra Bold"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Black"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Thin Italic"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Extra Light Italic"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Light Italic"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Regular Italic"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Medium Italic"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Semi Bold Italic"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Bold Italic"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Extra Bold Italic"
        }
    },
    {
        fontName: {
            family: "Inter",
            style: "Black Italic"
        }
    }
];
exports.Roboto = [
    {
        fontName: {
            family: "Roboto",
            style: "Thin"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Light"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Regular"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Medium"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Bold"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Black"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Thin Italic"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Light Italic"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Regular Italic"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Medium Italic"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Bold Italic"
        }
    },
    {
        fontName: {
            family: "Roboto",
            style: "Black Italic"
        }
    }
];
exports.Helvetica = [
    {
        fontName: {
            family: "Helvetica",
            style: "Light"
        }
    },
    {
        fontName: {
            family: "Helvetica",
            style: "Regular"
        }
    },
    {
        fontName: {
            family: "Helvetica",
            style: "Bold"
        }
    },
    {
        fontName: {
            family: "Helvetica",
            style: "Light Oblique"
        }
    },
    {
        fontName: {
            family: "Helvetica",
            style: "Oblique"
        }
    },
    {
        fontName: {
            family: "Helvetica",
            style: "Oblique"
        }
    }
];
var Fonts = /** @class */ (function () {
    function Fonts() {
    }
    Fonts.isFontLoaded = function (fontName) {
        return this.loadedFonts.find(function (font) { return font.family === fontName.family && font.style === fontName.style; });
    };
    Fonts.loadedFonts = [];
    return Fonts;
}());
exports.Fonts = Fonts;
//# sourceMappingURL=fonts.js.map

/***/ }),

/***/ "../../node_modules/figma-api-stub/dist/index.js":
/*!*******************************************************!*\
  !*** ../../node_modules/figma-api-stub/dist/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var stubs_1 = __webpack_require__(/*! ./stubs */ "../../node_modules/figma-api-stub/dist/stubs.js");
exports.createFigma = stubs_1.createFigma;
exports.createParentPostMessage = stubs_1.createParentPostMessage;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../node_modules/figma-api-stub/dist/mixins.js":
/*!********************************************************!*\
  !*** ../../node_modules/figma-api-stub/dist/mixins.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isInsideInstance = function (node) {
    if (!node.parent) {
        return;
    }
    return node.parent.type === "INSTANCE" || exports.isInsideInstance(node.parent);
};
exports.getChildrenMixinStub = function (config) {
    return /** @class */ (function () {
        function ChildrenMixinStub() {
        }
        ChildrenMixinStub.prototype.appendChild = function (item) {
            if (!this.children) {
                this.children = [];
            }
            if (item.parent) {
                item.parent.children = item.parent.children.filter(function (child) { return child !== item; });
            }
            if (config.simulateErrors && !item) {
                throw new Error("Error: empty child");
            }
            if (config.simulateErrors &&
                // @ts-ignore
                this.type === "DOCUMENT" &&
                item.type !== "PAGE") {
                throw new Error("Error: The root node cannot have children of type other than PAGE");
            }
            item.parent = this;
            this.children.push(item);
        };
        ChildrenMixinStub.prototype.insertChild = function (index, child) {
            if (!this.children) {
                this.children = [];
            }
            if (config.simulateErrors && !child) {
                throw new Error("Error: empty child");
            }
            // @ts-ignore
            if (config.simulateErrors && child.parent === this) {
                throw new Error("Error: Node already inside parent");
            }
            if (config.simulateErrors &&
                // @ts-ignore
                this.type === "DOCUMENT" &&
                child.type !== "PAGE") {
                throw new Error("Error: The root node cannot have children of type other than PAGE");
            }
            if (child.parent) {
                child.parent.children = child.parent.children.filter(function (_child) { return child !== _child; });
            }
            // @ts-ignore
            child.parent = this;
            this.children.splice(index, 0, child);
        };
        ChildrenMixinStub.prototype.findAllWithCriteria = function (criteria) {
            var typeLookup = new Set(criteria.types);
            return this.findAll(function () { return true; }).filter(function (child) {
                return typeLookup.has(child.type);
            });
        };
        ChildrenMixinStub.prototype.findAll = function (callback) {
            if (!this.children) {
                return [];
            }
            var matchingChildren = [];
            this.children.forEach(function (child) {
                if (callback(child)) {
                    matchingChildren.push(child);
                }
                if ("findAll" in child) {
                    matchingChildren.push.apply(matchingChildren, child.findAll(callback));
                }
            });
            return matchingChildren;
        };
        ChildrenMixinStub.prototype.findOne = function (callback) {
            var matches = this.findAll(callback);
            if (matches.length > 0) {
                return matches[0];
            }
            return null;
        };
        ChildrenMixinStub.prototype.findChild = function (callback) {
            if (!this.children) {
                return null;
            }
            return this.children.find(callback);
        };
        ChildrenMixinStub.prototype.findChildren = function (callback) {
            if (!this.children) {
                return null;
            }
            return this.children.filter(callback);
        };
        return ChildrenMixinStub;
    }());
};
exports.getBaseNodeMixinStub = function (config) {
    return /** @class */ (function () {
        function BaseNodeMixinStub() {
            // instance nodes that are cloned from components will have `_orig` set to
            // the value of the original node. This is used internally for inheriting
            // things like plugin data and relaunch data
            this._orig = null;
        }
        BaseNodeMixinStub.prototype.setPluginData = function (key, value) {
            if (!this.pluginData) {
                this.pluginData = {};
            }
            if (value === "") {
                delete this.pluginData[key];
            }
            else {
                this.pluginData[key] = value;
            }
        };
        BaseNodeMixinStub.prototype.getPluginData = function (key) {
            if (config.simulateErrors && this.removed) {
                throw new Error("The node with id " + this.id + " does not exist");
            }
            // first, try to retrieve the key from local plugin data
            if (this.pluginData && this.pluginData[key]) {
                return this.pluginData[key];
            }
            // if we don't find the key in local plugin data, try and retrieve it from
            // the original node it was cloned from, if it exists if
            if (this._orig) {
                return this._orig.getPluginData(key);
            }
            // otherwise, return nothing
            return;
        };
        BaseNodeMixinStub.prototype.getPluginDataKeys = function () {
            if (config.simulateErrors && this.removed) {
                throw new Error("The node with id " + this.id + " does not exist");
            }
            // get all local and inherited keys
            var localKeys = this.pluginData ? Object.keys(this.pluginData) : [];
            var inheritedKeys = this._orig ? this._orig.getPluginDataKeys() : [];
            // combine them into one list and de-dupe any copies
            var combinedKeys = Array.from(new Set(localKeys.concat(inheritedKeys)));
            return combinedKeys;
        };
        BaseNodeMixinStub.prototype.setSharedPluginData = function (namespace, key, value) {
            if (!this.sharedPluginData) {
                this.sharedPluginData = {};
            }
            if (!this.sharedPluginData[namespace]) {
                this.sharedPluginData[namespace] = {};
            }
            if (value === "") {
                delete this.sharedPluginData[namespace][key];
                // if (Object.keys(this.sharedPluginData[namespace]).length === 0) {
                //   delete this.sharedPluginData[namespace];
                // }
            }
            else {
                this.sharedPluginData[namespace][key] = value;
            }
        };
        BaseNodeMixinStub.prototype.getSharedPluginData = function (namespace, key) {
            // first, try to retrieve the key from local plugin data
            if (this.sharedPluginData &&
                this.sharedPluginData[namespace] &&
                this.sharedPluginData[namespace][key]) {
                return this.sharedPluginData[namespace][key];
            }
            // if we don't find the key in local plugin data, try and retrieve it from
            // the original node it was cloned from, if it exists if
            if (this._orig) {
                return this._orig.getSharedPluginData(namespace, key);
            }
            // otherwise, return nothing
            return;
        };
        BaseNodeMixinStub.prototype.getSharedPluginDataKeys = function (namespace) {
            // get all local and inherited keys
            var localKeys = this.sharedPluginData && this.sharedPluginData[namespace]
                ? Object.keys(this.sharedPluginData[namespace])
                : [];
            var inheritedKeys = this._orig
                ? this._orig.getSharedPluginDataKeys(namespace)
                : [];
            // combine them into one list and de-dupe any copies
            var combinedKeys = Array.from(new Set(localKeys.concat(inheritedKeys)));
            return combinedKeys;
        };
        BaseNodeMixinStub.prototype.setRelaunchData = function (data) {
            this.relaunchData = data;
        };
        BaseNodeMixinStub.prototype.getRelaunchData = function () {
            return this.relaunchData || {};
        };
        BaseNodeMixinStub.prototype.remove = function () {
            var _this = this;
            this.removed = true;
            if (config.simulateErrors && exports.isInsideInstance(this)) {
                throw new Error("Error: can't remove item");
            }
            if (this.parent) {
                // @ts-ignore
                this.parent.children = this.parent.children.filter(function (child) { return child !== _this; });
            }
        };
        return BaseNodeMixinStub;
    }());
};
exports.getLayoutMixinStub = function (config) {
    return /** @class */ (function () {
        function LayoutMixinStub() {
        }
        LayoutMixinStub.prototype.rescale = function (scale) {
            if (config.simulateErrors && scale < 0.01) {
                throw new Error('Error: in rescale: Expected "scale" to have value >= 0.01');
            }
            this.width = this.width * scale;
            this.height = this.height * scale;
        };
        LayoutMixinStub.prototype.resize = function (width, height) {
            if (config.simulateErrors && exports.isInsideInstance(this)) {
                throw new Error("Error: can't change layout inside item");
            }
            if (config.simulateErrors && width < 0.01) {
                throw new Error('Error: in resize: Expected "width" to have value >= 0.01');
            }
            if (config.simulateErrors && height < 0.01) {
                throw new Error('Error: in resize: Expected "height" to have value >= 0.01');
            }
            this.width = width;
            this.height = height;
        };
        LayoutMixinStub.prototype.resizeWithoutConstraints = function (width, height) {
            this.width = width;
            this.height = height;
        };
        return LayoutMixinStub;
    }());
};
var ExportMixinStub = /** @class */ (function () {
    function ExportMixinStub() {
    }
    ExportMixinStub.prototype.exportAsync = function (settings) {
        // "exportAsync" is not implemented in stubs
        return Promise.resolve(new Uint8Array());
    };
    return ExportMixinStub;
}());
exports.ExportMixinStub = ExportMixinStub;
var GeometryMixinStub = /** @class */ (function () {
    function GeometryMixinStub() {
    }
    Object.defineProperty(GeometryMixinStub.prototype, "fills", {
        get: function () {
            return this._fills || [];
        },
        set: function (theFills) {
            this._fills = theFills;
        },
        enumerable: true,
        configurable: true
    });
    GeometryMixinStub.prototype.outlineStroke = function () {
        return null;
    };
    return GeometryMixinStub;
}());
exports.GeometryMixinStub = GeometryMixinStub;
//# sourceMappingURL=mixins.js.map

/***/ }),

/***/ "../../node_modules/figma-api-stub/dist/stubs.js":
/*!*******************************************************!*\
  !*** ../../node_modules/figma-api-stub/dist/stubs.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var nanoid_1 = __webpack_require__(/*! nanoid */ "../../node_modules/nanoid/index.browser.js");
var rxjs_1 = __webpack_require__(/*! rxjs */ "../../node_modules/rxjs/_esm5/index.js");
var operators_1 = __webpack_require__(/*! rxjs/operators */ "../../node_modules/rxjs/_esm5/operators/index.js");
var styleStubs_1 = __webpack_require__(/*! ./styleStubs */ "../../node_modules/figma-api-stub/dist/styleStubs.js");
var applyMixins_1 = __webpack_require__(/*! ./applyMixins */ "../../node_modules/figma-api-stub/dist/applyMixins.js");
var componentStubs_1 = __webpack_require__(/*! ./componentStubs */ "../../node_modules/figma-api-stub/dist/componentStubs.js");
var config_1 = __webpack_require__(/*! ./config */ "../../node_modules/figma-api-stub/dist/config.js");
var fonts_1 = __webpack_require__(/*! ./fonts */ "../../node_modules/figma-api-stub/dist/fonts.js");
var mixins_1 = __webpack_require__(/*! ./mixins */ "../../node_modules/figma-api-stub/dist/mixins.js");
exports.createFigma = function (paramConfig) {
    var config = __assign({}, config_1.defaultConfig, paramConfig);
    var BaseNodeMixinStub = mixins_1.getBaseNodeMixinStub(config);
    var LayoutMixinStub = mixins_1.getLayoutMixinStub(config);
    var ChildrenMixinStub = mixins_1.getChildrenMixinStub(config);
    // @ts-ignore
    __webpack_require__.g.__html__ = "main.html";
    // @ts-ignore
    __webpack_require__.g.__uiFiles__ = {};
    applyMixins_1.applyMixins(componentStubs_1.RectangleNodeStub, [
        BaseNodeMixinStub,
        LayoutMixinStub,
        mixins_1.ExportMixinStub,
        mixins_1.GeometryMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.TextNodeStub, [
        BaseNodeMixinStub,
        LayoutMixinStub,
        mixins_1.ExportMixinStub,
        mixins_1.GeometryMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.ShapeWithTextNodeStub, [
        BaseNodeMixinStub,
        LayoutMixinStub,
        mixins_1.ExportMixinStub,
        mixins_1.GeometryMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.StickyNodeStub, [
        BaseNodeMixinStub,
        LayoutMixinStub,
        mixins_1.ExportMixinStub,
        mixins_1.GeometryMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.ConnectorNodeStub, [
        BaseNodeMixinStub,
        LayoutMixinStub,
        mixins_1.ExportMixinStub,
        mixins_1.GeometryMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.DocumentNodeStub, [BaseNodeMixinStub, ChildrenMixinStub]);
    applyMixins_1.applyMixins(componentStubs_1.PageNodeStub, [
        BaseNodeMixinStub,
        ChildrenMixinStub,
        mixins_1.ExportMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.FrameNodeStub, [
        BaseNodeMixinStub,
        ChildrenMixinStub,
        LayoutMixinStub,
        mixins_1.ExportMixinStub,
        mixins_1.GeometryMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.GroupNodeStub, [
        BaseNodeMixinStub,
        ChildrenMixinStub,
        mixins_1.ExportMixinStub,
        LayoutMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.BooleanOperationNodeStub, [
        BaseNodeMixinStub,
        ChildrenMixinStub,
        mixins_1.ExportMixinStub,
        LayoutMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.ComponentNodeStub, [
        BaseNodeMixinStub,
        ChildrenMixinStub,
        mixins_1.ExportMixinStub,
        LayoutMixinStub,
        mixins_1.GeometryMixinStub
    ]);
    applyMixins_1.applyMixins(componentStubs_1.InstanceNodeStub, [
        BaseNodeMixinStub,
        mixins_1.ExportMixinStub,
        LayoutMixinStub,
        ChildrenMixinStub
    ]);
    var selectionChangeSubscribes = new Map();
    var currentPageChangeSubject = new rxjs_1.Subject();
    var currentPageChangeSubscribes = new Map();
    var majorId = 1;
    var minorId = 1;
    var allocateNodeId = function (node, shouldIncreaseMajor) {
        minorId += 1;
        if (!shouldIncreaseMajor) {
            node.id = majorId + ":" + minorId;
        }
        else {
            node.id = majorId + ":" + 1;
            majorId += 1;
        }
    };
    var allocateStyleId = function (style) {
        style.id = "S:" + nanoid_1.nanoid(40) + ",";
    };
    var getImageHash = function () {
        return nanoid_1.nanoid(40);
    };
    var UIAPIStub = /** @class */ (function () {
        function UIAPIStub() {
            var _this = this;
            this._listeners = new Set();
            this.on = function (type, cb) {
                if (type === "message" && cb) {
                    _this._listeners.add(cb);
                }
            };
            this.off = function (type, cb) {
                if (type === "message" && cb) {
                    _this._listeners.delete(cb);
                }
            };
            this.once = function (type, cb) {
                if (type === "message" && cb) {
                    var wrappedCb_1 = function (pluginMessage, props) {
                        cb(pluginMessage, props);
                        _this.off("message", wrappedCb_1);
                    };
                    _this.on("message", wrappedCb_1);
                }
            };
        }
        UIAPIStub.prototype.postMessage = function (pluginMessage, options) {
            var message = {
                data: { pluginMessage: pluginMessage, pluginId: "000000000000000000" },
                type: "message"
            };
            // @ts-ignore
            if (__webpack_require__.g && __webpack_require__.g.onmessage) {
                if (config.isWithoutTimeout) {
                    // @ts-ignore
                    __webpack_require__.g.onmessage(message);
                }
                else {
                    setTimeout(function () {
                        // @ts-ignore
                        __webpack_require__.g.onmessage(message);
                    }, 0);
                }
            }
        };
        return UIAPIStub;
    }());
    // --- styles
    var PaintStyleStub = styleStubs_1.getPaintStyleStub(config);
    var EffectStyleStub = styleStubs_1.getEffectStyleStub(config);
    var TextStyleStub = styleStubs_1.getTextStyleStub(config);
    var GridStyleStub = styleStubs_1.getGridStyleStub(config);
    var styleBasics = {
        styles: new Map(),
        paintStyles: [],
        effectStyles: [],
        textStyles: [],
        gridStyles: []
    };
    // @ts-ignore
    var PluginApiStub = /** @class */ (function () {
        function PluginApiStub() {
            this.skipInvisibleInstanceChildren = false;
            // @ts-ignore
            this.root = new componentStubs_1.DocumentNodeStub();
            // @ts-ignore
            this.root.id = "0:0";
            // @ts-ignore
            this._currentPage = new componentStubs_1.PageNodeStub();
            // @ts-ignore
            this._currentPage.id = "0:1";
            this.root.appendChild(this._currentPage);
            // @ts-ignore
            this.ui = new UIAPIStub();
        }
        Object.defineProperty(PluginApiStub.prototype, "currentPage", {
            get: function () {
                return this._currentPage;
            },
            set: function (value) {
                this._currentPage = value;
                currentPageChangeSubject.next();
            },
            enumerable: true,
            configurable: true
        });
        // @ts-ignore
        PluginApiStub.prototype.createPage = function () {
            var result = new componentStubs_1.PageNodeStub(config);
            allocateNodeId(result, true);
            this.root.appendChild(result);
            return result;
        };
        // @ts-ignore
        PluginApiStub.prototype.createFrame = function () {
            var result = new componentStubs_1.FrameNodeStub(config);
            allocateNodeId(result);
            this.currentPage.appendChild(result);
            return result;
        };
        // @ts-ignore
        PluginApiStub.prototype.createShapeWithText = function () {
            var result = new componentStubs_1.ShapeWithTextNodeStub(config);
            allocateNodeId(result);
            this.root.appendChild(result);
            return result;
        };
        // @ts-ignore
        PluginApiStub.prototype.createSticky = function () {
            var result = new componentStubs_1.StickyNodeStub(config);
            allocateNodeId(result);
            this.root.appendChild(result);
            return result;
        };
        // @ts-ignore
        PluginApiStub.prototype.createComponent = function () {
            var result = new componentStubs_1.ComponentNodeStub(config);
            allocateNodeId(result);
            this.currentPage.appendChild(result);
            return result;
        };
        // @ts-ignore
        PluginApiStub.prototype.createRectangle = function () {
            var result = new componentStubs_1.RectangleNodeStub(config);
            allocateNodeId(result);
            this.currentPage.appendChild(result);
            return result;
        };
        // @ts-ignore
        PluginApiStub.prototype.createText = function () {
            var result = new componentStubs_1.TextNodeStub(config);
            allocateNodeId(result);
            this.currentPage.appendChild(result);
            return result;
        };
        PluginApiStub.prototype.createConnector = function () {
            var result = new componentStubs_1.ConnectorNodeStub(config);
            allocateNodeId(result);
            this.currentPage.appendChild(result);
            return result;
        };
        PluginApiStub.prototype.getStyleById = function (id) {
            if (styleBasics.styles.has(id)) {
                return styleBasics.styles.get(id);
            }
            return null;
        };
        PluginApiStub.prototype.getLocalPaintStyles = function () {
            return styleBasics.paintStyles;
        };
        PluginApiStub.prototype.getLocalEffectStyles = function () {
            return styleBasics.effectStyles;
        };
        PluginApiStub.prototype.getLocalTextStyles = function () {
            return styleBasics.textStyles;
        };
        PluginApiStub.prototype.getLocalGridStyles = function () {
            return styleBasics.gridStyles;
        };
        // @ts-ignore
        PluginApiStub.prototype.createPaintStyle = function () {
            var style = new PaintStyleStub(styleBasics);
            allocateStyleId(style);
            styleBasics.styles.set(style.id, style);
            styleBasics.paintStyles.push(style);
            return style;
        };
        // @ts-ignore
        PluginApiStub.prototype.createEffectStyle = function () {
            var style = new EffectStyleStub(styleBasics);
            allocateStyleId(style);
            styleBasics.styles.set(style.id, style);
            styleBasics.effectStyles.push(style);
            return style;
        };
        // @ts-ignore
        PluginApiStub.prototype.createTextStyle = function () {
            var style = new TextStyleStub(styleBasics);
            allocateStyleId(style);
            styleBasics.styles.set(style.id, style);
            styleBasics.textStyles.push(style);
            return style;
        };
        // @ts-ignore
        PluginApiStub.prototype.createGridStyle = function () {
            var style = new GridStyleStub(styleBasics);
            allocateStyleId(style);
            styleBasics.styles.set(style.id, style);
            styleBasics.gridStyles.push(style);
            return style;
        };
        PluginApiStub.prototype.createImage = function (bytes) {
            var hash = getImageHash();
            return {
                hash: hash,
                getBytesAsync: function () { return Promise.resolve(bytes); }
            };
        };
        PluginApiStub.prototype.union = function (nodes, parent, index) {
            var booleanOperation = this.booleanOperate(nodes, parent, index);
            booleanOperation.booleanOperation = "UNION";
            return booleanOperation;
        };
        PluginApiStub.prototype.intersect = function (nodes, parent, index) {
            var booleanOperation = this.booleanOperate(nodes, parent, index);
            booleanOperation.booleanOperation = "INTERSECT";
            return booleanOperation;
        };
        PluginApiStub.prototype.subtract = function (nodes, parent, index) {
            var booleanOperation = this.booleanOperate(nodes, parent, index);
            booleanOperation.booleanOperation = "SUBTRACT";
            return booleanOperation;
        };
        PluginApiStub.prototype.exlude = function (nodes, parent, index) {
            var booleanOperation = this.booleanOperate(nodes, parent, index);
            booleanOperation.booleanOperation = "EXCLUDE";
            return booleanOperation;
        };
        PluginApiStub.prototype.booleanOperate = function (nodes, parent, index) {
            if (config.simulateErrors && (!nodes || nodes.length === 0)) {
                throw new Error("Error: First argument must be an array of at least one node");
            }
            var booleanOperation = new componentStubs_1.BooleanOperationNodeStub(config);
            allocateNodeId(booleanOperation);
            nodes.forEach(function (node) { return booleanOperation.appendChild(node); });
            if (index) {
                parent.insertChild(index, booleanOperation);
            }
            else {
                parent.appendChild(booleanOperation);
            }
            booleanOperation.parent = parent;
            return booleanOperation;
        };
        // @ts-ignore
        PluginApiStub.prototype.group = function (nodes, parent, index) {
            if (config.simulateErrors && (!nodes || nodes.length === 0)) {
                throw new Error("Error: First argument must be an array of at least one node");
            }
            var group = new componentStubs_1.GroupNodeStub(config);
            allocateNodeId(group);
            nodes.forEach(function (node) { return group.appendChild(node); });
            if (index) {
                parent.insertChild(index, group);
            }
            else {
                parent.appendChild(group);
            }
            group.parent = parent;
            return group;
        };
        // @ts-ignore
        PluginApiStub.prototype.loadFontAsync = function (fontName) {
            if (fonts_1.Fonts.isFontLoaded(fontName)) {
                return;
            }
            return new Promise(function (resolve) {
                fonts_1.Fonts.loadedFonts.push(fontName);
                resolve();
            });
        };
        PluginApiStub.prototype.listAvailableFontsAsync = function () {
            return Promise.resolve(fonts_1.Inter.concat(fonts_1.Roboto, fonts_1.Helvetica));
        };
        PluginApiStub.prototype.on = function (type, callback) {
            if (type === "selectionchange") {
                selectionChangeSubscribes.set(callback, componentStubs_1.selectionChangeSubject.subscribe(callback));
            }
            if (type === "currentpagechange") {
                currentPageChangeSubscribes.set(callback, currentPageChangeSubject.subscribe(callback));
            }
        };
        PluginApiStub.prototype.once = function (type, callback) {
            if (type === "selectionchange") {
                selectionChangeSubscribes.set(callback, componentStubs_1.selectionChangeSubject.pipe(operators_1.take(1)).subscribe(callback));
            }
            if (type === "currentpagechange") {
                currentPageChangeSubscribes.set(callback, currentPageChangeSubject.pipe(operators_1.take(1)).subscribe(callback));
            }
        };
        PluginApiStub.prototype.off = function (type, callback) {
            if (type === "selectionchange") {
                selectionChangeSubscribes.get(callback).unsubscribe();
            }
            if (type === "currentpagechange") {
                currentPageChangeSubscribes.get(callback).unsubscribe();
            }
        };
        PluginApiStub.prototype.getNodeById = function (id) {
            var _genNodeById = function (nodes, id) {
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var node = nodes_1[_i];
                    if (node.id === id) {
                        return node;
                    }
                    var childMatch = node.children && _genNodeById(node.children, id);
                    if (childMatch) {
                        return childMatch;
                    }
                }
            };
            return _genNodeById([figma.root], id) || null;
        };
        PluginApiStub.prototype.notify = function () {
            return { cancel: function () { } };
        };
        PluginApiStub.prototype.showUI = function () { };
        return PluginApiStub;
    }());
    // @ts-ignore
    return new PluginApiStub();
};
exports.createParentPostMessage = function (figma, isWithoutTimeout) { return function (message, target) {
    if (figma.ui.onmessage) {
        var call = function () {
            // @ts-ignore
            figma.ui.onmessage(message.pluginMessage, { origin: null });
        };
        if (isWithoutTimeout) {
            call();
        }
        else {
            setTimeout(call, 0);
        }
    }
    else {
        var call = function () {
            // @ts-ignore
            figma.ui._listeners.forEach(function (cb) {
                cb(message.pluginMessage, { origin: null });
            });
        };
        if (isWithoutTimeout) {
            call();
        }
        else {
            setTimeout(call, 0);
        }
    }
}; };
//# sourceMappingURL=stubs.js.map

/***/ }),

/***/ "../../node_modules/figma-api-stub/dist/styleStubs.js":
/*!************************************************************!*\
  !*** ../../node_modules/figma-api-stub/dist/styleStubs.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getBaseStyleStub = function (config) {
    return /** @class */ (function () {
        function BaseStyleStub(styleBasics) {
            this.styleBasics = styleBasics;
            this.remote = false;
        }
        BaseStyleStub.prototype.setPluginData = function (key, value) {
            if (!this.pluginData) {
                this.pluginData = {};
            }
            this.pluginData[key] = value;
        };
        BaseStyleStub.prototype.getPluginData = function (key) {
            if (config.simulateErrors && this.removed) {
                throw new Error("The style with id " + this.id + " does not exist");
            }
            if (!this.pluginData) {
                return;
            }
            return this.pluginData[key];
        };
        BaseStyleStub.prototype.getPluginDataKeys = function () {
            if (config.simulateErrors && this.removed) {
                throw new Error("The style with id " + this.id + " does not exist");
            }
            if (!this.pluginData) {
                return [];
            }
            return Object.keys(this.pluginData);
        };
        BaseStyleStub.prototype.setSharedPluginData = function (namespace, key, value) {
            if (!this.sharedPluginData) {
                this.sharedPluginData = {};
            }
            if (!this.sharedPluginData[namespace]) {
                this.sharedPluginData[namespace] = {};
            }
            this.sharedPluginData[namespace][key] = value;
        };
        BaseStyleStub.prototype.getSharedPluginData = function (namespace, key) {
            if (!this.sharedPluginData || !this.sharedPluginData[namespace]) {
                return;
            }
            return this.sharedPluginData[namespace][key];
        };
        BaseStyleStub.prototype.getSharedPluginDataKeys = function (namespace) {
            if (!this.sharedPluginData || !this.sharedPluginData[namespace]) {
                return;
            }
            return Object.keys(this.sharedPluginData[namespace]);
        };
        BaseStyleStub.prototype.remove = function () {
            this.removed = true;
            this.styleBasics.styles.delete(this.id);
        };
        BaseStyleStub.prototype.getPublishStatusAsync = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, "UNPUBLISHED"];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        return BaseStyleStub;
    }());
};
exports.getPaintStyleStub = function (config) {
    var BaseStyleStub = exports.getBaseStyleStub(config);
    return /** @class */ (function (_super) {
        __extends(PaintStyleStub, _super);
        function PaintStyleStub(styleBasics) {
            var _this = _super.call(this, styleBasics) || this;
            // @ts-ignore
            _this.type = "PAINT";
            return _this;
        }
        PaintStyleStub.prototype.remove = function () {
            _super.prototype.remove.call(this);
            this.styleBasics.paintStyles.splice(this.styleBasics.paintStyles.indexOf(this), 1);
        };
        return PaintStyleStub;
    }(BaseStyleStub));
};
exports.getEffectStyleStub = function (config) {
    var BaseStyleStub = exports.getBaseStyleStub(config);
    return /** @class */ (function (_super) {
        __extends(EffectStyleStub, _super);
        function EffectStyleStub(styleBasics) {
            var _this = _super.call(this, styleBasics) || this;
            // @ts-ignore
            _this.type = "EFFECT";
            return _this;
        }
        EffectStyleStub.prototype.remove = function () {
            _super.prototype.remove.call(this);
            this.styleBasics.effectStyles.splice(this.styleBasics.effectStyles.indexOf(this), 1);
        };
        return EffectStyleStub;
    }(BaseStyleStub));
};
exports.getTextStyleStub = function (config) {
    var BaseStyleStub = exports.getBaseStyleStub(config);
    return /** @class */ (function (_super) {
        __extends(TextStyleStub, _super);
        function TextStyleStub(styleBasics) {
            var _this = _super.call(this, styleBasics) || this;
            // @ts-ignore
            _this.type = "TEXT";
            return _this;
        }
        TextStyleStub.prototype.remove = function () {
            _super.prototype.remove.call(this);
            this.styleBasics.textStyles.splice(this.styleBasics.textStyles.indexOf(this), 1);
        };
        return TextStyleStub;
    }(BaseStyleStub));
};
exports.getGridStyleStub = function (config) {
    var BaseStyleStub = exports.getBaseStyleStub(config);
    return /** @class */ (function (_super) {
        __extends(GridStyleStub, _super);
        function GridStyleStub(styleBasics) {
            var _this = _super.call(this, styleBasics) || this;
            // @ts-ignore
            _this.type = "GRID";
            return _this;
        }
        GridStyleStub.prototype.remove = function () {
            _super.prototype.remove.call(this);
            this.styleBasics.gridStyles.splice(this.styleBasics.gridStyles.indexOf(this), 1);
        };
        return GridStyleStub;
    }(BaseStyleStub));
};
//# sourceMappingURL=styleStubs.js.map

/***/ }),

/***/ "../../node_modules/rxjs/_esm5/index.js":
/*!**********************************************!*\
  !*** ../../node_modules/rxjs/_esm5/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ArgumentOutOfRangeError: () => (/* reexport safe */ _internal_util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_21__.ArgumentOutOfRangeError),
/* harmony export */   AsyncSubject: () => (/* reexport safe */ _internal_AsyncSubject__WEBPACK_IMPORTED_MODULE_7__.AsyncSubject),
/* harmony export */   BehaviorSubject: () => (/* reexport safe */ _internal_BehaviorSubject__WEBPACK_IMPORTED_MODULE_5__.BehaviorSubject),
/* harmony export */   ConnectableObservable: () => (/* reexport safe */ _internal_observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_1__.ConnectableObservable),
/* harmony export */   EMPTY: () => (/* reexport safe */ _internal_observable_empty__WEBPACK_IMPORTED_MODULE_31__.EMPTY),
/* harmony export */   EmptyError: () => (/* reexport safe */ _internal_util_EmptyError__WEBPACK_IMPORTED_MODULE_22__.EmptyError),
/* harmony export */   GroupedObservable: () => (/* reexport safe */ _internal_operators_groupBy__WEBPACK_IMPORTED_MODULE_2__.GroupedObservable),
/* harmony export */   NEVER: () => (/* reexport safe */ _internal_observable_never__WEBPACK_IMPORTED_MODULE_40__.NEVER),
/* harmony export */   Notification: () => (/* reexport safe */ _internal_Notification__WEBPACK_IMPORTED_MODULE_16__.Notification),
/* harmony export */   NotificationKind: () => (/* reexport safe */ _internal_Notification__WEBPACK_IMPORTED_MODULE_16__.NotificationKind),
/* harmony export */   ObjectUnsubscribedError: () => (/* reexport safe */ _internal_util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_23__.ObjectUnsubscribedError),
/* harmony export */   Observable: () => (/* reexport safe */ _internal_Observable__WEBPACK_IMPORTED_MODULE_0__.Observable),
/* harmony export */   ReplaySubject: () => (/* reexport safe */ _internal_ReplaySubject__WEBPACK_IMPORTED_MODULE_6__.ReplaySubject),
/* harmony export */   Scheduler: () => (/* reexport safe */ _internal_Scheduler__WEBPACK_IMPORTED_MODULE_13__.Scheduler),
/* harmony export */   Subject: () => (/* reexport safe */ _internal_Subject__WEBPACK_IMPORTED_MODULE_4__.Subject),
/* harmony export */   Subscriber: () => (/* reexport safe */ _internal_Subscriber__WEBPACK_IMPORTED_MODULE_15__.Subscriber),
/* harmony export */   Subscription: () => (/* reexport safe */ _internal_Subscription__WEBPACK_IMPORTED_MODULE_14__.Subscription),
/* harmony export */   TimeoutError: () => (/* reexport safe */ _internal_util_TimeoutError__WEBPACK_IMPORTED_MODULE_25__.TimeoutError),
/* harmony export */   UnsubscriptionError: () => (/* reexport safe */ _internal_util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_24__.UnsubscriptionError),
/* harmony export */   VirtualAction: () => (/* reexport safe */ _internal_scheduler_VirtualTimeScheduler__WEBPACK_IMPORTED_MODULE_12__.VirtualAction),
/* harmony export */   VirtualTimeScheduler: () => (/* reexport safe */ _internal_scheduler_VirtualTimeScheduler__WEBPACK_IMPORTED_MODULE_12__.VirtualTimeScheduler),
/* harmony export */   animationFrame: () => (/* reexport safe */ _internal_scheduler_animationFrame__WEBPACK_IMPORTED_MODULE_11__.animationFrame),
/* harmony export */   animationFrameScheduler: () => (/* reexport safe */ _internal_scheduler_animationFrame__WEBPACK_IMPORTED_MODULE_11__.animationFrameScheduler),
/* harmony export */   asap: () => (/* reexport safe */ _internal_scheduler_asap__WEBPACK_IMPORTED_MODULE_8__.asap),
/* harmony export */   asapScheduler: () => (/* reexport safe */ _internal_scheduler_asap__WEBPACK_IMPORTED_MODULE_8__.asapScheduler),
/* harmony export */   async: () => (/* reexport safe */ _internal_scheduler_async__WEBPACK_IMPORTED_MODULE_9__.async),
/* harmony export */   asyncScheduler: () => (/* reexport safe */ _internal_scheduler_async__WEBPACK_IMPORTED_MODULE_9__.asyncScheduler),
/* harmony export */   bindCallback: () => (/* reexport safe */ _internal_observable_bindCallback__WEBPACK_IMPORTED_MODULE_26__.bindCallback),
/* harmony export */   bindNodeCallback: () => (/* reexport safe */ _internal_observable_bindNodeCallback__WEBPACK_IMPORTED_MODULE_27__.bindNodeCallback),
/* harmony export */   combineLatest: () => (/* reexport safe */ _internal_observable_combineLatest__WEBPACK_IMPORTED_MODULE_28__.combineLatest),
/* harmony export */   concat: () => (/* reexport safe */ _internal_observable_concat__WEBPACK_IMPORTED_MODULE_29__.concat),
/* harmony export */   config: () => (/* reexport safe */ _internal_config__WEBPACK_IMPORTED_MODULE_52__.config),
/* harmony export */   defer: () => (/* reexport safe */ _internal_observable_defer__WEBPACK_IMPORTED_MODULE_30__.defer),
/* harmony export */   empty: () => (/* reexport safe */ _internal_observable_empty__WEBPACK_IMPORTED_MODULE_31__.empty),
/* harmony export */   forkJoin: () => (/* reexport safe */ _internal_observable_forkJoin__WEBPACK_IMPORTED_MODULE_32__.forkJoin),
/* harmony export */   from: () => (/* reexport safe */ _internal_observable_from__WEBPACK_IMPORTED_MODULE_33__.from),
/* harmony export */   fromEvent: () => (/* reexport safe */ _internal_observable_fromEvent__WEBPACK_IMPORTED_MODULE_34__.fromEvent),
/* harmony export */   fromEventPattern: () => (/* reexport safe */ _internal_observable_fromEventPattern__WEBPACK_IMPORTED_MODULE_35__.fromEventPattern),
/* harmony export */   generate: () => (/* reexport safe */ _internal_observable_generate__WEBPACK_IMPORTED_MODULE_36__.generate),
/* harmony export */   identity: () => (/* reexport safe */ _internal_util_identity__WEBPACK_IMPORTED_MODULE_19__.identity),
/* harmony export */   iif: () => (/* reexport safe */ _internal_observable_iif__WEBPACK_IMPORTED_MODULE_37__.iif),
/* harmony export */   interval: () => (/* reexport safe */ _internal_observable_interval__WEBPACK_IMPORTED_MODULE_38__.interval),
/* harmony export */   isObservable: () => (/* reexport safe */ _internal_util_isObservable__WEBPACK_IMPORTED_MODULE_20__.isObservable),
/* harmony export */   merge: () => (/* reexport safe */ _internal_observable_merge__WEBPACK_IMPORTED_MODULE_39__.merge),
/* harmony export */   never: () => (/* reexport safe */ _internal_observable_never__WEBPACK_IMPORTED_MODULE_40__.never),
/* harmony export */   noop: () => (/* reexport safe */ _internal_util_noop__WEBPACK_IMPORTED_MODULE_18__.noop),
/* harmony export */   observable: () => (/* reexport safe */ _internal_symbol_observable__WEBPACK_IMPORTED_MODULE_3__.observable),
/* harmony export */   of: () => (/* reexport safe */ _internal_observable_of__WEBPACK_IMPORTED_MODULE_41__.of),
/* harmony export */   onErrorResumeNext: () => (/* reexport safe */ _internal_observable_onErrorResumeNext__WEBPACK_IMPORTED_MODULE_42__.onErrorResumeNext),
/* harmony export */   pairs: () => (/* reexport safe */ _internal_observable_pairs__WEBPACK_IMPORTED_MODULE_43__.pairs),
/* harmony export */   partition: () => (/* reexport safe */ _internal_observable_partition__WEBPACK_IMPORTED_MODULE_44__.partition),
/* harmony export */   pipe: () => (/* reexport safe */ _internal_util_pipe__WEBPACK_IMPORTED_MODULE_17__.pipe),
/* harmony export */   queue: () => (/* reexport safe */ _internal_scheduler_queue__WEBPACK_IMPORTED_MODULE_10__.queue),
/* harmony export */   queueScheduler: () => (/* reexport safe */ _internal_scheduler_queue__WEBPACK_IMPORTED_MODULE_10__.queueScheduler),
/* harmony export */   race: () => (/* reexport safe */ _internal_observable_race__WEBPACK_IMPORTED_MODULE_45__.race),
/* harmony export */   range: () => (/* reexport safe */ _internal_observable_range__WEBPACK_IMPORTED_MODULE_46__.range),
/* harmony export */   scheduled: () => (/* reexport safe */ _internal_scheduled_scheduled__WEBPACK_IMPORTED_MODULE_51__.scheduled),
/* harmony export */   throwError: () => (/* reexport safe */ _internal_observable_throwError__WEBPACK_IMPORTED_MODULE_47__.throwError),
/* harmony export */   timer: () => (/* reexport safe */ _internal_observable_timer__WEBPACK_IMPORTED_MODULE_48__.timer),
/* harmony export */   using: () => (/* reexport safe */ _internal_observable_using__WEBPACK_IMPORTED_MODULE_49__.using),
/* harmony export */   zip: () => (/* reexport safe */ _internal_observable_zip__WEBPACK_IMPORTED_MODULE_50__.zip)
/* harmony export */ });
/* harmony import */ var _internal_Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./internal/Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _internal_observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./internal/observable/ConnectableObservable */ "../../node_modules/rxjs/_esm5/internal/observable/ConnectableObservable.js");
/* harmony import */ var _internal_operators_groupBy__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./internal/operators/groupBy */ "../../node_modules/rxjs/_esm5/internal/operators/groupBy.js");
/* harmony import */ var _internal_symbol_observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./internal/symbol/observable */ "../../node_modules/rxjs/_esm5/internal/symbol/observable.js");
/* harmony import */ var _internal_Subject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./internal/Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _internal_BehaviorSubject__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./internal/BehaviorSubject */ "../../node_modules/rxjs/_esm5/internal/BehaviorSubject.js");
/* harmony import */ var _internal_ReplaySubject__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./internal/ReplaySubject */ "../../node_modules/rxjs/_esm5/internal/ReplaySubject.js");
/* harmony import */ var _internal_AsyncSubject__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./internal/AsyncSubject */ "../../node_modules/rxjs/_esm5/internal/AsyncSubject.js");
/* harmony import */ var _internal_scheduler_asap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./internal/scheduler/asap */ "../../node_modules/rxjs/_esm5/internal/scheduler/asap.js");
/* harmony import */ var _internal_scheduler_async__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./internal/scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _internal_scheduler_queue__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./internal/scheduler/queue */ "../../node_modules/rxjs/_esm5/internal/scheduler/queue.js");
/* harmony import */ var _internal_scheduler_animationFrame__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./internal/scheduler/animationFrame */ "../../node_modules/rxjs/_esm5/internal/scheduler/animationFrame.js");
/* harmony import */ var _internal_scheduler_VirtualTimeScheduler__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./internal/scheduler/VirtualTimeScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/VirtualTimeScheduler.js");
/* harmony import */ var _internal_Scheduler__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./internal/Scheduler */ "../../node_modules/rxjs/_esm5/internal/Scheduler.js");
/* harmony import */ var _internal_Subscription__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./internal/Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _internal_Subscriber__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./internal/Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _internal_Notification__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./internal/Notification */ "../../node_modules/rxjs/_esm5/internal/Notification.js");
/* harmony import */ var _internal_util_pipe__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./internal/util/pipe */ "../../node_modules/rxjs/_esm5/internal/util/pipe.js");
/* harmony import */ var _internal_util_noop__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./internal/util/noop */ "../../node_modules/rxjs/_esm5/internal/util/noop.js");
/* harmony import */ var _internal_util_identity__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./internal/util/identity */ "../../node_modules/rxjs/_esm5/internal/util/identity.js");
/* harmony import */ var _internal_util_isObservable__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./internal/util/isObservable */ "../../node_modules/rxjs/_esm5/internal/util/isObservable.js");
/* harmony import */ var _internal_util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./internal/util/ArgumentOutOfRangeError */ "../../node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js");
/* harmony import */ var _internal_util_EmptyError__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./internal/util/EmptyError */ "../../node_modules/rxjs/_esm5/internal/util/EmptyError.js");
/* harmony import */ var _internal_util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./internal/util/ObjectUnsubscribedError */ "../../node_modules/rxjs/_esm5/internal/util/ObjectUnsubscribedError.js");
/* harmony import */ var _internal_util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./internal/util/UnsubscriptionError */ "../../node_modules/rxjs/_esm5/internal/util/UnsubscriptionError.js");
/* harmony import */ var _internal_util_TimeoutError__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./internal/util/TimeoutError */ "../../node_modules/rxjs/_esm5/internal/util/TimeoutError.js");
/* harmony import */ var _internal_observable_bindCallback__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./internal/observable/bindCallback */ "../../node_modules/rxjs/_esm5/internal/observable/bindCallback.js");
/* harmony import */ var _internal_observable_bindNodeCallback__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./internal/observable/bindNodeCallback */ "../../node_modules/rxjs/_esm5/internal/observable/bindNodeCallback.js");
/* harmony import */ var _internal_observable_combineLatest__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./internal/observable/combineLatest */ "../../node_modules/rxjs/_esm5/internal/observable/combineLatest.js");
/* harmony import */ var _internal_observable_concat__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./internal/observable/concat */ "../../node_modules/rxjs/_esm5/internal/observable/concat.js");
/* harmony import */ var _internal_observable_defer__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./internal/observable/defer */ "../../node_modules/rxjs/_esm5/internal/observable/defer.js");
/* harmony import */ var _internal_observable_empty__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./internal/observable/empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/* harmony import */ var _internal_observable_forkJoin__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./internal/observable/forkJoin */ "../../node_modules/rxjs/_esm5/internal/observable/forkJoin.js");
/* harmony import */ var _internal_observable_from__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./internal/observable/from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/* harmony import */ var _internal_observable_fromEvent__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./internal/observable/fromEvent */ "../../node_modules/rxjs/_esm5/internal/observable/fromEvent.js");
/* harmony import */ var _internal_observable_fromEventPattern__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./internal/observable/fromEventPattern */ "../../node_modules/rxjs/_esm5/internal/observable/fromEventPattern.js");
/* harmony import */ var _internal_observable_generate__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./internal/observable/generate */ "../../node_modules/rxjs/_esm5/internal/observable/generate.js");
/* harmony import */ var _internal_observable_iif__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./internal/observable/iif */ "../../node_modules/rxjs/_esm5/internal/observable/iif.js");
/* harmony import */ var _internal_observable_interval__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./internal/observable/interval */ "../../node_modules/rxjs/_esm5/internal/observable/interval.js");
/* harmony import */ var _internal_observable_merge__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./internal/observable/merge */ "../../node_modules/rxjs/_esm5/internal/observable/merge.js");
/* harmony import */ var _internal_observable_never__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./internal/observable/never */ "../../node_modules/rxjs/_esm5/internal/observable/never.js");
/* harmony import */ var _internal_observable_of__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./internal/observable/of */ "../../node_modules/rxjs/_esm5/internal/observable/of.js");
/* harmony import */ var _internal_observable_onErrorResumeNext__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./internal/observable/onErrorResumeNext */ "../../node_modules/rxjs/_esm5/internal/observable/onErrorResumeNext.js");
/* harmony import */ var _internal_observable_pairs__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./internal/observable/pairs */ "../../node_modules/rxjs/_esm5/internal/observable/pairs.js");
/* harmony import */ var _internal_observable_partition__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./internal/observable/partition */ "../../node_modules/rxjs/_esm5/internal/observable/partition.js");
/* harmony import */ var _internal_observable_race__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./internal/observable/race */ "../../node_modules/rxjs/_esm5/internal/observable/race.js");
/* harmony import */ var _internal_observable_range__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./internal/observable/range */ "../../node_modules/rxjs/_esm5/internal/observable/range.js");
/* harmony import */ var _internal_observable_throwError__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./internal/observable/throwError */ "../../node_modules/rxjs/_esm5/internal/observable/throwError.js");
/* harmony import */ var _internal_observable_timer__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./internal/observable/timer */ "../../node_modules/rxjs/_esm5/internal/observable/timer.js");
/* harmony import */ var _internal_observable_using__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./internal/observable/using */ "../../node_modules/rxjs/_esm5/internal/observable/using.js");
/* harmony import */ var _internal_observable_zip__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./internal/observable/zip */ "../../node_modules/rxjs/_esm5/internal/observable/zip.js");
/* harmony import */ var _internal_scheduled_scheduled__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ./internal/scheduled/scheduled */ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduled.js");
/* harmony import */ var _internal_config__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! ./internal/config */ "../../node_modules/rxjs/_esm5/internal/config.js");
/** PURE_IMPORTS_START  PURE_IMPORTS_END */























































//# sourceMappingURL=index.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/AsyncSubject.js":
/*!**************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/AsyncSubject.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsyncSubject: () => (/* binding */ AsyncSubject)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/** PURE_IMPORTS_START tslib,_Subject,_Subscription PURE_IMPORTS_END */



var AsyncSubject = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AsyncSubject, _super);
    function AsyncSubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.value = null;
        _this.hasNext = false;
        _this.hasCompleted = false;
        return _this;
    }
    AsyncSubject.prototype._subscribe = function (subscriber) {
        if (this.hasError) {
            subscriber.error(this.thrownError);
            return _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription.EMPTY;
        }
        else if (this.hasCompleted && this.hasNext) {
            subscriber.next(this.value);
            subscriber.complete();
            return _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription.EMPTY;
        }
        return _super.prototype._subscribe.call(this, subscriber);
    };
    AsyncSubject.prototype.next = function (value) {
        if (!this.hasCompleted) {
            this.value = value;
            this.hasNext = true;
        }
    };
    AsyncSubject.prototype.error = function (error) {
        if (!this.hasCompleted) {
            _super.prototype.error.call(this, error);
        }
    };
    AsyncSubject.prototype.complete = function () {
        this.hasCompleted = true;
        if (this.hasNext) {
            _super.prototype.next.call(this, this.value);
        }
        _super.prototype.complete.call(this);
    };
    return AsyncSubject;
}(_Subject__WEBPACK_IMPORTED_MODULE_2__.Subject));

//# sourceMappingURL=AsyncSubject.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/BehaviorSubject.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/BehaviorSubject.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BehaviorSubject: () => (/* binding */ BehaviorSubject)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/ObjectUnsubscribedError */ "../../node_modules/rxjs/_esm5/internal/util/ObjectUnsubscribedError.js");
/** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */



var BehaviorSubject = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: true,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        if (subscription && !subscription.closed) {
            subscriber.next(this._value);
        }
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        if (this.hasError) {
            throw this.thrownError;
        }
        else if (this.closed) {
            throw new _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_1__.ObjectUnsubscribedError();
        }
        else {
            return this._value;
        }
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, this._value = value);
    };
    return BehaviorSubject;
}(_Subject__WEBPACK_IMPORTED_MODULE_2__.Subject));

//# sourceMappingURL=BehaviorSubject.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/InnerSubscriber.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/InnerSubscriber.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InnerSubscriber: () => (/* binding */ InnerSubscriber)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


var InnerSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(InnerSubscriber, _super);
    function InnerSubscriber(parent, outerValue, outerIndex) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.outerValue = outerValue;
        _this.outerIndex = outerIndex;
        _this.index = 0;
        return _this;
    }
    InnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
    };
    InnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error, this);
        this.unsubscribe();
    };
    InnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
        this.unsubscribe();
    };
    return InnerSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

//# sourceMappingURL=InnerSubscriber.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/Notification.js":
/*!**************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/Notification.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Notification: () => (/* binding */ Notification),
/* harmony export */   NotificationKind: () => (/* binding */ NotificationKind)
/* harmony export */ });
/* harmony import */ var _observable_empty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./observable/empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/* harmony import */ var _observable_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./observable/of */ "../../node_modules/rxjs/_esm5/internal/observable/of.js");
/* harmony import */ var _observable_throwError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./observable/throwError */ "../../node_modules/rxjs/_esm5/internal/observable/throwError.js");
/** PURE_IMPORTS_START _observable_empty,_observable_of,_observable_throwError PURE_IMPORTS_END */



var NotificationKind;
/*@__PURE__*/ (function (NotificationKind) {
    NotificationKind["NEXT"] = "N";
    NotificationKind["ERROR"] = "E";
    NotificationKind["COMPLETE"] = "C";
})(NotificationKind || (NotificationKind = {}));
var Notification = /*@__PURE__*/ (function () {
    function Notification(kind, value, error) {
        this.kind = kind;
        this.value = value;
        this.error = error;
        this.hasValue = kind === 'N';
    }
    Notification.prototype.observe = function (observer) {
        switch (this.kind) {
            case 'N':
                return observer.next && observer.next(this.value);
            case 'E':
                return observer.error && observer.error(this.error);
            case 'C':
                return observer.complete && observer.complete();
        }
    };
    Notification.prototype.do = function (next, error, complete) {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return next && next(this.value);
            case 'E':
                return error && error(this.error);
            case 'C':
                return complete && complete();
        }
    };
    Notification.prototype.accept = function (nextOrObserver, error, complete) {
        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
            return this.observe(nextOrObserver);
        }
        else {
            return this.do(nextOrObserver, error, complete);
        }
    };
    Notification.prototype.toObservable = function () {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return (0,_observable_of__WEBPACK_IMPORTED_MODULE_0__.of)(this.value);
            case 'E':
                return (0,_observable_throwError__WEBPACK_IMPORTED_MODULE_1__.throwError)(this.error);
            case 'C':
                return (0,_observable_empty__WEBPACK_IMPORTED_MODULE_2__.empty)();
        }
        throw new Error('unexpected notification kind value');
    };
    Notification.createNext = function (value) {
        if (typeof value !== 'undefined') {
            return new Notification('N', value);
        }
        return Notification.undefinedValueNotification;
    };
    Notification.createError = function (err) {
        return new Notification('E', undefined, err);
    };
    Notification.createComplete = function () {
        return Notification.completeNotification;
    };
    Notification.completeNotification = new Notification('C');
    Notification.undefinedValueNotification = new Notification('N', undefined);
    return Notification;
}());

//# sourceMappingURL=Notification.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/Observable.js":
/*!************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/Observable.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Observable: () => (/* binding */ Observable)
/* harmony export */ });
/* harmony import */ var _util_canReportError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/canReportError */ "../../node_modules/rxjs/_esm5/internal/util/canReportError.js");
/* harmony import */ var _util_toSubscriber__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/toSubscriber */ "../../node_modules/rxjs/_esm5/internal/util/toSubscriber.js");
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./symbol/observable */ "../../node_modules/rxjs/_esm5/internal/symbol/observable.js");
/* harmony import */ var _util_pipe__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util/pipe */ "../../node_modules/rxjs/_esm5/internal/util/pipe.js");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config */ "../../node_modules/rxjs/_esm5/internal/config.js");
/** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */





var Observable = /*@__PURE__*/ (function () {
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = (0,_util_toSubscriber__WEBPACK_IMPORTED_MODULE_0__.toSubscriber)(observerOrNext, error, complete);
        if (operator) {
            sink.add(operator.call(sink, this.source));
        }
        else {
            sink.add(this.source || (_config__WEBPACK_IMPORTED_MODULE_1__.config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                this._subscribe(sink) :
                this._trySubscribe(sink));
        }
        if (_config__WEBPACK_IMPORTED_MODULE_1__.config.useDeprecatedSynchronousErrorHandling) {
            if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) {
                    throw sink.syncErrorValue;
                }
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            if (_config__WEBPACK_IMPORTED_MODULE_1__.config.useDeprecatedSynchronousErrorHandling) {
                sink.syncErrorThrown = true;
                sink.syncErrorValue = err;
            }
            if ((0,_util_canReportError__WEBPACK_IMPORTED_MODULE_2__.canReportError)(sink)) {
                sink.error(err);
            }
            else {
                console.warn(err);
            }
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscription;
            subscription = _this.subscribe(function (value) {
                try {
                    next(value);
                }
                catch (err) {
                    reject(err);
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var source = this.source;
        return source && source.subscribe(subscriber);
    };
    Observable.prototype[_symbol_observable__WEBPACK_IMPORTED_MODULE_3__.observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        return (0,_util_pipe__WEBPACK_IMPORTED_MODULE_4__.pipeFromArray)(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());

function getPromiseCtor(promiseCtor) {
    if (!promiseCtor) {
        promiseCtor = _config__WEBPACK_IMPORTED_MODULE_1__.config.Promise || Promise;
    }
    if (!promiseCtor) {
        throw new Error('no Promise impl found');
    }
    return promiseCtor;
}
//# sourceMappingURL=Observable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/Observer.js":
/*!**********************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/Observer.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   empty: () => (/* binding */ empty)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "../../node_modules/rxjs/_esm5/internal/config.js");
/* harmony import */ var _util_hostReportError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/hostReportError */ "../../node_modules/rxjs/_esm5/internal/util/hostReportError.js");
/** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */


var empty = {
    closed: true,
    next: function (value) { },
    error: function (err) {
        if (_config__WEBPACK_IMPORTED_MODULE_0__.config.useDeprecatedSynchronousErrorHandling) {
            throw err;
        }
        else {
            (0,_util_hostReportError__WEBPACK_IMPORTED_MODULE_1__.hostReportError)(err);
        }
    },
    complete: function () { }
};
//# sourceMappingURL=Observer.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OuterSubscriber: () => (/* binding */ OuterSubscriber)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


var OuterSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(OuterSubscriber, _super);
    function OuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.destination.next(innerValue);
    };
    OuterSubscriber.prototype.notifyError = function (error, innerSub) {
        this.destination.error(error);
    };
    OuterSubscriber.prototype.notifyComplete = function (innerSub) {
        this.destination.complete();
    };
    return OuterSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

//# sourceMappingURL=OuterSubscriber.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/ReplaySubject.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/ReplaySubject.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReplaySubject: () => (/* binding */ ReplaySubject)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _scheduler_queue__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./scheduler/queue */ "../../node_modules/rxjs/_esm5/internal/scheduler/queue.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _operators_observeOn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./operators/observeOn */ "../../node_modules/rxjs/_esm5/internal/operators/observeOn.js");
/* harmony import */ var _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/ObjectUnsubscribedError */ "../../node_modules/rxjs/_esm5/internal/util/ObjectUnsubscribedError.js");
/* harmony import */ var _SubjectSubscription__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SubjectSubscription */ "../../node_modules/rxjs/_esm5/internal/SubjectSubscription.js");
/** PURE_IMPORTS_START tslib,_Subject,_scheduler_queue,_Subscription,_operators_observeOn,_util_ObjectUnsubscribedError,_SubjectSubscription PURE_IMPORTS_END */







var ReplaySubject = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ReplaySubject, _super);
    function ReplaySubject(bufferSize, windowTime, scheduler) {
        if (bufferSize === void 0) {
            bufferSize = Number.POSITIVE_INFINITY;
        }
        if (windowTime === void 0) {
            windowTime = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this) || this;
        _this.scheduler = scheduler;
        _this._events = [];
        _this._infiniteTimeWindow = false;
        _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
        _this._windowTime = windowTime < 1 ? 1 : windowTime;
        if (windowTime === Number.POSITIVE_INFINITY) {
            _this._infiniteTimeWindow = true;
            _this.next = _this.nextInfiniteTimeWindow;
        }
        else {
            _this.next = _this.nextTimeWindow;
        }
        return _this;
    }
    ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
        if (!this.isStopped) {
            var _events = this._events;
            _events.push(value);
            if (_events.length > this._bufferSize) {
                _events.shift();
            }
        }
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype.nextTimeWindow = function (value) {
        if (!this.isStopped) {
            this._events.push(new ReplayEvent(this._getNow(), value));
            this._trimBufferThenGetEvents();
        }
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        var _infiniteTimeWindow = this._infiniteTimeWindow;
        var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
        var scheduler = this.scheduler;
        var len = _events.length;
        var subscription;
        if (this.closed) {
            throw new _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_1__.ObjectUnsubscribedError();
        }
        else if (this.isStopped || this.hasError) {
            subscription = _Subscription__WEBPACK_IMPORTED_MODULE_2__.Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            subscription = new _SubjectSubscription__WEBPACK_IMPORTED_MODULE_3__.SubjectSubscription(this, subscriber);
        }
        if (scheduler) {
            subscriber.add(subscriber = new _operators_observeOn__WEBPACK_IMPORTED_MODULE_4__.ObserveOnSubscriber(subscriber, scheduler));
        }
        if (_infiniteTimeWindow) {
            for (var i = 0; i < len && !subscriber.closed; i++) {
                subscriber.next(_events[i]);
            }
        }
        else {
            for (var i = 0; i < len && !subscriber.closed; i++) {
                subscriber.next(_events[i].value);
            }
        }
        if (this.hasError) {
            subscriber.error(this.thrownError);
        }
        else if (this.isStopped) {
            subscriber.complete();
        }
        return subscription;
    };
    ReplaySubject.prototype._getNow = function () {
        return (this.scheduler || _scheduler_queue__WEBPACK_IMPORTED_MODULE_5__.queue).now();
    };
    ReplaySubject.prototype._trimBufferThenGetEvents = function () {
        var now = this._getNow();
        var _bufferSize = this._bufferSize;
        var _windowTime = this._windowTime;
        var _events = this._events;
        var eventsCount = _events.length;
        var spliceCount = 0;
        while (spliceCount < eventsCount) {
            if ((now - _events[spliceCount].time) < _windowTime) {
                break;
            }
            spliceCount++;
        }
        if (eventsCount > _bufferSize) {
            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
        }
        if (spliceCount > 0) {
            _events.splice(0, spliceCount);
        }
        return _events;
    };
    return ReplaySubject;
}(_Subject__WEBPACK_IMPORTED_MODULE_6__.Subject));

var ReplayEvent = /*@__PURE__*/ (function () {
    function ReplayEvent(time, value) {
        this.time = time;
        this.value = value;
    }
    return ReplayEvent;
}());
//# sourceMappingURL=ReplaySubject.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/Scheduler.js":
/*!***********************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/Scheduler.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scheduler: () => (/* binding */ Scheduler)
/* harmony export */ });
var Scheduler = /*@__PURE__*/ (function () {
    function Scheduler(SchedulerAction, now) {
        if (now === void 0) {
            now = Scheduler.now;
        }
        this.SchedulerAction = SchedulerAction;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) {
            delay = 0;
        }
        return new this.SchedulerAction(this, work).schedule(state, delay);
    };
    Scheduler.now = function () { return Date.now(); };
    return Scheduler;
}());

//# sourceMappingURL=Scheduler.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/Subject.js":
/*!*********************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/Subject.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnonymousSubject: () => (/* binding */ AnonymousSubject),
/* harmony export */   Subject: () => (/* binding */ Subject),
/* harmony export */   SubjectSubscriber: () => (/* binding */ SubjectSubscriber)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/ObjectUnsubscribedError */ "../../node_modules/rxjs/_esm5/internal/util/ObjectUnsubscribedError.js");
/* harmony import */ var _SubjectSubscription__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./SubjectSubscription */ "../../node_modules/rxjs/_esm5/internal/SubjectSubscription.js");
/* harmony import */ var _internal_symbol_rxSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../internal/symbol/rxSubscriber */ "../../node_modules/rxjs/_esm5/internal/symbol/rxSubscriber.js");
/** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */







var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SubjectSubscriber, _super);
    function SubjectSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        return _this;
    }
    return SubjectSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

var Subject = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.observers = [];
        _this.closed = false;
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype[_internal_symbol_rxSubscriber__WEBPACK_IMPORTED_MODULE_2__.rxSubscriber] = function () {
        return new SubjectSubscriber(this);
    };
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype.next = function (value) {
        if (this.closed) {
            throw new _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_3__.ObjectUnsubscribedError();
        }
        if (!this.isStopped) {
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].next(value);
            }
        }
    };
    Subject.prototype.error = function (err) {
        if (this.closed) {
            throw new _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_3__.ObjectUnsubscribedError();
        }
        this.hasError = true;
        this.thrownError = err;
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].error(err);
        }
        this.observers.length = 0;
    };
    Subject.prototype.complete = function () {
        if (this.closed) {
            throw new _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_3__.ObjectUnsubscribedError();
        }
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].complete();
        }
        this.observers.length = 0;
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = true;
        this.closed = true;
        this.observers = null;
    };
    Subject.prototype._trySubscribe = function (subscriber) {
        if (this.closed) {
            throw new _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_3__.ObjectUnsubscribedError();
        }
        else {
            return _super.prototype._trySubscribe.call(this, subscriber);
        }
    };
    Subject.prototype._subscribe = function (subscriber) {
        if (this.closed) {
            throw new _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_3__.ObjectUnsubscribedError();
        }
        else if (this.hasError) {
            subscriber.error(this.thrownError);
            return _Subscription__WEBPACK_IMPORTED_MODULE_4__.Subscription.EMPTY;
        }
        else if (this.isStopped) {
            subscriber.complete();
            return _Subscription__WEBPACK_IMPORTED_MODULE_4__.Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            return new _SubjectSubscription__WEBPACK_IMPORTED_MODULE_5__.SubjectSubscription(this, subscriber);
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new _Observable__WEBPACK_IMPORTED_MODULE_6__.Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(_Observable__WEBPACK_IMPORTED_MODULE_6__.Observable));

var AnonymousSubject = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var destination = this.destination;
        if (destination && destination.next) {
            destination.next(value);
        }
    };
    AnonymousSubject.prototype.error = function (err) {
        var destination = this.destination;
        if (destination && destination.error) {
            this.destination.error(err);
        }
    };
    AnonymousSubject.prototype.complete = function () {
        var destination = this.destination;
        if (destination && destination.complete) {
            this.destination.complete();
        }
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var source = this.source;
        if (source) {
            return this.source.subscribe(subscriber);
        }
        else {
            return _Subscription__WEBPACK_IMPORTED_MODULE_4__.Subscription.EMPTY;
        }
    };
    return AnonymousSubject;
}(Subject));

//# sourceMappingURL=Subject.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/SubjectSubscription.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/SubjectSubscription.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SubjectSubscription: () => (/* binding */ SubjectSubscription)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */


var SubjectSubscription = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SubjectSubscription, _super);
    function SubjectSubscription(subject, subscriber) {
        var _this = _super.call(this) || this;
        _this.subject = subject;
        _this.subscriber = subscriber;
        _this.closed = false;
        return _this;
    }
    SubjectSubscription.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.closed = true;
        var subject = this.subject;
        var observers = subject.observers;
        this.subject = null;
        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
            return;
        }
        var subscriberIndex = observers.indexOf(this.subscriber);
        if (subscriberIndex !== -1) {
            observers.splice(subscriberIndex, 1);
        }
    };
    return SubjectSubscription;
}(_Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription));

//# sourceMappingURL=SubjectSubscription.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/Subscriber.js":
/*!************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/Subscriber.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SafeSubscriber: () => (/* binding */ SafeSubscriber),
/* harmony export */   Subscriber: () => (/* binding */ Subscriber)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util/isFunction */ "../../node_modules/rxjs/_esm5/internal/util/isFunction.js");
/* harmony import */ var _Observer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Observer */ "../../node_modules/rxjs/_esm5/internal/Observer.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _internal_symbol_rxSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../internal/symbol/rxSubscriber */ "../../node_modules/rxjs/_esm5/internal/symbol/rxSubscriber.js");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./config */ "../../node_modules/rxjs/_esm5/internal/config.js");
/* harmony import */ var _util_hostReportError__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util/hostReportError */ "../../node_modules/rxjs/_esm5/internal/util/hostReportError.js");
/** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */







var Subscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(Subscriber, _super);
    function Subscriber(destinationOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this.syncErrorValue = null;
        _this.syncErrorThrown = false;
        _this.syncErrorThrowable = false;
        _this.isStopped = false;
        switch (arguments.length) {
            case 0:
                _this.destination = _Observer__WEBPACK_IMPORTED_MODULE_1__.empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    _this.destination = _Observer__WEBPACK_IMPORTED_MODULE_1__.empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                        _this.destination = destinationOrNext;
                        destinationOrNext.add(_this);
                    }
                    else {
                        _this.syncErrorThrowable = true;
                        _this.destination = new SafeSubscriber(_this, destinationOrNext);
                    }
                    break;
                }
            default:
                _this.syncErrorThrowable = true;
                _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                break;
        }
        return _this;
    }
    Subscriber.prototype[_internal_symbol_rxSubscriber__WEBPACK_IMPORTED_MODULE_2__.rxSubscriber] = function () { return this; };
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _parentOrParents = this._parentOrParents;
        this._parentOrParents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parentOrParents = _parentOrParents;
        return this;
    };
    return Subscriber;
}(_Subscription__WEBPACK_IMPORTED_MODULE_3__.Subscription));

var SafeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this._parentSubscriber = _parentSubscriber;
        var next;
        var context = _this;
        if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_4__.isFunction)(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== _Observer__WEBPACK_IMPORTED_MODULE_1__.empty) {
                context = Object.create(observerOrNext);
                if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_4__.isFunction)(context.unsubscribe)) {
                    _this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = _this.unsubscribe.bind(_this);
            }
        }
        _this._context = context;
        _this._next = next;
        _this._error = error;
        _this._complete = complete;
        return _this;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!_config__WEBPACK_IMPORTED_MODULE_5__.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            var useDeprecatedSynchronousErrorHandling = _config__WEBPACK_IMPORTED_MODULE_5__.config.useDeprecatedSynchronousErrorHandling;
            if (this._error) {
                if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                if (useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                (0,_util_hostReportError__WEBPACK_IMPORTED_MODULE_6__.hostReportError)(err);
            }
            else {
                if (useDeprecatedSynchronousErrorHandling) {
                    _parentSubscriber.syncErrorValue = err;
                    _parentSubscriber.syncErrorThrown = true;
                }
                else {
                    (0,_util_hostReportError__WEBPACK_IMPORTED_MODULE_6__.hostReportError)(err);
                }
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!_config__WEBPACK_IMPORTED_MODULE_5__.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            if (_config__WEBPACK_IMPORTED_MODULE_5__.config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                (0,_util_hostReportError__WEBPACK_IMPORTED_MODULE_6__.hostReportError)(err);
            }
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        if (!_config__WEBPACK_IMPORTED_MODULE_5__.config.useDeprecatedSynchronousErrorHandling) {
            throw new Error('bad call');
        }
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            if (_config__WEBPACK_IMPORTED_MODULE_5__.config.useDeprecatedSynchronousErrorHandling) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            }
            else {
                (0,_util_hostReportError__WEBPACK_IMPORTED_MODULE_6__.hostReportError)(err);
                return true;
            }
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

//# sourceMappingURL=Subscriber.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/Subscription.js":
/*!**************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/Subscription.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Subscription: () => (/* binding */ Subscription)
/* harmony export */ });
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _util_isObject__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/isObject */ "../../node_modules/rxjs/_esm5/internal/util/isObject.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/isFunction */ "../../node_modules/rxjs/_esm5/internal/util/isFunction.js");
/* harmony import */ var _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/UnsubscriptionError */ "../../node_modules/rxjs/_esm5/internal/util/UnsubscriptionError.js");
/** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */




var Subscription = /*@__PURE__*/ (function () {
    function Subscription(unsubscribe) {
        this.closed = false;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._ctorUnsubscribe = true;
            this._unsubscribe = unsubscribe;
        }
    }
    Subscription.prototype.unsubscribe = function () {
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (_parentOrParents instanceof Subscription) {
            _parentOrParents.remove(this);
        }
        else if (_parentOrParents !== null) {
            for (var index = 0; index < _parentOrParents.length; ++index) {
                var parent_1 = _parentOrParents[index];
                parent_1.remove(this);
            }
        }
        if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(_unsubscribe)) {
            if (_ctorUnsubscribe) {
                this._unsubscribe = undefined;
            }
            try {
                _unsubscribe.call(this);
            }
            catch (e) {
                errors = e instanceof _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_1__.UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
            }
        }
        if ((0,_util_isArray__WEBPACK_IMPORTED_MODULE_2__.isArray)(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if ((0,_util_isObject__WEBPACK_IMPORTED_MODULE_3__.isObject)(sub)) {
                    try {
                        sub.unsubscribe();
                    }
                    catch (e) {
                        errors = errors || [];
                        if (e instanceof _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_1__.UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                        }
                        else {
                            errors.push(e);
                        }
                    }
                }
            }
        }
        if (errors) {
            throw new _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_1__.UnsubscriptionError(errors);
        }
    };
    Subscription.prototype.add = function (teardown) {
        var subscription = teardown;
        if (!teardown) {
            return Subscription.EMPTY;
        }
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (!(subscription instanceof Subscription)) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default: {
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
            }
        }
        var _parentOrParents = subscription._parentOrParents;
        if (_parentOrParents === null) {
            subscription._parentOrParents = this;
        }
        else if (_parentOrParents instanceof Subscription) {
            if (_parentOrParents === this) {
                return subscription;
            }
            subscription._parentOrParents = [_parentOrParents, this];
        }
        else if (_parentOrParents.indexOf(this) === -1) {
            _parentOrParents.push(this);
        }
        else {
            return subscription;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions === null) {
            this._subscriptions = [subscription];
        }
        else {
            subscriptions.push(subscription);
        }
        return subscription;
    };
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());

function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_1__.UnsubscriptionError) ? err.errors : err); }, []);
}
//# sourceMappingURL=Subscription.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/config.js":
/*!********************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/config.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   config: () => (/* binding */ config)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var _enable_super_gross_mode_that_will_cause_bad_things = false;
var config = {
    Promise: undefined,
    set useDeprecatedSynchronousErrorHandling(value) {
        if (value) {
            var error = /*@__PURE__*/ new Error();
            /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
        }
        else if (_enable_super_gross_mode_that_will_cause_bad_things) {
            /*@__PURE__*/ console.log('RxJS: Back to a better error behavior. Thank you. <3');
        }
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    },
};
//# sourceMappingURL=config.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/innerSubscribe.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ComplexInnerSubscriber: () => (/* binding */ ComplexInnerSubscriber),
/* harmony export */   ComplexOuterSubscriber: () => (/* binding */ ComplexOuterSubscriber),
/* harmony export */   SimpleInnerSubscriber: () => (/* binding */ SimpleInnerSubscriber),
/* harmony export */   SimpleOuterSubscriber: () => (/* binding */ SimpleOuterSubscriber),
/* harmony export */   innerSubscribe: () => (/* binding */ innerSubscribe)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_subscribeTo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/subscribeTo */ "../../node_modules/rxjs/_esm5/internal/util/subscribeTo.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_util_subscribeTo PURE_IMPORTS_END */




var SimpleInnerSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SimpleInnerSubscriber, _super);
    function SimpleInnerSubscriber(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        return _this;
    }
    SimpleInnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(value);
    };
    SimpleInnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error);
        this.unsubscribe();
    };
    SimpleInnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete();
        this.unsubscribe();
    };
    return SimpleInnerSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

var ComplexInnerSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ComplexInnerSubscriber, _super);
    function ComplexInnerSubscriber(parent, outerValue, outerIndex) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.outerValue = outerValue;
        _this.outerIndex = outerIndex;
        return _this;
    }
    ComplexInnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this);
    };
    ComplexInnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error);
        this.unsubscribe();
    };
    ComplexInnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
        this.unsubscribe();
    };
    return ComplexInnerSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

var SimpleOuterSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SimpleOuterSubscriber, _super);
    function SimpleOuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleOuterSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    SimpleOuterSubscriber.prototype.notifyError = function (err) {
        this.destination.error(err);
    };
    SimpleOuterSubscriber.prototype.notifyComplete = function () {
        this.destination.complete();
    };
    return SimpleOuterSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

var ComplexOuterSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ComplexOuterSubscriber, _super);
    function ComplexOuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComplexOuterSubscriber.prototype.notifyNext = function (_outerValue, innerValue, _outerIndex, _innerSub) {
        this.destination.next(innerValue);
    };
    ComplexOuterSubscriber.prototype.notifyError = function (error) {
        this.destination.error(error);
    };
    ComplexOuterSubscriber.prototype.notifyComplete = function (_innerSub) {
        this.destination.complete();
    };
    return ComplexOuterSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

function innerSubscribe(result, innerSubscriber) {
    if (innerSubscriber.closed) {
        return undefined;
    }
    if (result instanceof _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable) {
        return result.subscribe(innerSubscriber);
    }
    var subscription;
    try {
        subscription = (0,_util_subscribeTo__WEBPACK_IMPORTED_MODULE_3__.subscribeTo)(result)(innerSubscriber);
    }
    catch (error) {
        innerSubscriber.error(error);
    }
    return subscription;
}
//# sourceMappingURL=innerSubscribe.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/ConnectableObservable.js":
/*!**********************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/ConnectableObservable.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConnectableObservable: () => (/* binding */ ConnectableObservable),
/* harmony export */   connectableObservableDescriptor: () => (/* binding */ connectableObservableDescriptor)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _operators_refCount__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../operators/refCount */ "../../node_modules/rxjs/_esm5/internal/operators/refCount.js");
/** PURE_IMPORTS_START tslib,_Subject,_Observable,_Subscriber,_Subscription,_operators_refCount PURE_IMPORTS_END */






var ConnectableObservable = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ConnectableObservable, _super);
    function ConnectableObservable(source, subjectFactory) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subjectFactory = subjectFactory;
        _this._refCount = 0;
        _this._isComplete = false;
        return _this;
    }
    ConnectableObservable.prototype._subscribe = function (subscriber) {
        return this.getSubject().subscribe(subscriber);
    };
    ConnectableObservable.prototype.getSubject = function () {
        var subject = this._subject;
        if (!subject || subject.isStopped) {
            this._subject = this.subjectFactory();
        }
        return this._subject;
    };
    ConnectableObservable.prototype.connect = function () {
        var connection = this._connection;
        if (!connection) {
            this._isComplete = false;
            connection = this._connection = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
            connection.add(this.source
                .subscribe(new ConnectableSubscriber(this.getSubject(), this)));
            if (connection.closed) {
                this._connection = null;
                connection = _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription.EMPTY;
            }
        }
        return connection;
    };
    ConnectableObservable.prototype.refCount = function () {
        return (0,_operators_refCount__WEBPACK_IMPORTED_MODULE_2__.refCount)()(this);
    };
    return ConnectableObservable;
}(_Observable__WEBPACK_IMPORTED_MODULE_3__.Observable));

var connectableObservableDescriptor = /*@__PURE__*/ (function () {
    var connectableProto = ConnectableObservable.prototype;
    return {
        operator: { value: null },
        _refCount: { value: 0, writable: true },
        _subject: { value: null, writable: true },
        _connection: { value: null, writable: true },
        _subscribe: { value: connectableProto._subscribe },
        _isComplete: { value: connectableProto._isComplete, writable: true },
        getSubject: { value: connectableProto.getSubject },
        connect: { value: connectableProto.connect },
        refCount: { value: connectableProto.refCount }
    };
})();
var ConnectableSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ConnectableSubscriber, _super);
    function ConnectableSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    ConnectableSubscriber.prototype._error = function (err) {
        this._unsubscribe();
        _super.prototype._error.call(this, err);
    };
    ConnectableSubscriber.prototype._complete = function () {
        this.connectable._isComplete = true;
        this._unsubscribe();
        _super.prototype._complete.call(this);
    };
    ConnectableSubscriber.prototype._unsubscribe = function () {
        var connectable = this.connectable;
        if (connectable) {
            this.connectable = null;
            var connection = connectable._connection;
            connectable._refCount = 0;
            connectable._subject = null;
            connectable._connection = null;
            if (connection) {
                connection.unsubscribe();
            }
        }
    };
    return ConnectableSubscriber;
}(_Subject__WEBPACK_IMPORTED_MODULE_4__.SubjectSubscriber));
var RefCountOperator = /*@__PURE__*/ (function () {
    function RefCountOperator(connectable) {
        this.connectable = connectable;
    }
    RefCountOperator.prototype.call = function (subscriber, source) {
        var connectable = this.connectable;
        connectable._refCount++;
        var refCounter = new RefCountSubscriber(subscriber, connectable);
        var subscription = source.subscribe(refCounter);
        if (!refCounter.closed) {
            refCounter.connection = connectable.connect();
        }
        return subscription;
    };
    return RefCountOperator;
}());
var RefCountSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(RefCountSubscriber, _super);
    function RefCountSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    RefCountSubscriber.prototype._unsubscribe = function () {
        var connectable = this.connectable;
        if (!connectable) {
            this.connection = null;
            return;
        }
        this.connectable = null;
        var refCount = connectable._refCount;
        if (refCount <= 0) {
            this.connection = null;
            return;
        }
        connectable._refCount = refCount - 1;
        if (refCount > 1) {
            this.connection = null;
            return;
        }
        var connection = this.connection;
        var sharedConnection = connectable._connection;
        this.connection = null;
        if (sharedConnection && (!connection || sharedConnection === connection)) {
            sharedConnection.unsubscribe();
        }
    };
    return RefCountSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_5__.Subscriber));
//# sourceMappingURL=ConnectableObservable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/SubscribeOnObservable.js":
/*!**********************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/SubscribeOnObservable.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SubscribeOnObservable: () => (/* binding */ SubscribeOnObservable)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _scheduler_asap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scheduler/asap */ "../../node_modules/rxjs/_esm5/internal/scheduler/asap.js");
/* harmony import */ var _util_isNumeric__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isNumeric */ "../../node_modules/rxjs/_esm5/internal/util/isNumeric.js");
/** PURE_IMPORTS_START tslib,_Observable,_scheduler_asap,_util_isNumeric PURE_IMPORTS_END */




var SubscribeOnObservable = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SubscribeOnObservable, _super);
    function SubscribeOnObservable(source, delayTime, scheduler) {
        if (delayTime === void 0) {
            delayTime = 0;
        }
        if (scheduler === void 0) {
            scheduler = _scheduler_asap__WEBPACK_IMPORTED_MODULE_1__.asap;
        }
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.delayTime = delayTime;
        _this.scheduler = scheduler;
        if (!(0,_util_isNumeric__WEBPACK_IMPORTED_MODULE_2__.isNumeric)(delayTime) || delayTime < 0) {
            _this.delayTime = 0;
        }
        if (!scheduler || typeof scheduler.schedule !== 'function') {
            _this.scheduler = _scheduler_asap__WEBPACK_IMPORTED_MODULE_1__.asap;
        }
        return _this;
    }
    SubscribeOnObservable.create = function (source, delay, scheduler) {
        if (delay === void 0) {
            delay = 0;
        }
        if (scheduler === void 0) {
            scheduler = _scheduler_asap__WEBPACK_IMPORTED_MODULE_1__.asap;
        }
        return new SubscribeOnObservable(source, delay, scheduler);
    };
    SubscribeOnObservable.dispatch = function (arg) {
        var source = arg.source, subscriber = arg.subscriber;
        return this.add(source.subscribe(subscriber));
    };
    SubscribeOnObservable.prototype._subscribe = function (subscriber) {
        var delay = this.delayTime;
        var source = this.source;
        var scheduler = this.scheduler;
        return scheduler.schedule(SubscribeOnObservable.dispatch, delay, {
            source: source, subscriber: subscriber
        });
    };
    return SubscribeOnObservable;
}(_Observable__WEBPACK_IMPORTED_MODULE_3__.Observable));

//# sourceMappingURL=SubscribeOnObservable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/bindCallback.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/bindCallback.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bindCallback: () => (/* binding */ bindCallback)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _AsyncSubject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../AsyncSubject */ "../../node_modules/rxjs/_esm5/internal/AsyncSubject.js");
/* harmony import */ var _operators_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../operators/map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/* harmony import */ var _util_canReportError__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/canReportError */ "../../node_modules/rxjs/_esm5/internal/util/canReportError.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isArray,_util_isScheduler PURE_IMPORTS_END */






function bindCallback(callbackFunc, resultSelector, scheduler) {
    if (resultSelector) {
        if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_0__.isScheduler)(resultSelector)) {
            scheduler = resultSelector;
        }
        else {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return bindCallback(callbackFunc, scheduler).apply(void 0, args).pipe((0,_operators_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (args) { return (0,_util_isArray__WEBPACK_IMPORTED_MODULE_2__.isArray)(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
            };
        }
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var context = this;
        var subject;
        var params = {
            context: context,
            subject: subject,
            callbackFunc: callbackFunc,
            scheduler: scheduler,
        };
        return new _Observable__WEBPACK_IMPORTED_MODULE_3__.Observable(function (subscriber) {
            if (!scheduler) {
                if (!subject) {
                    subject = new _AsyncSubject__WEBPACK_IMPORTED_MODULE_4__.AsyncSubject();
                    var handler = function () {
                        var innerArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            innerArgs[_i] = arguments[_i];
                        }
                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
                        subject.complete();
                    };
                    try {
                        callbackFunc.apply(context, args.concat([handler]));
                    }
                    catch (err) {
                        if ((0,_util_canReportError__WEBPACK_IMPORTED_MODULE_5__.canReportError)(subject)) {
                            subject.error(err);
                        }
                        else {
                            console.warn(err);
                        }
                    }
                }
                return subject.subscribe(subscriber);
            }
            else {
                var state = {
                    args: args, subscriber: subscriber, params: params,
                };
                return scheduler.schedule(dispatch, 0, state);
            }
        });
    };
}
function dispatch(state) {
    var _this = this;
    var self = this;
    var args = state.args, subscriber = state.subscriber, params = state.params;
    var callbackFunc = params.callbackFunc, context = params.context, scheduler = params.scheduler;
    var subject = params.subject;
    if (!subject) {
        subject = params.subject = new _AsyncSubject__WEBPACK_IMPORTED_MODULE_4__.AsyncSubject();
        var handler = function () {
            var innerArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                innerArgs[_i] = arguments[_i];
            }
            var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
            _this.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
        };
        try {
            callbackFunc.apply(context, args.concat([handler]));
        }
        catch (err) {
            subject.error(err);
        }
    }
    this.add(subject.subscribe(subscriber));
}
function dispatchNext(state) {
    var value = state.value, subject = state.subject;
    subject.next(value);
    subject.complete();
}
function dispatchError(state) {
    var err = state.err, subject = state.subject;
    subject.error(err);
}
//# sourceMappingURL=bindCallback.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/bindNodeCallback.js":
/*!*****************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/bindNodeCallback.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bindNodeCallback: () => (/* binding */ bindNodeCallback)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _AsyncSubject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../AsyncSubject */ "../../node_modules/rxjs/_esm5/internal/AsyncSubject.js");
/* harmony import */ var _operators_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../operators/map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/* harmony import */ var _util_canReportError__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/canReportError */ "../../node_modules/rxjs/_esm5/internal/util/canReportError.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isScheduler,_util_isArray PURE_IMPORTS_END */






function bindNodeCallback(callbackFunc, resultSelector, scheduler) {
    if (resultSelector) {
        if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_0__.isScheduler)(resultSelector)) {
            scheduler = resultSelector;
        }
        else {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return bindNodeCallback(callbackFunc, scheduler).apply(void 0, args).pipe((0,_operators_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (args) { return (0,_util_isArray__WEBPACK_IMPORTED_MODULE_2__.isArray)(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
            };
        }
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var params = {
            subject: undefined,
            args: args,
            callbackFunc: callbackFunc,
            scheduler: scheduler,
            context: this,
        };
        return new _Observable__WEBPACK_IMPORTED_MODULE_3__.Observable(function (subscriber) {
            var context = params.context;
            var subject = params.subject;
            if (!scheduler) {
                if (!subject) {
                    subject = params.subject = new _AsyncSubject__WEBPACK_IMPORTED_MODULE_4__.AsyncSubject();
                    var handler = function () {
                        var innerArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            innerArgs[_i] = arguments[_i];
                        }
                        var err = innerArgs.shift();
                        if (err) {
                            subject.error(err);
                            return;
                        }
                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
                        subject.complete();
                    };
                    try {
                        callbackFunc.apply(context, args.concat([handler]));
                    }
                    catch (err) {
                        if ((0,_util_canReportError__WEBPACK_IMPORTED_MODULE_5__.canReportError)(subject)) {
                            subject.error(err);
                        }
                        else {
                            console.warn(err);
                        }
                    }
                }
                return subject.subscribe(subscriber);
            }
            else {
                return scheduler.schedule(dispatch, 0, { params: params, subscriber: subscriber, context: context });
            }
        });
    };
}
function dispatch(state) {
    var _this = this;
    var params = state.params, subscriber = state.subscriber, context = state.context;
    var callbackFunc = params.callbackFunc, args = params.args, scheduler = params.scheduler;
    var subject = params.subject;
    if (!subject) {
        subject = params.subject = new _AsyncSubject__WEBPACK_IMPORTED_MODULE_4__.AsyncSubject();
        var handler = function () {
            var innerArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                innerArgs[_i] = arguments[_i];
            }
            var err = innerArgs.shift();
            if (err) {
                _this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
            }
            else {
                var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
                _this.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
            }
        };
        try {
            callbackFunc.apply(context, args.concat([handler]));
        }
        catch (err) {
            this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
        }
    }
    this.add(subject.subscribe(subscriber));
}
function dispatchNext(arg) {
    var value = arg.value, subject = arg.subject;
    subject.next(value);
    subject.complete();
}
function dispatchError(arg) {
    var err = arg.err, subject = arg.subject;
    subject.error(err);
}
//# sourceMappingURL=bindNodeCallback.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/combineLatest.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/combineLatest.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CombineLatestOperator: () => (/* binding */ CombineLatestOperator),
/* harmony export */   CombineLatestSubscriber: () => (/* binding */ CombineLatestSubscriber),
/* harmony export */   combineLatest: () => (/* binding */ combineLatest)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _OuterSubscriber__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../OuterSubscriber */ "../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js");
/* harmony import */ var _util_subscribeToResult__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/subscribeToResult */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js");
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fromArray */ "../../node_modules/rxjs/_esm5/internal/observable/fromArray.js");
/** PURE_IMPORTS_START tslib,_util_isScheduler,_util_isArray,_OuterSubscriber,_util_subscribeToResult,_fromArray PURE_IMPORTS_END */






var NONE = {};
function combineLatest() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var resultSelector = undefined;
    var scheduler = undefined;
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_0__.isScheduler)(observables[observables.length - 1])) {
        scheduler = observables.pop();
    }
    if (typeof observables[observables.length - 1] === 'function') {
        resultSelector = observables.pop();
    }
    if (observables.length === 1 && (0,_util_isArray__WEBPACK_IMPORTED_MODULE_1__.isArray)(observables[0])) {
        observables = observables[0];
    }
    return (0,_fromArray__WEBPACK_IMPORTED_MODULE_2__.fromArray)(observables, scheduler).lift(new CombineLatestOperator(resultSelector));
}
var CombineLatestOperator = /*@__PURE__*/ (function () {
    function CombineLatestOperator(resultSelector) {
        this.resultSelector = resultSelector;
    }
    CombineLatestOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
    };
    return CombineLatestOperator;
}());

var CombineLatestSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_3__.__extends(CombineLatestSubscriber, _super);
    function CombineLatestSubscriber(destination, resultSelector) {
        var _this = _super.call(this, destination) || this;
        _this.resultSelector = resultSelector;
        _this.active = 0;
        _this.values = [];
        _this.observables = [];
        return _this;
    }
    CombineLatestSubscriber.prototype._next = function (observable) {
        this.values.push(NONE);
        this.observables.push(observable);
    };
    CombineLatestSubscriber.prototype._complete = function () {
        var observables = this.observables;
        var len = observables.length;
        if (len === 0) {
            this.destination.complete();
        }
        else {
            this.active = len;
            this.toRespond = len;
            for (var i = 0; i < len; i++) {
                var observable = observables[i];
                this.add((0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_4__.subscribeToResult)(this, observable, undefined, i));
            }
        }
    };
    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
        if ((this.active -= 1) === 0) {
            this.destination.complete();
        }
    };
    CombineLatestSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        var values = this.values;
        var oldVal = values[outerIndex];
        var toRespond = !this.toRespond
            ? 0
            : oldVal === NONE ? --this.toRespond : this.toRespond;
        values[outerIndex] = innerValue;
        if (toRespond === 0) {
            if (this.resultSelector) {
                this._tryResultSelector(values);
            }
            else {
                this.destination.next(values.slice());
            }
        }
    };
    CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
        var result;
        try {
            result = this.resultSelector.apply(this, values);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return CombineLatestSubscriber;
}(_OuterSubscriber__WEBPACK_IMPORTED_MODULE_5__.OuterSubscriber));

//# sourceMappingURL=combineLatest.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/concat.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/concat.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   concat: () => (/* binding */ concat)
/* harmony export */ });
/* harmony import */ var _of__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./of */ "../../node_modules/rxjs/_esm5/internal/observable/of.js");
/* harmony import */ var _operators_concatAll__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../operators/concatAll */ "../../node_modules/rxjs/_esm5/internal/operators/concatAll.js");
/** PURE_IMPORTS_START _of,_operators_concatAll PURE_IMPORTS_END */


function concat() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    return (0,_operators_concatAll__WEBPACK_IMPORTED_MODULE_0__.concatAll)()(_of__WEBPACK_IMPORTED_MODULE_1__.of.apply(void 0, observables));
}
//# sourceMappingURL=concat.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/defer.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/defer.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defer: () => (/* binding */ defer)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */



function defer(observableFactory) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var input;
        try {
            input = observableFactory();
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        var source = input ? (0,_from__WEBPACK_IMPORTED_MODULE_1__.from)(input) : (0,_empty__WEBPACK_IMPORTED_MODULE_2__.empty)();
        return source.subscribe(subscriber);
    });
}
//# sourceMappingURL=defer.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/empty.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/empty.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EMPTY: () => (/* binding */ EMPTY),
/* harmony export */   empty: () => (/* binding */ empty)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

var EMPTY = /*@__PURE__*/ new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) { return subscriber.complete(); });
function empty(scheduler) {
    return scheduler ? emptyScheduled(scheduler) : EMPTY;
}
function emptyScheduled(scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
}
//# sourceMappingURL=empty.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/forkJoin.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/forkJoin.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   forkJoin: () => (/* binding */ forkJoin)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _operators_map__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../operators/map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/* harmony import */ var _util_isObject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isObject */ "../../node_modules/rxjs/_esm5/internal/util/isObject.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/** PURE_IMPORTS_START _Observable,_util_isArray,_operators_map,_util_isObject,_from PURE_IMPORTS_END */





function forkJoin() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    if (sources.length === 1) {
        var first_1 = sources[0];
        if ((0,_util_isArray__WEBPACK_IMPORTED_MODULE_0__.isArray)(first_1)) {
            return forkJoinInternal(first_1, null);
        }
        if ((0,_util_isObject__WEBPACK_IMPORTED_MODULE_1__.isObject)(first_1) && Object.getPrototypeOf(first_1) === Object.prototype) {
            var keys = Object.keys(first_1);
            return forkJoinInternal(keys.map(function (key) { return first_1[key]; }), keys);
        }
    }
    if (typeof sources[sources.length - 1] === 'function') {
        var resultSelector_1 = sources.pop();
        sources = (sources.length === 1 && (0,_util_isArray__WEBPACK_IMPORTED_MODULE_0__.isArray)(sources[0])) ? sources[0] : sources;
        return forkJoinInternal(sources, null).pipe((0,_operators_map__WEBPACK_IMPORTED_MODULE_2__.map)(function (args) { return resultSelector_1.apply(void 0, args); }));
    }
    return forkJoinInternal(sources, null);
}
function forkJoinInternal(sources, keys) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_3__.Observable(function (subscriber) {
        var len = sources.length;
        if (len === 0) {
            subscriber.complete();
            return;
        }
        var values = new Array(len);
        var completed = 0;
        var emitted = 0;
        var _loop_1 = function (i) {
            var source = (0,_from__WEBPACK_IMPORTED_MODULE_4__.from)(sources[i]);
            var hasValue = false;
            subscriber.add(source.subscribe({
                next: function (value) {
                    if (!hasValue) {
                        hasValue = true;
                        emitted++;
                    }
                    values[i] = value;
                },
                error: function (err) { return subscriber.error(err); },
                complete: function () {
                    completed++;
                    if (completed === len || !hasValue) {
                        if (emitted === len) {
                            subscriber.next(keys ?
                                keys.reduce(function (result, key, i) { return (result[key] = values[i], result); }, {}) :
                                values);
                        }
                        subscriber.complete();
                    }
                }
            }));
        };
        for (var i = 0; i < len; i++) {
            _loop_1(i);
        }
    });
}
//# sourceMappingURL=forkJoin.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/from.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/from.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   from: () => (/* binding */ from)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_subscribeTo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/subscribeTo */ "../../node_modules/rxjs/_esm5/internal/util/subscribeTo.js");
/* harmony import */ var _scheduled_scheduled__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scheduled/scheduled */ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduled.js");
/** PURE_IMPORTS_START _Observable,_util_subscribeTo,_scheduled_scheduled PURE_IMPORTS_END */



function from(input, scheduler) {
    if (!scheduler) {
        if (input instanceof _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable) {
            return input;
        }
        return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable((0,_util_subscribeTo__WEBPACK_IMPORTED_MODULE_1__.subscribeTo)(input));
    }
    else {
        return (0,_scheduled_scheduled__WEBPACK_IMPORTED_MODULE_2__.scheduled)(input, scheduler);
    }
}
//# sourceMappingURL=from.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/fromArray.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/fromArray.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromArray: () => (/* binding */ fromArray)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_subscribeToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/subscribeToArray */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToArray.js");
/* harmony import */ var _scheduled_scheduleArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scheduled/scheduleArray */ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduleArray.js");
/** PURE_IMPORTS_START _Observable,_util_subscribeToArray,_scheduled_scheduleArray PURE_IMPORTS_END */



function fromArray(input, scheduler) {
    if (!scheduler) {
        return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable((0,_util_subscribeToArray__WEBPACK_IMPORTED_MODULE_1__.subscribeToArray)(input));
    }
    else {
        return (0,_scheduled_scheduleArray__WEBPACK_IMPORTED_MODULE_2__.scheduleArray)(input, scheduler);
    }
}
//# sourceMappingURL=fromArray.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/fromEvent.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/fromEvent.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromEvent: () => (/* binding */ fromEvent)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "../../node_modules/rxjs/_esm5/internal/util/isFunction.js");
/* harmony import */ var _operators_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../operators/map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */




var toString = /*@__PURE__*/ (function () { return Object.prototype.toString; })();
function fromEvent(target, eventName, options, resultSelector) {
    if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(options)) {
        resultSelector = options;
        options = undefined;
    }
    if (resultSelector) {
        return fromEvent(target, eventName, options).pipe((0,_operators_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (args) { return (0,_util_isArray__WEBPACK_IMPORTED_MODULE_2__.isArray)(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_3__.Observable(function (subscriber) {
        function handler(e) {
            if (arguments.length > 1) {
                subscriber.next(Array.prototype.slice.call(arguments));
            }
            else {
                subscriber.next(e);
            }
        }
        setupSubscription(target, eventName, handler, subscriber, options);
    });
}
function setupSubscription(sourceObj, eventName, handler, subscriber, options) {
    var unsubscribe;
    if (isEventTarget(sourceObj)) {
        var source_1 = sourceObj;
        sourceObj.addEventListener(eventName, handler, options);
        unsubscribe = function () { return source_1.removeEventListener(eventName, handler, options); };
    }
    else if (isJQueryStyleEventEmitter(sourceObj)) {
        var source_2 = sourceObj;
        sourceObj.on(eventName, handler);
        unsubscribe = function () { return source_2.off(eventName, handler); };
    }
    else if (isNodeStyleEventEmitter(sourceObj)) {
        var source_3 = sourceObj;
        sourceObj.addListener(eventName, handler);
        unsubscribe = function () { return source_3.removeListener(eventName, handler); };
    }
    else if (sourceObj && sourceObj.length) {
        for (var i = 0, len = sourceObj.length; i < len; i++) {
            setupSubscription(sourceObj[i], eventName, handler, subscriber, options);
        }
    }
    else {
        throw new TypeError('Invalid event target');
    }
    subscriber.add(unsubscribe);
}
function isNodeStyleEventEmitter(sourceObj) {
    return sourceObj && typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function';
}
function isJQueryStyleEventEmitter(sourceObj) {
    return sourceObj && typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function';
}
function isEventTarget(sourceObj) {
    return sourceObj && typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function';
}
//# sourceMappingURL=fromEvent.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/fromEventPattern.js":
/*!*****************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/fromEventPattern.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromEventPattern: () => (/* binding */ fromEventPattern)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/isFunction */ "../../node_modules/rxjs/_esm5/internal/util/isFunction.js");
/* harmony import */ var _operators_map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../operators/map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */




function fromEventPattern(addHandler, removeHandler, resultSelector) {
    if (resultSelector) {
        return fromEventPattern(addHandler, removeHandler).pipe((0,_operators_map__WEBPACK_IMPORTED_MODULE_0__.map)(function (args) { return (0,_util_isArray__WEBPACK_IMPORTED_MODULE_1__.isArray)(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(function (subscriber) {
        var handler = function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return subscriber.next(e.length === 1 ? e[0] : e);
        };
        var retValue;
        try {
            retValue = addHandler(handler);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        if (!(0,_util_isFunction__WEBPACK_IMPORTED_MODULE_3__.isFunction)(removeHandler)) {
            return undefined;
        }
        return function () { return removeHandler(handler, retValue); };
    });
}
//# sourceMappingURL=fromEventPattern.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/generate.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/generate.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generate: () => (/* binding */ generate)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/identity */ "../../node_modules/rxjs/_esm5/internal/util/identity.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/** PURE_IMPORTS_START _Observable,_util_identity,_util_isScheduler PURE_IMPORTS_END */



function generate(initialStateOrOptions, condition, iterate, resultSelectorOrObservable, scheduler) {
    var resultSelector;
    var initialState;
    if (arguments.length == 1) {
        var options = initialStateOrOptions;
        initialState = options.initialState;
        condition = options.condition;
        iterate = options.iterate;
        resultSelector = options.resultSelector || _util_identity__WEBPACK_IMPORTED_MODULE_0__.identity;
        scheduler = options.scheduler;
    }
    else if (resultSelectorOrObservable === undefined || (0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(resultSelectorOrObservable)) {
        initialState = initialStateOrOptions;
        resultSelector = _util_identity__WEBPACK_IMPORTED_MODULE_0__.identity;
        scheduler = resultSelectorOrObservable;
    }
    else {
        initialState = initialStateOrOptions;
        resultSelector = resultSelectorOrObservable;
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(function (subscriber) {
        var state = initialState;
        if (scheduler) {
            return scheduler.schedule(dispatch, 0, {
                subscriber: subscriber,
                iterate: iterate,
                condition: condition,
                resultSelector: resultSelector,
                state: state
            });
        }
        do {
            if (condition) {
                var conditionResult = void 0;
                try {
                    conditionResult = condition(state);
                }
                catch (err) {
                    subscriber.error(err);
                    return undefined;
                }
                if (!conditionResult) {
                    subscriber.complete();
                    break;
                }
            }
            var value = void 0;
            try {
                value = resultSelector(state);
            }
            catch (err) {
                subscriber.error(err);
                return undefined;
            }
            subscriber.next(value);
            if (subscriber.closed) {
                break;
            }
            try {
                state = iterate(state);
            }
            catch (err) {
                subscriber.error(err);
                return undefined;
            }
        } while (true);
        return undefined;
    });
}
function dispatch(state) {
    var subscriber = state.subscriber, condition = state.condition;
    if (subscriber.closed) {
        return undefined;
    }
    if (state.needIterate) {
        try {
            state.state = state.iterate(state.state);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
    }
    else {
        state.needIterate = true;
    }
    if (condition) {
        var conditionResult = void 0;
        try {
            conditionResult = condition(state.state);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        if (!conditionResult) {
            subscriber.complete();
            return undefined;
        }
        if (subscriber.closed) {
            return undefined;
        }
    }
    var value;
    try {
        value = state.resultSelector(state.state);
    }
    catch (err) {
        subscriber.error(err);
        return undefined;
    }
    if (subscriber.closed) {
        return undefined;
    }
    subscriber.next(value);
    if (subscriber.closed) {
        return undefined;
    }
    return this.schedule(state);
}
//# sourceMappingURL=generate.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/iif.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/iif.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   iif: () => (/* binding */ iif)
/* harmony export */ });
/* harmony import */ var _defer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./defer */ "../../node_modules/rxjs/_esm5/internal/observable/defer.js");
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/** PURE_IMPORTS_START _defer,_empty PURE_IMPORTS_END */


function iif(condition, trueResult, falseResult) {
    if (trueResult === void 0) {
        trueResult = _empty__WEBPACK_IMPORTED_MODULE_0__.EMPTY;
    }
    if (falseResult === void 0) {
        falseResult = _empty__WEBPACK_IMPORTED_MODULE_0__.EMPTY;
    }
    return (0,_defer__WEBPACK_IMPORTED_MODULE_1__.defer)(function () { return condition() ? trueResult : falseResult; });
}
//# sourceMappingURL=iif.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/interval.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/interval.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   interval: () => (/* binding */ interval)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _util_isNumeric__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isNumeric */ "../../node_modules/rxjs/_esm5/internal/util/isNumeric.js");
/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric PURE_IMPORTS_END */



function interval(period, scheduler) {
    if (period === void 0) {
        period = 0;
    }
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    if (!(0,_util_isNumeric__WEBPACK_IMPORTED_MODULE_1__.isNumeric)(period) || period < 0) {
        period = 0;
    }
    if (!scheduler || typeof scheduler.schedule !== 'function') {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(function (subscriber) {
        subscriber.add(scheduler.schedule(dispatch, period, { subscriber: subscriber, counter: 0, period: period }));
        return subscriber;
    });
}
function dispatch(state) {
    var subscriber = state.subscriber, counter = state.counter, period = state.period;
    subscriber.next(counter);
    this.schedule({ subscriber: subscriber, counter: counter + 1, period: period }, period);
}
//# sourceMappingURL=interval.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/merge.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/merge.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   merge: () => (/* binding */ merge)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/* harmony import */ var _operators_mergeAll__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../operators/mergeAll */ "../../node_modules/rxjs/_esm5/internal/operators/mergeAll.js");
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./fromArray */ "../../node_modules/rxjs/_esm5/internal/observable/fromArray.js");
/** PURE_IMPORTS_START _Observable,_util_isScheduler,_operators_mergeAll,_fromArray PURE_IMPORTS_END */




function merge() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var concurrent = Number.POSITIVE_INFINITY;
    var scheduler = null;
    var last = observables[observables.length - 1];
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_0__.isScheduler)(last)) {
        scheduler = observables.pop();
        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
            concurrent = observables.pop();
        }
    }
    else if (typeof last === 'number') {
        concurrent = observables.pop();
    }
    if (scheduler === null && observables.length === 1 && observables[0] instanceof _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable) {
        return observables[0];
    }
    return (0,_operators_mergeAll__WEBPACK_IMPORTED_MODULE_2__.mergeAll)(concurrent)((0,_fromArray__WEBPACK_IMPORTED_MODULE_3__.fromArray)(observables, scheduler));
}
//# sourceMappingURL=merge.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/never.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/never.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NEVER: () => (/* binding */ NEVER),
/* harmony export */   never: () => (/* binding */ never)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/noop */ "../../node_modules/rxjs/_esm5/internal/util/noop.js");
/** PURE_IMPORTS_START _Observable,_util_noop PURE_IMPORTS_END */


var NEVER = /*@__PURE__*/ new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(_util_noop__WEBPACK_IMPORTED_MODULE_1__.noop);
function never() {
    return NEVER;
}
//# sourceMappingURL=never.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/of.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/of.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   of: () => (/* binding */ of)
/* harmony export */ });
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fromArray */ "../../node_modules/rxjs/_esm5/internal/observable/fromArray.js");
/* harmony import */ var _scheduled_scheduleArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scheduled/scheduleArray */ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduleArray.js");
/** PURE_IMPORTS_START _util_isScheduler,_fromArray,_scheduled_scheduleArray PURE_IMPORTS_END */



function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args[args.length - 1];
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_0__.isScheduler)(scheduler)) {
        args.pop();
        return (0,_scheduled_scheduleArray__WEBPACK_IMPORTED_MODULE_1__.scheduleArray)(args, scheduler);
    }
    else {
        return (0,_fromArray__WEBPACK_IMPORTED_MODULE_2__.fromArray)(args);
    }
}
//# sourceMappingURL=of.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/onErrorResumeNext.js":
/*!******************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/onErrorResumeNext.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   onErrorResumeNext: () => (/* binding */ onErrorResumeNext)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/** PURE_IMPORTS_START _Observable,_from,_util_isArray,_empty PURE_IMPORTS_END */




function onErrorResumeNext() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    if (sources.length === 0) {
        return _empty__WEBPACK_IMPORTED_MODULE_0__.EMPTY;
    }
    var first = sources[0], remainder = sources.slice(1);
    if (sources.length === 1 && (0,_util_isArray__WEBPACK_IMPORTED_MODULE_1__.isArray)(first)) {
        return onErrorResumeNext.apply(void 0, first);
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(function (subscriber) {
        var subNext = function () { return subscriber.add(onErrorResumeNext.apply(void 0, remainder).subscribe(subscriber)); };
        return (0,_from__WEBPACK_IMPORTED_MODULE_3__.from)(first).subscribe({
            next: function (value) { subscriber.next(value); },
            error: subNext,
            complete: subNext,
        });
    });
}
//# sourceMappingURL=onErrorResumeNext.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/pairs.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/pairs.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dispatch: () => (/* binding */ dispatch),
/* harmony export */   pairs: () => (/* binding */ pairs)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */


function pairs(obj, scheduler) {
    if (!scheduler) {
        return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length && !subscriber.closed; i++) {
                var key = keys[i];
                if (obj.hasOwnProperty(key)) {
                    subscriber.next([key, obj[key]]);
                }
            }
            subscriber.complete();
        });
    }
    else {
        return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
            var keys = Object.keys(obj);
            var subscription = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
            subscription.add(scheduler.schedule(dispatch, 0, { keys: keys, index: 0, subscriber: subscriber, subscription: subscription, obj: obj }));
            return subscription;
        });
    }
}
function dispatch(state) {
    var keys = state.keys, index = state.index, subscriber = state.subscriber, subscription = state.subscription, obj = state.obj;
    if (!subscriber.closed) {
        if (index < keys.length) {
            var key = keys[index];
            subscriber.next([key, obj[key]]);
            subscription.add(this.schedule({ keys: keys, index: index + 1, subscriber: subscriber, subscription: subscription, obj: obj }));
        }
        else {
            subscriber.complete();
        }
    }
}
//# sourceMappingURL=pairs.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/partition.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/partition.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   partition: () => (/* binding */ partition)
/* harmony export */ });
/* harmony import */ var _util_not__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/not */ "../../node_modules/rxjs/_esm5/internal/util/not.js");
/* harmony import */ var _util_subscribeTo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/subscribeTo */ "../../node_modules/rxjs/_esm5/internal/util/subscribeTo.js");
/* harmony import */ var _operators_filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../operators/filter */ "../../node_modules/rxjs/_esm5/internal/operators/filter.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/** PURE_IMPORTS_START _util_not,_util_subscribeTo,_operators_filter,_Observable PURE_IMPORTS_END */




function partition(source, predicate, thisArg) {
    return [
        (0,_operators_filter__WEBPACK_IMPORTED_MODULE_0__.filter)(predicate, thisArg)(new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable((0,_util_subscribeTo__WEBPACK_IMPORTED_MODULE_2__.subscribeTo)(source))),
        (0,_operators_filter__WEBPACK_IMPORTED_MODULE_0__.filter)((0,_util_not__WEBPACK_IMPORTED_MODULE_3__.not)(predicate, thisArg))(new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable((0,_util_subscribeTo__WEBPACK_IMPORTED_MODULE_2__.subscribeTo)(source)))
    ];
}
//# sourceMappingURL=partition.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/race.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/race.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RaceOperator: () => (/* binding */ RaceOperator),
/* harmony export */   RaceSubscriber: () => (/* binding */ RaceSubscriber),
/* harmony export */   race: () => (/* binding */ race)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fromArray */ "../../node_modules/rxjs/_esm5/internal/observable/fromArray.js");
/* harmony import */ var _OuterSubscriber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../OuterSubscriber */ "../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js");
/* harmony import */ var _util_subscribeToResult__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/subscribeToResult */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js");
/** PURE_IMPORTS_START tslib,_util_isArray,_fromArray,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */





function race() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    if (observables.length === 1) {
        if ((0,_util_isArray__WEBPACK_IMPORTED_MODULE_0__.isArray)(observables[0])) {
            observables = observables[0];
        }
        else {
            return observables[0];
        }
    }
    return (0,_fromArray__WEBPACK_IMPORTED_MODULE_1__.fromArray)(observables, undefined).lift(new RaceOperator());
}
var RaceOperator = /*@__PURE__*/ (function () {
    function RaceOperator() {
    }
    RaceOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new RaceSubscriber(subscriber));
    };
    return RaceOperator;
}());

var RaceSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(RaceSubscriber, _super);
    function RaceSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.hasFirst = false;
        _this.observables = [];
        _this.subscriptions = [];
        return _this;
    }
    RaceSubscriber.prototype._next = function (observable) {
        this.observables.push(observable);
    };
    RaceSubscriber.prototype._complete = function () {
        var observables = this.observables;
        var len = observables.length;
        if (len === 0) {
            this.destination.complete();
        }
        else {
            for (var i = 0; i < len && !this.hasFirst; i++) {
                var observable = observables[i];
                var subscription = (0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_3__.subscribeToResult)(this, observable, undefined, i);
                if (this.subscriptions) {
                    this.subscriptions.push(subscription);
                }
                this.add(subscription);
            }
            this.observables = null;
        }
    };
    RaceSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        if (!this.hasFirst) {
            this.hasFirst = true;
            for (var i = 0; i < this.subscriptions.length; i++) {
                if (i !== outerIndex) {
                    var subscription = this.subscriptions[i];
                    subscription.unsubscribe();
                    this.remove(subscription);
                }
            }
            this.subscriptions = null;
        }
        this.destination.next(innerValue);
    };
    return RaceSubscriber;
}(_OuterSubscriber__WEBPACK_IMPORTED_MODULE_4__.OuterSubscriber));

//# sourceMappingURL=race.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/range.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/range.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dispatch: () => (/* binding */ dispatch),
/* harmony export */   range: () => (/* binding */ range)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

function range(start, count, scheduler) {
    if (start === void 0) {
        start = 0;
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        if (count === undefined) {
            count = start;
            start = 0;
        }
        var index = 0;
        var current = start;
        if (scheduler) {
            return scheduler.schedule(dispatch, 0, {
                index: index, count: count, start: start, subscriber: subscriber
            });
        }
        else {
            do {
                if (index++ >= count) {
                    subscriber.complete();
                    break;
                }
                subscriber.next(current++);
                if (subscriber.closed) {
                    break;
                }
            } while (true);
        }
        return undefined;
    });
}
function dispatch(state) {
    var start = state.start, index = state.index, count = state.count, subscriber = state.subscriber;
    if (index >= count) {
        subscriber.complete();
        return;
    }
    subscriber.next(start);
    if (subscriber.closed) {
        return;
    }
    state.index = index + 1;
    state.start = start + 1;
    this.schedule(state);
}
//# sourceMappingURL=range.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/throwError.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/throwError.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   throwError: () => (/* binding */ throwError)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

function throwError(error, scheduler) {
    if (!scheduler) {
        return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) { return subscriber.error(error); });
    }
    else {
        return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) { return scheduler.schedule(dispatch, 0, { error: error, subscriber: subscriber }); });
    }
}
function dispatch(_a) {
    var error = _a.error, subscriber = _a.subscriber;
    subscriber.error(error);
}
//# sourceMappingURL=throwError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/timer.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/timer.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   timer: () => (/* binding */ timer)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _util_isNumeric__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isNumeric */ "../../node_modules/rxjs/_esm5/internal/util/isNumeric.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */




function timer(dueTime, periodOrScheduler, scheduler) {
    if (dueTime === void 0) {
        dueTime = 0;
    }
    var period = -1;
    if ((0,_util_isNumeric__WEBPACK_IMPORTED_MODULE_0__.isNumeric)(periodOrScheduler)) {
        period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
    }
    else if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(periodOrScheduler)) {
        scheduler = periodOrScheduler;
    }
    if (!(0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(scheduler)) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_2__.async;
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_3__.Observable(function (subscriber) {
        var due = (0,_util_isNumeric__WEBPACK_IMPORTED_MODULE_0__.isNumeric)(dueTime)
            ? dueTime
            : (+dueTime - scheduler.now());
        return scheduler.schedule(dispatch, due, {
            index: 0, period: period, subscriber: subscriber
        });
    });
}
function dispatch(state) {
    var index = state.index, period = state.period, subscriber = state.subscriber;
    subscriber.next(index);
    if (subscriber.closed) {
        return;
    }
    else if (period === -1) {
        return subscriber.complete();
    }
    state.index = index + 1;
    this.schedule(state, period);
}
//# sourceMappingURL=timer.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/using.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/using.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   using: () => (/* binding */ using)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */



function using(resourceFactory, observableFactory) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var resource;
        try {
            resource = resourceFactory();
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        var result;
        try {
            result = observableFactory(resource);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        var source = result ? (0,_from__WEBPACK_IMPORTED_MODULE_1__.from)(result) : _empty__WEBPACK_IMPORTED_MODULE_2__.EMPTY;
        var subscription = source.subscribe(subscriber);
        return function () {
            subscription.unsubscribe();
            if (resource) {
                resource.unsubscribe();
            }
        };
    });
}
//# sourceMappingURL=using.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/observable/zip.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/observable/zip.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ZipOperator: () => (/* binding */ ZipOperator),
/* harmony export */   ZipSubscriber: () => (/* binding */ ZipSubscriber),
/* harmony export */   zip: () => (/* binding */ zip)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fromArray */ "../../node_modules/rxjs/_esm5/internal/observable/fromArray.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _internal_symbol_iterator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../internal/symbol/iterator */ "../../node_modules/rxjs/_esm5/internal/symbol/iterator.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_fromArray,_util_isArray,_Subscriber,_.._internal_symbol_iterator,_innerSubscribe PURE_IMPORTS_END */






function zip() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var resultSelector = observables[observables.length - 1];
    if (typeof resultSelector === 'function') {
        observables.pop();
    }
    return (0,_fromArray__WEBPACK_IMPORTED_MODULE_0__.fromArray)(observables, undefined).lift(new ZipOperator(resultSelector));
}
var ZipOperator = /*@__PURE__*/ (function () {
    function ZipOperator(resultSelector) {
        this.resultSelector = resultSelector;
    }
    ZipOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ZipSubscriber(subscriber, this.resultSelector));
    };
    return ZipOperator;
}());

var ZipSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_1__.__extends(ZipSubscriber, _super);
    function ZipSubscriber(destination, resultSelector, values) {
        if (values === void 0) {
            values = Object.create(null);
        }
        var _this = _super.call(this, destination) || this;
        _this.resultSelector = resultSelector;
        _this.iterators = [];
        _this.active = 0;
        _this.resultSelector = (typeof resultSelector === 'function') ? resultSelector : undefined;
        return _this;
    }
    ZipSubscriber.prototype._next = function (value) {
        var iterators = this.iterators;
        if ((0,_util_isArray__WEBPACK_IMPORTED_MODULE_2__.isArray)(value)) {
            iterators.push(new StaticArrayIterator(value));
        }
        else if (typeof value[_internal_symbol_iterator__WEBPACK_IMPORTED_MODULE_3__.iterator] === 'function') {
            iterators.push(new StaticIterator(value[_internal_symbol_iterator__WEBPACK_IMPORTED_MODULE_3__.iterator]()));
        }
        else {
            iterators.push(new ZipBufferIterator(this.destination, this, value));
        }
    };
    ZipSubscriber.prototype._complete = function () {
        var iterators = this.iterators;
        var len = iterators.length;
        this.unsubscribe();
        if (len === 0) {
            this.destination.complete();
            return;
        }
        this.active = len;
        for (var i = 0; i < len; i++) {
            var iterator = iterators[i];
            if (iterator.stillUnsubscribed) {
                var destination = this.destination;
                destination.add(iterator.subscribe());
            }
            else {
                this.active--;
            }
        }
    };
    ZipSubscriber.prototype.notifyInactive = function () {
        this.active--;
        if (this.active === 0) {
            this.destination.complete();
        }
    };
    ZipSubscriber.prototype.checkIterators = function () {
        var iterators = this.iterators;
        var len = iterators.length;
        var destination = this.destination;
        for (var i = 0; i < len; i++) {
            var iterator = iterators[i];
            if (typeof iterator.hasValue === 'function' && !iterator.hasValue()) {
                return;
            }
        }
        var shouldComplete = false;
        var args = [];
        for (var i = 0; i < len; i++) {
            var iterator = iterators[i];
            var result = iterator.next();
            if (iterator.hasCompleted()) {
                shouldComplete = true;
            }
            if (result.done) {
                destination.complete();
                return;
            }
            args.push(result.value);
        }
        if (this.resultSelector) {
            this._tryresultSelector(args);
        }
        else {
            destination.next(args);
        }
        if (shouldComplete) {
            destination.complete();
        }
    };
    ZipSubscriber.prototype._tryresultSelector = function (args) {
        var result;
        try {
            result = this.resultSelector.apply(this, args);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return ZipSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_4__.Subscriber));

var StaticIterator = /*@__PURE__*/ (function () {
    function StaticIterator(iterator) {
        this.iterator = iterator;
        this.nextResult = iterator.next();
    }
    StaticIterator.prototype.hasValue = function () {
        return true;
    };
    StaticIterator.prototype.next = function () {
        var result = this.nextResult;
        this.nextResult = this.iterator.next();
        return result;
    };
    StaticIterator.prototype.hasCompleted = function () {
        var nextResult = this.nextResult;
        return Boolean(nextResult && nextResult.done);
    };
    return StaticIterator;
}());
var StaticArrayIterator = /*@__PURE__*/ (function () {
    function StaticArrayIterator(array) {
        this.array = array;
        this.index = 0;
        this.length = 0;
        this.length = array.length;
    }
    StaticArrayIterator.prototype[_internal_symbol_iterator__WEBPACK_IMPORTED_MODULE_3__.iterator] = function () {
        return this;
    };
    StaticArrayIterator.prototype.next = function (value) {
        var i = this.index++;
        var array = this.array;
        return i < this.length ? { value: array[i], done: false } : { value: null, done: true };
    };
    StaticArrayIterator.prototype.hasValue = function () {
        return this.array.length > this.index;
    };
    StaticArrayIterator.prototype.hasCompleted = function () {
        return this.array.length === this.index;
    };
    return StaticArrayIterator;
}());
var ZipBufferIterator = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_1__.__extends(ZipBufferIterator, _super);
    function ZipBufferIterator(destination, parent, observable) {
        var _this = _super.call(this, destination) || this;
        _this.parent = parent;
        _this.observable = observable;
        _this.stillUnsubscribed = true;
        _this.buffer = [];
        _this.isComplete = false;
        return _this;
    }
    ZipBufferIterator.prototype[_internal_symbol_iterator__WEBPACK_IMPORTED_MODULE_3__.iterator] = function () {
        return this;
    };
    ZipBufferIterator.prototype.next = function () {
        var buffer = this.buffer;
        if (buffer.length === 0 && this.isComplete) {
            return { value: null, done: true };
        }
        else {
            return { value: buffer.shift(), done: false };
        }
    };
    ZipBufferIterator.prototype.hasValue = function () {
        return this.buffer.length > 0;
    };
    ZipBufferIterator.prototype.hasCompleted = function () {
        return this.buffer.length === 0 && this.isComplete;
    };
    ZipBufferIterator.prototype.notifyComplete = function () {
        if (this.buffer.length > 0) {
            this.isComplete = true;
            this.parent.notifyInactive();
        }
        else {
            this.destination.complete();
        }
    };
    ZipBufferIterator.prototype.notifyNext = function (innerValue) {
        this.buffer.push(innerValue);
        this.parent.checkIterators();
    };
    ZipBufferIterator.prototype.subscribe = function () {
        return (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_5__.innerSubscribe)(this.observable, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_5__.SimpleInnerSubscriber(this));
    };
    return ZipBufferIterator;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_5__.SimpleOuterSubscriber));
//# sourceMappingURL=zip.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/audit.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/audit.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   audit: () => (/* binding */ audit)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function audit(durationSelector) {
    return function auditOperatorFunction(source) {
        return source.lift(new AuditOperator(durationSelector));
    };
}
var AuditOperator = /*@__PURE__*/ (function () {
    function AuditOperator(durationSelector) {
        this.durationSelector = durationSelector;
    }
    AuditOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new AuditSubscriber(subscriber, this.durationSelector));
    };
    return AuditOperator;
}());
var AuditSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AuditSubscriber, _super);
    function AuditSubscriber(destination, durationSelector) {
        var _this = _super.call(this, destination) || this;
        _this.durationSelector = durationSelector;
        _this.hasValue = false;
        return _this;
    }
    AuditSubscriber.prototype._next = function (value) {
        this.value = value;
        this.hasValue = true;
        if (!this.throttled) {
            var duration = void 0;
            try {
                var durationSelector = this.durationSelector;
                duration = durationSelector(value);
            }
            catch (err) {
                return this.destination.error(err);
            }
            var innerSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(duration, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(this));
            if (!innerSubscription || innerSubscription.closed) {
                this.clearThrottle();
            }
            else {
                this.add(this.throttled = innerSubscription);
            }
        }
    };
    AuditSubscriber.prototype.clearThrottle = function () {
        var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
        if (throttled) {
            this.remove(throttled);
            this.throttled = undefined;
            throttled.unsubscribe();
        }
        if (hasValue) {
            this.value = undefined;
            this.hasValue = false;
            this.destination.next(value);
        }
    };
    AuditSubscriber.prototype.notifyNext = function () {
        this.clearThrottle();
    };
    AuditSubscriber.prototype.notifyComplete = function () {
        this.clearThrottle();
    };
    return AuditSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));
//# sourceMappingURL=audit.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/auditTime.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/auditTime.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   auditTime: () => (/* binding */ auditTime)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _audit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./audit */ "../../node_modules/rxjs/_esm5/internal/operators/audit.js");
/* harmony import */ var _observable_timer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/timer */ "../../node_modules/rxjs/_esm5/internal/observable/timer.js");
/** PURE_IMPORTS_START _scheduler_async,_audit,_observable_timer PURE_IMPORTS_END */



function auditTime(duration, scheduler) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    return (0,_audit__WEBPACK_IMPORTED_MODULE_1__.audit)(function () { return (0,_observable_timer__WEBPACK_IMPORTED_MODULE_2__.timer)(duration, scheduler); });
}
//# sourceMappingURL=auditTime.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/buffer.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/buffer.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buffer: () => (/* binding */ buffer)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function buffer(closingNotifier) {
    return function bufferOperatorFunction(source) {
        return source.lift(new BufferOperator(closingNotifier));
    };
}
var BufferOperator = /*@__PURE__*/ (function () {
    function BufferOperator(closingNotifier) {
        this.closingNotifier = closingNotifier;
    }
    BufferOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new BufferSubscriber(subscriber, this.closingNotifier));
    };
    return BufferOperator;
}());
var BufferSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(BufferSubscriber, _super);
    function BufferSubscriber(destination, closingNotifier) {
        var _this = _super.call(this, destination) || this;
        _this.buffer = [];
        _this.add((0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(closingNotifier, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(_this)));
        return _this;
    }
    BufferSubscriber.prototype._next = function (value) {
        this.buffer.push(value);
    };
    BufferSubscriber.prototype.notifyNext = function () {
        var buffer = this.buffer;
        this.buffer = [];
        this.destination.next(buffer);
    };
    return BufferSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));
//# sourceMappingURL=buffer.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/bufferCount.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/bufferCount.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bufferCount: () => (/* binding */ bufferCount)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function bufferCount(bufferSize, startBufferEvery) {
    if (startBufferEvery === void 0) {
        startBufferEvery = null;
    }
    return function bufferCountOperatorFunction(source) {
        return source.lift(new BufferCountOperator(bufferSize, startBufferEvery));
    };
}
var BufferCountOperator = /*@__PURE__*/ (function () {
    function BufferCountOperator(bufferSize, startBufferEvery) {
        this.bufferSize = bufferSize;
        this.startBufferEvery = startBufferEvery;
        if (!startBufferEvery || bufferSize === startBufferEvery) {
            this.subscriberClass = BufferCountSubscriber;
        }
        else {
            this.subscriberClass = BufferSkipCountSubscriber;
        }
    }
    BufferCountOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new this.subscriberClass(subscriber, this.bufferSize, this.startBufferEvery));
    };
    return BufferCountOperator;
}());
var BufferCountSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(BufferCountSubscriber, _super);
    function BufferCountSubscriber(destination, bufferSize) {
        var _this = _super.call(this, destination) || this;
        _this.bufferSize = bufferSize;
        _this.buffer = [];
        return _this;
    }
    BufferCountSubscriber.prototype._next = function (value) {
        var buffer = this.buffer;
        buffer.push(value);
        if (buffer.length == this.bufferSize) {
            this.destination.next(buffer);
            this.buffer = [];
        }
    };
    BufferCountSubscriber.prototype._complete = function () {
        var buffer = this.buffer;
        if (buffer.length > 0) {
            this.destination.next(buffer);
        }
        _super.prototype._complete.call(this);
    };
    return BufferCountSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
var BufferSkipCountSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(BufferSkipCountSubscriber, _super);
    function BufferSkipCountSubscriber(destination, bufferSize, startBufferEvery) {
        var _this = _super.call(this, destination) || this;
        _this.bufferSize = bufferSize;
        _this.startBufferEvery = startBufferEvery;
        _this.buffers = [];
        _this.count = 0;
        return _this;
    }
    BufferSkipCountSubscriber.prototype._next = function (value) {
        var _a = this, bufferSize = _a.bufferSize, startBufferEvery = _a.startBufferEvery, buffers = _a.buffers, count = _a.count;
        this.count++;
        if (count % startBufferEvery === 0) {
            buffers.push([]);
        }
        for (var i = buffers.length; i--;) {
            var buffer = buffers[i];
            buffer.push(value);
            if (buffer.length === bufferSize) {
                buffers.splice(i, 1);
                this.destination.next(buffer);
            }
        }
    };
    BufferSkipCountSubscriber.prototype._complete = function () {
        var _a = this, buffers = _a.buffers, destination = _a.destination;
        while (buffers.length > 0) {
            var buffer = buffers.shift();
            if (buffer.length > 0) {
                destination.next(buffer);
            }
        }
        _super.prototype._complete.call(this);
    };
    return BufferSkipCountSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=bufferCount.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/bufferTime.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/bufferTime.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bufferTime: () => (/* binding */ bufferTime)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/** PURE_IMPORTS_START tslib,_scheduler_async,_Subscriber,_util_isScheduler PURE_IMPORTS_END */




function bufferTime(bufferTimeSpan) {
    var length = arguments.length;
    var scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(arguments[arguments.length - 1])) {
        scheduler = arguments[arguments.length - 1];
        length--;
    }
    var bufferCreationInterval = null;
    if (length >= 2) {
        bufferCreationInterval = arguments[1];
    }
    var maxBufferSize = Number.POSITIVE_INFINITY;
    if (length >= 3) {
        maxBufferSize = arguments[2];
    }
    return function bufferTimeOperatorFunction(source) {
        return source.lift(new BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler));
    };
}
var BufferTimeOperator = /*@__PURE__*/ (function () {
    function BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
        this.bufferTimeSpan = bufferTimeSpan;
        this.bufferCreationInterval = bufferCreationInterval;
        this.maxBufferSize = maxBufferSize;
        this.scheduler = scheduler;
    }
    BufferTimeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new BufferTimeSubscriber(subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.maxBufferSize, this.scheduler));
    };
    return BufferTimeOperator;
}());
var Context = /*@__PURE__*/ (function () {
    function Context() {
        this.buffer = [];
    }
    return Context;
}());
var BufferTimeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(BufferTimeSubscriber, _super);
    function BufferTimeSubscriber(destination, bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.bufferTimeSpan = bufferTimeSpan;
        _this.bufferCreationInterval = bufferCreationInterval;
        _this.maxBufferSize = maxBufferSize;
        _this.scheduler = scheduler;
        _this.contexts = [];
        var context = _this.openContext();
        _this.timespanOnly = bufferCreationInterval == null || bufferCreationInterval < 0;
        if (_this.timespanOnly) {
            var timeSpanOnlyState = { subscriber: _this, context: context, bufferTimeSpan: bufferTimeSpan };
            _this.add(context.closeAction = scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
        }
        else {
            var closeState = { subscriber: _this, context: context };
            var creationState = { bufferTimeSpan: bufferTimeSpan, bufferCreationInterval: bufferCreationInterval, subscriber: _this, scheduler: scheduler };
            _this.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
            _this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
        }
        return _this;
    }
    BufferTimeSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        var len = contexts.length;
        var filledBufferContext;
        for (var i = 0; i < len; i++) {
            var context_1 = contexts[i];
            var buffer = context_1.buffer;
            buffer.push(value);
            if (buffer.length == this.maxBufferSize) {
                filledBufferContext = context_1;
            }
        }
        if (filledBufferContext) {
            this.onBufferFull(filledBufferContext);
        }
    };
    BufferTimeSubscriber.prototype._error = function (err) {
        this.contexts.length = 0;
        _super.prototype._error.call(this, err);
    };
    BufferTimeSubscriber.prototype._complete = function () {
        var _a = this, contexts = _a.contexts, destination = _a.destination;
        while (contexts.length > 0) {
            var context_2 = contexts.shift();
            destination.next(context_2.buffer);
        }
        _super.prototype._complete.call(this);
    };
    BufferTimeSubscriber.prototype._unsubscribe = function () {
        this.contexts = null;
    };
    BufferTimeSubscriber.prototype.onBufferFull = function (context) {
        this.closeContext(context);
        var closeAction = context.closeAction;
        closeAction.unsubscribe();
        this.remove(closeAction);
        if (!this.closed && this.timespanOnly) {
            context = this.openContext();
            var bufferTimeSpan = this.bufferTimeSpan;
            var timeSpanOnlyState = { subscriber: this, context: context, bufferTimeSpan: bufferTimeSpan };
            this.add(context.closeAction = this.scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
        }
    };
    BufferTimeSubscriber.prototype.openContext = function () {
        var context = new Context();
        this.contexts.push(context);
        return context;
    };
    BufferTimeSubscriber.prototype.closeContext = function (context) {
        this.destination.next(context.buffer);
        var contexts = this.contexts;
        var spliceIndex = contexts ? contexts.indexOf(context) : -1;
        if (spliceIndex >= 0) {
            contexts.splice(contexts.indexOf(context), 1);
        }
    };
    return BufferTimeSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_3__.Subscriber));
function dispatchBufferTimeSpanOnly(state) {
    var subscriber = state.subscriber;
    var prevContext = state.context;
    if (prevContext) {
        subscriber.closeContext(prevContext);
    }
    if (!subscriber.closed) {
        state.context = subscriber.openContext();
        state.context.closeAction = this.schedule(state, state.bufferTimeSpan);
    }
}
function dispatchBufferCreation(state) {
    var bufferCreationInterval = state.bufferCreationInterval, bufferTimeSpan = state.bufferTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler;
    var context = subscriber.openContext();
    var action = this;
    if (!subscriber.closed) {
        subscriber.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber: subscriber, context: context }));
        action.schedule(state, bufferCreationInterval);
    }
}
function dispatchBufferClose(arg) {
    var subscriber = arg.subscriber, context = arg.context;
    subscriber.closeContext(context);
}
//# sourceMappingURL=bufferTime.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/bufferToggle.js":
/*!************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/bufferToggle.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bufferToggle: () => (/* binding */ bufferToggle)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/subscribeToResult */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js");
/* harmony import */ var _OuterSubscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../OuterSubscriber */ "../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js");
/** PURE_IMPORTS_START tslib,_Subscription,_util_subscribeToResult,_OuterSubscriber PURE_IMPORTS_END */




function bufferToggle(openings, closingSelector) {
    return function bufferToggleOperatorFunction(source) {
        return source.lift(new BufferToggleOperator(openings, closingSelector));
    };
}
var BufferToggleOperator = /*@__PURE__*/ (function () {
    function BufferToggleOperator(openings, closingSelector) {
        this.openings = openings;
        this.closingSelector = closingSelector;
    }
    BufferToggleOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new BufferToggleSubscriber(subscriber, this.openings, this.closingSelector));
    };
    return BufferToggleOperator;
}());
var BufferToggleSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(BufferToggleSubscriber, _super);
    function BufferToggleSubscriber(destination, openings, closingSelector) {
        var _this = _super.call(this, destination) || this;
        _this.closingSelector = closingSelector;
        _this.contexts = [];
        _this.add((0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__.subscribeToResult)(_this, openings));
        return _this;
    }
    BufferToggleSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        var len = contexts.length;
        for (var i = 0; i < len; i++) {
            contexts[i].buffer.push(value);
        }
    };
    BufferToggleSubscriber.prototype._error = function (err) {
        var contexts = this.contexts;
        while (contexts.length > 0) {
            var context_1 = contexts.shift();
            context_1.subscription.unsubscribe();
            context_1.buffer = null;
            context_1.subscription = null;
        }
        this.contexts = null;
        _super.prototype._error.call(this, err);
    };
    BufferToggleSubscriber.prototype._complete = function () {
        var contexts = this.contexts;
        while (contexts.length > 0) {
            var context_2 = contexts.shift();
            this.destination.next(context_2.buffer);
            context_2.subscription.unsubscribe();
            context_2.buffer = null;
            context_2.subscription = null;
        }
        this.contexts = null;
        _super.prototype._complete.call(this);
    };
    BufferToggleSubscriber.prototype.notifyNext = function (outerValue, innerValue) {
        outerValue ? this.closeBuffer(outerValue) : this.openBuffer(innerValue);
    };
    BufferToggleSubscriber.prototype.notifyComplete = function (innerSub) {
        this.closeBuffer(innerSub.context);
    };
    BufferToggleSubscriber.prototype.openBuffer = function (value) {
        try {
            var closingSelector = this.closingSelector;
            var closingNotifier = closingSelector.call(this, value);
            if (closingNotifier) {
                this.trySubscribe(closingNotifier);
            }
        }
        catch (err) {
            this._error(err);
        }
    };
    BufferToggleSubscriber.prototype.closeBuffer = function (context) {
        var contexts = this.contexts;
        if (contexts && context) {
            var buffer = context.buffer, subscription = context.subscription;
            this.destination.next(buffer);
            contexts.splice(contexts.indexOf(context), 1);
            this.remove(subscription);
            subscription.unsubscribe();
        }
    };
    BufferToggleSubscriber.prototype.trySubscribe = function (closingNotifier) {
        var contexts = this.contexts;
        var buffer = [];
        var subscription = new _Subscription__WEBPACK_IMPORTED_MODULE_2__.Subscription();
        var context = { buffer: buffer, subscription: subscription };
        contexts.push(context);
        var innerSubscription = (0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__.subscribeToResult)(this, closingNotifier, context);
        if (!innerSubscription || innerSubscription.closed) {
            this.closeBuffer(context);
        }
        else {
            innerSubscription.context = context;
            this.add(innerSubscription);
            subscription.add(innerSubscription);
        }
    };
    return BufferToggleSubscriber;
}(_OuterSubscriber__WEBPACK_IMPORTED_MODULE_3__.OuterSubscriber));
//# sourceMappingURL=bufferToggle.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/bufferWhen.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/bufferWhen.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bufferWhen: () => (/* binding */ bufferWhen)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_Subscription,_innerSubscribe PURE_IMPORTS_END */



function bufferWhen(closingSelector) {
    return function (source) {
        return source.lift(new BufferWhenOperator(closingSelector));
    };
}
var BufferWhenOperator = /*@__PURE__*/ (function () {
    function BufferWhenOperator(closingSelector) {
        this.closingSelector = closingSelector;
    }
    BufferWhenOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new BufferWhenSubscriber(subscriber, this.closingSelector));
    };
    return BufferWhenOperator;
}());
var BufferWhenSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(BufferWhenSubscriber, _super);
    function BufferWhenSubscriber(destination, closingSelector) {
        var _this = _super.call(this, destination) || this;
        _this.closingSelector = closingSelector;
        _this.subscribing = false;
        _this.openBuffer();
        return _this;
    }
    BufferWhenSubscriber.prototype._next = function (value) {
        this.buffer.push(value);
    };
    BufferWhenSubscriber.prototype._complete = function () {
        var buffer = this.buffer;
        if (buffer) {
            this.destination.next(buffer);
        }
        _super.prototype._complete.call(this);
    };
    BufferWhenSubscriber.prototype._unsubscribe = function () {
        this.buffer = undefined;
        this.subscribing = false;
    };
    BufferWhenSubscriber.prototype.notifyNext = function () {
        this.openBuffer();
    };
    BufferWhenSubscriber.prototype.notifyComplete = function () {
        if (this.subscribing) {
            this.complete();
        }
        else {
            this.openBuffer();
        }
    };
    BufferWhenSubscriber.prototype.openBuffer = function () {
        var closingSubscription = this.closingSubscription;
        if (closingSubscription) {
            this.remove(closingSubscription);
            closingSubscription.unsubscribe();
        }
        var buffer = this.buffer;
        if (this.buffer) {
            this.destination.next(buffer);
        }
        this.buffer = [];
        var closingNotifier;
        try {
            var closingSelector = this.closingSelector;
            closingNotifier = closingSelector();
        }
        catch (err) {
            return this.error(err);
        }
        closingSubscription = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
        this.closingSubscription = closingSubscription;
        this.add(closingSubscription);
        this.subscribing = true;
        closingSubscription.add((0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.innerSubscribe)(closingNotifier, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.SimpleInnerSubscriber(this)));
        this.subscribing = false;
    };
    return BufferWhenSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.SimpleOuterSubscriber));
//# sourceMappingURL=bufferWhen.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/catchError.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/catchError.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   catchError: () => (/* binding */ catchError)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function catchError(selector) {
    return function catchErrorOperatorFunction(source) {
        var operator = new CatchOperator(selector);
        var caught = source.lift(operator);
        return (operator.caught = caught);
    };
}
var CatchOperator = /*@__PURE__*/ (function () {
    function CatchOperator(selector) {
        this.selector = selector;
    }
    CatchOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
    };
    return CatchOperator;
}());
var CatchSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(CatchSubscriber, _super);
    function CatchSubscriber(destination, selector, caught) {
        var _this = _super.call(this, destination) || this;
        _this.selector = selector;
        _this.caught = caught;
        return _this;
    }
    CatchSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var result = void 0;
            try {
                result = this.selector(err, this.caught);
            }
            catch (err2) {
                _super.prototype.error.call(this, err2);
                return;
            }
            this._unsubscribeAndRecycle();
            var innerSubscriber = new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(this);
            this.add(innerSubscriber);
            var innerSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(result, innerSubscriber);
            if (innerSubscription !== innerSubscriber) {
                this.add(innerSubscription);
            }
        }
    };
    return CatchSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));
//# sourceMappingURL=catchError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/combineAll.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/combineAll.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   combineAll: () => (/* binding */ combineAll)
/* harmony export */ });
/* harmony import */ var _observable_combineLatest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/combineLatest */ "../../node_modules/rxjs/_esm5/internal/observable/combineLatest.js");
/** PURE_IMPORTS_START _observable_combineLatest PURE_IMPORTS_END */

function combineAll(project) {
    return function (source) { return source.lift(new _observable_combineLatest__WEBPACK_IMPORTED_MODULE_0__.CombineLatestOperator(project)); };
}
//# sourceMappingURL=combineAll.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/combineLatest.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/combineLatest.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   combineLatest: () => (/* binding */ combineLatest)
/* harmony export */ });
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _observable_combineLatest__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/combineLatest */ "../../node_modules/rxjs/_esm5/internal/observable/combineLatest.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/** PURE_IMPORTS_START _util_isArray,_observable_combineLatest,_observable_from PURE_IMPORTS_END */



var none = {};
function combineLatest() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var project = null;
    if (typeof observables[observables.length - 1] === 'function') {
        project = observables.pop();
    }
    if (observables.length === 1 && (0,_util_isArray__WEBPACK_IMPORTED_MODULE_0__.isArray)(observables[0])) {
        observables = observables[0].slice();
    }
    return function (source) { return source.lift.call((0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.from)([source].concat(observables)), new _observable_combineLatest__WEBPACK_IMPORTED_MODULE_2__.CombineLatestOperator(project)); };
}
//# sourceMappingURL=combineLatest.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/concat.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/concat.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   concat: () => (/* binding */ concat)
/* harmony export */ });
/* harmony import */ var _observable_concat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/concat */ "../../node_modules/rxjs/_esm5/internal/observable/concat.js");
/** PURE_IMPORTS_START _observable_concat PURE_IMPORTS_END */

function concat() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    return function (source) { return source.lift.call(_observable_concat__WEBPACK_IMPORTED_MODULE_0__.concat.apply(void 0, [source].concat(observables))); };
}
//# sourceMappingURL=concat.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/concatAll.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/concatAll.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   concatAll: () => (/* binding */ concatAll)
/* harmony export */ });
/* harmony import */ var _mergeAll__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergeAll */ "../../node_modules/rxjs/_esm5/internal/operators/mergeAll.js");
/** PURE_IMPORTS_START _mergeAll PURE_IMPORTS_END */

function concatAll() {
    return (0,_mergeAll__WEBPACK_IMPORTED_MODULE_0__.mergeAll)(1);
}
//# sourceMappingURL=concatAll.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/concatMap.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/concatMap.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   concatMap: () => (/* binding */ concatMap)
/* harmony export */ });
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergeMap */ "../../node_modules/rxjs/_esm5/internal/operators/mergeMap.js");
/** PURE_IMPORTS_START _mergeMap PURE_IMPORTS_END */

function concatMap(project, resultSelector) {
    return (0,_mergeMap__WEBPACK_IMPORTED_MODULE_0__.mergeMap)(project, resultSelector, 1);
}
//# sourceMappingURL=concatMap.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/concatMapTo.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/concatMapTo.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   concatMapTo: () => (/* binding */ concatMapTo)
/* harmony export */ });
/* harmony import */ var _concatMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./concatMap */ "../../node_modules/rxjs/_esm5/internal/operators/concatMap.js");
/** PURE_IMPORTS_START _concatMap PURE_IMPORTS_END */

function concatMapTo(innerObservable, resultSelector) {
    return (0,_concatMap__WEBPACK_IMPORTED_MODULE_0__.concatMap)(function () { return innerObservable; }, resultSelector);
}
//# sourceMappingURL=concatMapTo.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/count.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/count.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   count: () => (/* binding */ count)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function count(predicate) {
    return function (source) { return source.lift(new CountOperator(predicate, source)); };
}
var CountOperator = /*@__PURE__*/ (function () {
    function CountOperator(predicate, source) {
        this.predicate = predicate;
        this.source = source;
    }
    CountOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new CountSubscriber(subscriber, this.predicate, this.source));
    };
    return CountOperator;
}());
var CountSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(CountSubscriber, _super);
    function CountSubscriber(destination, predicate, source) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.source = source;
        _this.count = 0;
        _this.index = 0;
        return _this;
    }
    CountSubscriber.prototype._next = function (value) {
        if (this.predicate) {
            this._tryPredicate(value);
        }
        else {
            this.count++;
        }
    };
    CountSubscriber.prototype._tryPredicate = function (value) {
        var result;
        try {
            result = this.predicate(value, this.index++, this.source);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (result) {
            this.count++;
        }
    };
    CountSubscriber.prototype._complete = function () {
        this.destination.next(this.count);
        this.destination.complete();
    };
    return CountSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=count.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/debounce.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/debounce.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debounce: () => (/* binding */ debounce)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function debounce(durationSelector) {
    return function (source) { return source.lift(new DebounceOperator(durationSelector)); };
}
var DebounceOperator = /*@__PURE__*/ (function () {
    function DebounceOperator(durationSelector) {
        this.durationSelector = durationSelector;
    }
    DebounceOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DebounceSubscriber(subscriber, this.durationSelector));
    };
    return DebounceOperator;
}());
var DebounceSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(DebounceSubscriber, _super);
    function DebounceSubscriber(destination, durationSelector) {
        var _this = _super.call(this, destination) || this;
        _this.durationSelector = durationSelector;
        _this.hasValue = false;
        return _this;
    }
    DebounceSubscriber.prototype._next = function (value) {
        try {
            var result = this.durationSelector.call(this, value);
            if (result) {
                this._tryNext(value, result);
            }
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    DebounceSubscriber.prototype._complete = function () {
        this.emitValue();
        this.destination.complete();
    };
    DebounceSubscriber.prototype._tryNext = function (value, duration) {
        var subscription = this.durationSubscription;
        this.value = value;
        this.hasValue = true;
        if (subscription) {
            subscription.unsubscribe();
            this.remove(subscription);
        }
        subscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(duration, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(this));
        if (subscription && !subscription.closed) {
            this.add(this.durationSubscription = subscription);
        }
    };
    DebounceSubscriber.prototype.notifyNext = function () {
        this.emitValue();
    };
    DebounceSubscriber.prototype.notifyComplete = function () {
        this.emitValue();
    };
    DebounceSubscriber.prototype.emitValue = function () {
        if (this.hasValue) {
            var value = this.value;
            var subscription = this.durationSubscription;
            if (subscription) {
                this.durationSubscription = undefined;
                subscription.unsubscribe();
                this.remove(subscription);
            }
            this.value = undefined;
            this.hasValue = false;
            _super.prototype._next.call(this, value);
        }
    };
    return DebounceSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));
//# sourceMappingURL=debounce.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/debounceTime.js":
/*!************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/debounceTime.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debounceTime: () => (/* binding */ debounceTime)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */



function debounceTime(dueTime, scheduler) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    return function (source) { return source.lift(new DebounceTimeOperator(dueTime, scheduler)); };
}
var DebounceTimeOperator = /*@__PURE__*/ (function () {
    function DebounceTimeOperator(dueTime, scheduler) {
        this.dueTime = dueTime;
        this.scheduler = scheduler;
    }
    DebounceTimeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
    };
    return DebounceTimeOperator;
}());
var DebounceTimeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_1__.__extends(DebounceTimeSubscriber, _super);
    function DebounceTimeSubscriber(destination, dueTime, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.dueTime = dueTime;
        _this.scheduler = scheduler;
        _this.debouncedSubscription = null;
        _this.lastValue = null;
        _this.hasValue = false;
        return _this;
    }
    DebounceTimeSubscriber.prototype._next = function (value) {
        this.clearDebounce();
        this.lastValue = value;
        this.hasValue = true;
        this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
    };
    DebounceTimeSubscriber.prototype._complete = function () {
        this.debouncedNext();
        this.destination.complete();
    };
    DebounceTimeSubscriber.prototype.debouncedNext = function () {
        this.clearDebounce();
        if (this.hasValue) {
            var lastValue = this.lastValue;
            this.lastValue = null;
            this.hasValue = false;
            this.destination.next(lastValue);
        }
    };
    DebounceTimeSubscriber.prototype.clearDebounce = function () {
        var debouncedSubscription = this.debouncedSubscription;
        if (debouncedSubscription !== null) {
            this.remove(debouncedSubscription);
            debouncedSubscription.unsubscribe();
            this.debouncedSubscription = null;
        }
    };
    return DebounceTimeSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
function dispatchNext(subscriber) {
    subscriber.debouncedNext();
}
//# sourceMappingURL=debounceTime.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultIfEmpty: () => (/* binding */ defaultIfEmpty)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function defaultIfEmpty(defaultValue) {
    if (defaultValue === void 0) {
        defaultValue = null;
    }
    return function (source) { return source.lift(new DefaultIfEmptyOperator(defaultValue)); };
}
var DefaultIfEmptyOperator = /*@__PURE__*/ (function () {
    function DefaultIfEmptyOperator(defaultValue) {
        this.defaultValue = defaultValue;
    }
    DefaultIfEmptyOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
    };
    return DefaultIfEmptyOperator;
}());
var DefaultIfEmptySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(DefaultIfEmptySubscriber, _super);
    function DefaultIfEmptySubscriber(destination, defaultValue) {
        var _this = _super.call(this, destination) || this;
        _this.defaultValue = defaultValue;
        _this.isEmpty = true;
        return _this;
    }
    DefaultIfEmptySubscriber.prototype._next = function (value) {
        this.isEmpty = false;
        this.destination.next(value);
    };
    DefaultIfEmptySubscriber.prototype._complete = function () {
        if (this.isEmpty) {
            this.destination.next(this.defaultValue);
        }
        this.destination.complete();
    };
    return DefaultIfEmptySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=defaultIfEmpty.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/delay.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/delay.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   delay: () => (/* binding */ delay)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _util_isDate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isDate */ "../../node_modules/rxjs/_esm5/internal/util/isDate.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Notification__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Notification */ "../../node_modules/rxjs/_esm5/internal/Notification.js");
/** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_Subscriber,_Notification PURE_IMPORTS_END */





function delay(delay, scheduler) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    var absoluteDelay = (0,_util_isDate__WEBPACK_IMPORTED_MODULE_1__.isDate)(delay);
    var delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(delay);
    return function (source) { return source.lift(new DelayOperator(delayFor, scheduler)); };
}
var DelayOperator = /*@__PURE__*/ (function () {
    function DelayOperator(delay, scheduler) {
        this.delay = delay;
        this.scheduler = scheduler;
    }
    DelayOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
    };
    return DelayOperator;
}());
var DelaySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(DelaySubscriber, _super);
    function DelaySubscriber(destination, delay, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.delay = delay;
        _this.scheduler = scheduler;
        _this.queue = [];
        _this.active = false;
        _this.errored = false;
        return _this;
    }
    DelaySubscriber.dispatch = function (state) {
        var source = state.source;
        var queue = source.queue;
        var scheduler = state.scheduler;
        var destination = state.destination;
        while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
            queue.shift().notification.observe(destination);
        }
        if (queue.length > 0) {
            var delay_1 = Math.max(0, queue[0].time - scheduler.now());
            this.schedule(state, delay_1);
        }
        else {
            this.unsubscribe();
            source.active = false;
        }
    };
    DelaySubscriber.prototype._schedule = function (scheduler) {
        this.active = true;
        var destination = this.destination;
        destination.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {
            source: this, destination: this.destination, scheduler: scheduler
        }));
    };
    DelaySubscriber.prototype.scheduleNotification = function (notification) {
        if (this.errored === true) {
            return;
        }
        var scheduler = this.scheduler;
        var message = new DelayMessage(scheduler.now() + this.delay, notification);
        this.queue.push(message);
        if (this.active === false) {
            this._schedule(scheduler);
        }
    };
    DelaySubscriber.prototype._next = function (value) {
        this.scheduleNotification(_Notification__WEBPACK_IMPORTED_MODULE_3__.Notification.createNext(value));
    };
    DelaySubscriber.prototype._error = function (err) {
        this.errored = true;
        this.queue = [];
        this.destination.error(err);
        this.unsubscribe();
    };
    DelaySubscriber.prototype._complete = function () {
        this.scheduleNotification(_Notification__WEBPACK_IMPORTED_MODULE_3__.Notification.createComplete());
        this.unsubscribe();
    };
    return DelaySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_4__.Subscriber));
var DelayMessage = /*@__PURE__*/ (function () {
    function DelayMessage(time, notification) {
        this.time = time;
        this.notification = notification;
    }
    return DelayMessage;
}());
//# sourceMappingURL=delay.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/delayWhen.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/delayWhen.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   delayWhen: () => (/* binding */ delayWhen)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _OuterSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../OuterSubscriber */ "../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js");
/* harmony import */ var _util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/subscribeToResult */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */





function delayWhen(delayDurationSelector, subscriptionDelay) {
    if (subscriptionDelay) {
        return function (source) {
            return new SubscriptionDelayObservable(source, subscriptionDelay)
                .lift(new DelayWhenOperator(delayDurationSelector));
        };
    }
    return function (source) { return source.lift(new DelayWhenOperator(delayDurationSelector)); };
}
var DelayWhenOperator = /*@__PURE__*/ (function () {
    function DelayWhenOperator(delayDurationSelector) {
        this.delayDurationSelector = delayDurationSelector;
    }
    DelayWhenOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DelayWhenSubscriber(subscriber, this.delayDurationSelector));
    };
    return DelayWhenOperator;
}());
var DelayWhenSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(DelayWhenSubscriber, _super);
    function DelayWhenSubscriber(destination, delayDurationSelector) {
        var _this = _super.call(this, destination) || this;
        _this.delayDurationSelector = delayDurationSelector;
        _this.completed = false;
        _this.delayNotifierSubscriptions = [];
        _this.index = 0;
        return _this;
    }
    DelayWhenSubscriber.prototype.notifyNext = function (outerValue, _innerValue, _outerIndex, _innerIndex, innerSub) {
        this.destination.next(outerValue);
        this.removeSubscription(innerSub);
        this.tryComplete();
    };
    DelayWhenSubscriber.prototype.notifyError = function (error, innerSub) {
        this._error(error);
    };
    DelayWhenSubscriber.prototype.notifyComplete = function (innerSub) {
        var value = this.removeSubscription(innerSub);
        if (value) {
            this.destination.next(value);
        }
        this.tryComplete();
    };
    DelayWhenSubscriber.prototype._next = function (value) {
        var index = this.index++;
        try {
            var delayNotifier = this.delayDurationSelector(value, index);
            if (delayNotifier) {
                this.tryDelay(delayNotifier, value);
            }
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    DelayWhenSubscriber.prototype._complete = function () {
        this.completed = true;
        this.tryComplete();
        this.unsubscribe();
    };
    DelayWhenSubscriber.prototype.removeSubscription = function (subscription) {
        subscription.unsubscribe();
        var subscriptionIdx = this.delayNotifierSubscriptions.indexOf(subscription);
        if (subscriptionIdx !== -1) {
            this.delayNotifierSubscriptions.splice(subscriptionIdx, 1);
        }
        return subscription.outerValue;
    };
    DelayWhenSubscriber.prototype.tryDelay = function (delayNotifier, value) {
        var notifierSubscription = (0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__.subscribeToResult)(this, delayNotifier, value);
        if (notifierSubscription && !notifierSubscription.closed) {
            var destination = this.destination;
            destination.add(notifierSubscription);
            this.delayNotifierSubscriptions.push(notifierSubscription);
        }
    };
    DelayWhenSubscriber.prototype.tryComplete = function () {
        if (this.completed && this.delayNotifierSubscriptions.length === 0) {
            this.destination.complete();
        }
    };
    return DelayWhenSubscriber;
}(_OuterSubscriber__WEBPACK_IMPORTED_MODULE_2__.OuterSubscriber));
var SubscriptionDelayObservable = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SubscriptionDelayObservable, _super);
    function SubscriptionDelayObservable(source, subscriptionDelay) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subscriptionDelay = subscriptionDelay;
        return _this;
    }
    SubscriptionDelayObservable.prototype._subscribe = function (subscriber) {
        this.subscriptionDelay.subscribe(new SubscriptionDelaySubscriber(subscriber, this.source));
    };
    return SubscriptionDelayObservable;
}(_Observable__WEBPACK_IMPORTED_MODULE_3__.Observable));
var SubscriptionDelaySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SubscriptionDelaySubscriber, _super);
    function SubscriptionDelaySubscriber(parent, source) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.source = source;
        _this.sourceSubscribed = false;
        return _this;
    }
    SubscriptionDelaySubscriber.prototype._next = function (unused) {
        this.subscribeToSource();
    };
    SubscriptionDelaySubscriber.prototype._error = function (err) {
        this.unsubscribe();
        this.parent.error(err);
    };
    SubscriptionDelaySubscriber.prototype._complete = function () {
        this.unsubscribe();
        this.subscribeToSource();
    };
    SubscriptionDelaySubscriber.prototype.subscribeToSource = function () {
        if (!this.sourceSubscribed) {
            this.sourceSubscribed = true;
            this.unsubscribe();
            this.source.subscribe(this.parent);
        }
    };
    return SubscriptionDelaySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_4__.Subscriber));
//# sourceMappingURL=delayWhen.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/dematerialize.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/dematerialize.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dematerialize: () => (/* binding */ dematerialize)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function dematerialize() {
    return function dematerializeOperatorFunction(source) {
        return source.lift(new DeMaterializeOperator());
    };
}
var DeMaterializeOperator = /*@__PURE__*/ (function () {
    function DeMaterializeOperator() {
    }
    DeMaterializeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DeMaterializeSubscriber(subscriber));
    };
    return DeMaterializeOperator;
}());
var DeMaterializeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(DeMaterializeSubscriber, _super);
    function DeMaterializeSubscriber(destination) {
        return _super.call(this, destination) || this;
    }
    DeMaterializeSubscriber.prototype._next = function (value) {
        value.observe(this.destination);
    };
    return DeMaterializeSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=dematerialize.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/distinct.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/distinct.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DistinctSubscriber: () => (/* binding */ DistinctSubscriber),
/* harmony export */   distinct: () => (/* binding */ distinct)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function distinct(keySelector, flushes) {
    return function (source) { return source.lift(new DistinctOperator(keySelector, flushes)); };
}
var DistinctOperator = /*@__PURE__*/ (function () {
    function DistinctOperator(keySelector, flushes) {
        this.keySelector = keySelector;
        this.flushes = flushes;
    }
    DistinctOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DistinctSubscriber(subscriber, this.keySelector, this.flushes));
    };
    return DistinctOperator;
}());
var DistinctSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(DistinctSubscriber, _super);
    function DistinctSubscriber(destination, keySelector, flushes) {
        var _this = _super.call(this, destination) || this;
        _this.keySelector = keySelector;
        _this.values = new Set();
        if (flushes) {
            _this.add((0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(flushes, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(_this)));
        }
        return _this;
    }
    DistinctSubscriber.prototype.notifyNext = function () {
        this.values.clear();
    };
    DistinctSubscriber.prototype.notifyError = function (error) {
        this._error(error);
    };
    DistinctSubscriber.prototype._next = function (value) {
        if (this.keySelector) {
            this._useKeySelector(value);
        }
        else {
            this._finalizeNext(value, value);
        }
    };
    DistinctSubscriber.prototype._useKeySelector = function (value) {
        var key;
        var destination = this.destination;
        try {
            key = this.keySelector(value);
        }
        catch (err) {
            destination.error(err);
            return;
        }
        this._finalizeNext(key, value);
    };
    DistinctSubscriber.prototype._finalizeNext = function (key, value) {
        var values = this.values;
        if (!values.has(key)) {
            values.add(key);
            this.destination.next(value);
        }
    };
    return DistinctSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));

//# sourceMappingURL=distinct.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/distinctUntilChanged.js":
/*!********************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/distinctUntilChanged.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   distinctUntilChanged: () => (/* binding */ distinctUntilChanged)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function distinctUntilChanged(compare, keySelector) {
    return function (source) { return source.lift(new DistinctUntilChangedOperator(compare, keySelector)); };
}
var DistinctUntilChangedOperator = /*@__PURE__*/ (function () {
    function DistinctUntilChangedOperator(compare, keySelector) {
        this.compare = compare;
        this.keySelector = keySelector;
    }
    DistinctUntilChangedOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
    };
    return DistinctUntilChangedOperator;
}());
var DistinctUntilChangedSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(DistinctUntilChangedSubscriber, _super);
    function DistinctUntilChangedSubscriber(destination, compare, keySelector) {
        var _this = _super.call(this, destination) || this;
        _this.keySelector = keySelector;
        _this.hasKey = false;
        if (typeof compare === 'function') {
            _this.compare = compare;
        }
        return _this;
    }
    DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {
        return x === y;
    };
    DistinctUntilChangedSubscriber.prototype._next = function (value) {
        var key;
        try {
            var keySelector = this.keySelector;
            key = keySelector ? keySelector(value) : value;
        }
        catch (err) {
            return this.destination.error(err);
        }
        var result = false;
        if (this.hasKey) {
            try {
                var compare = this.compare;
                result = compare(this.key, key);
            }
            catch (err) {
                return this.destination.error(err);
            }
        }
        else {
            this.hasKey = true;
        }
        if (!result) {
            this.key = key;
            this.destination.next(value);
        }
    };
    return DistinctUntilChangedSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=distinctUntilChanged.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/distinctUntilKeyChanged.js":
/*!***********************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/distinctUntilKeyChanged.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   distinctUntilKeyChanged: () => (/* binding */ distinctUntilKeyChanged)
/* harmony export */ });
/* harmony import */ var _distinctUntilChanged__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./distinctUntilChanged */ "../../node_modules/rxjs/_esm5/internal/operators/distinctUntilChanged.js");
/** PURE_IMPORTS_START _distinctUntilChanged PURE_IMPORTS_END */

function distinctUntilKeyChanged(key, compare) {
    return (0,_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_0__.distinctUntilChanged)(function (x, y) { return compare ? compare(x[key], y[key]) : x[key] === y[key]; });
}
//# sourceMappingURL=distinctUntilKeyChanged.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/elementAt.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/elementAt.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   elementAt: () => (/* binding */ elementAt)
/* harmony export */ });
/* harmony import */ var _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/ArgumentOutOfRangeError */ "../../node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js");
/* harmony import */ var _filter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./filter */ "../../node_modules/rxjs/_esm5/internal/operators/filter.js");
/* harmony import */ var _throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./throwIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/throwIfEmpty.js");
/* harmony import */ var _defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./defaultIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _take__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./take */ "../../node_modules/rxjs/_esm5/internal/operators/take.js");
/** PURE_IMPORTS_START _util_ArgumentOutOfRangeError,_filter,_throwIfEmpty,_defaultIfEmpty,_take PURE_IMPORTS_END */





function elementAt(index, defaultValue) {
    if (index < 0) {
        throw new _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_0__.ArgumentOutOfRangeError();
    }
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe((0,_filter__WEBPACK_IMPORTED_MODULE_1__.filter)(function (v, i) { return i === index; }), (0,_take__WEBPACK_IMPORTED_MODULE_2__.take)(1), hasDefaultValue
            ? (0,_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__.defaultIfEmpty)(defaultValue)
            : (0,_throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__.throwIfEmpty)(function () { return new _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_0__.ArgumentOutOfRangeError(); }));
    };
}
//# sourceMappingURL=elementAt.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/endWith.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/endWith.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   endWith: () => (/* binding */ endWith)
/* harmony export */ });
/* harmony import */ var _observable_concat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/concat */ "../../node_modules/rxjs/_esm5/internal/observable/concat.js");
/* harmony import */ var _observable_of__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/of */ "../../node_modules/rxjs/_esm5/internal/observable/of.js");
/** PURE_IMPORTS_START _observable_concat,_observable_of PURE_IMPORTS_END */


function endWith() {
    var array = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        array[_i] = arguments[_i];
    }
    return function (source) { return (0,_observable_concat__WEBPACK_IMPORTED_MODULE_0__.concat)(source, _observable_of__WEBPACK_IMPORTED_MODULE_1__.of.apply(void 0, array)); };
}
//# sourceMappingURL=endWith.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/every.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/every.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   every: () => (/* binding */ every)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function every(predicate, thisArg) {
    return function (source) { return source.lift(new EveryOperator(predicate, thisArg, source)); };
}
var EveryOperator = /*@__PURE__*/ (function () {
    function EveryOperator(predicate, thisArg, source) {
        this.predicate = predicate;
        this.thisArg = thisArg;
        this.source = source;
    }
    EveryOperator.prototype.call = function (observer, source) {
        return source.subscribe(new EverySubscriber(observer, this.predicate, this.thisArg, this.source));
    };
    return EveryOperator;
}());
var EverySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(EverySubscriber, _super);
    function EverySubscriber(destination, predicate, thisArg, source) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.thisArg = thisArg;
        _this.source = source;
        _this.index = 0;
        _this.thisArg = thisArg || _this;
        return _this;
    }
    EverySubscriber.prototype.notifyComplete = function (everyValueMatch) {
        this.destination.next(everyValueMatch);
        this.destination.complete();
    };
    EverySubscriber.prototype._next = function (value) {
        var result = false;
        try {
            result = this.predicate.call(this.thisArg, value, this.index++, this.source);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (!result) {
            this.notifyComplete(false);
        }
    };
    EverySubscriber.prototype._complete = function () {
        this.notifyComplete(true);
    };
    return EverySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=every.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/exhaust.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/exhaust.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exhaust: () => (/* binding */ exhaust)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function exhaust() {
    return function (source) { return source.lift(new SwitchFirstOperator()); };
}
var SwitchFirstOperator = /*@__PURE__*/ (function () {
    function SwitchFirstOperator() {
    }
    SwitchFirstOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SwitchFirstSubscriber(subscriber));
    };
    return SwitchFirstOperator;
}());
var SwitchFirstSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SwitchFirstSubscriber, _super);
    function SwitchFirstSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.hasCompleted = false;
        _this.hasSubscription = false;
        return _this;
    }
    SwitchFirstSubscriber.prototype._next = function (value) {
        if (!this.hasSubscription) {
            this.hasSubscription = true;
            this.add((0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(value, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(this)));
        }
    };
    SwitchFirstSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (!this.hasSubscription) {
            this.destination.complete();
        }
    };
    SwitchFirstSubscriber.prototype.notifyComplete = function () {
        this.hasSubscription = false;
        if (this.hasCompleted) {
            this.destination.complete();
        }
    };
    return SwitchFirstSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));
//# sourceMappingURL=exhaust.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/exhaustMap.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/exhaustMap.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exhaustMap: () => (/* binding */ exhaustMap)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */




function exhaustMap(project, resultSelector) {
    if (resultSelector) {
        return function (source) { return source.pipe(exhaustMap(function (a, i) { return (0,_observable_from__WEBPACK_IMPORTED_MODULE_0__.from)(project(a, i)).pipe((0,_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (b, ii) { return resultSelector(a, b, i, ii); })); })); };
    }
    return function (source) {
        return source.lift(new ExhaustMapOperator(project));
    };
}
var ExhaustMapOperator = /*@__PURE__*/ (function () {
    function ExhaustMapOperator(project) {
        this.project = project;
    }
    ExhaustMapOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ExhaustMapSubscriber(subscriber, this.project));
    };
    return ExhaustMapOperator;
}());
var ExhaustMapSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(ExhaustMapSubscriber, _super);
    function ExhaustMapSubscriber(destination, project) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.hasSubscription = false;
        _this.hasCompleted = false;
        _this.index = 0;
        return _this;
    }
    ExhaustMapSubscriber.prototype._next = function (value) {
        if (!this.hasSubscription) {
            this.tryNext(value);
        }
    };
    ExhaustMapSubscriber.prototype.tryNext = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.hasSubscription = true;
        this._innerSub(result);
    };
    ExhaustMapSubscriber.prototype._innerSub = function (result) {
        var innerSubscriber = new _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        var innerSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.innerSubscribe)(result, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            destination.add(innerSubscription);
        }
    };
    ExhaustMapSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (!this.hasSubscription) {
            this.destination.complete();
        }
        this.unsubscribe();
    };
    ExhaustMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    ExhaustMapSubscriber.prototype.notifyError = function (err) {
        this.destination.error(err);
    };
    ExhaustMapSubscriber.prototype.notifyComplete = function () {
        this.hasSubscription = false;
        if (this.hasCompleted) {
            this.destination.complete();
        }
    };
    return ExhaustMapSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleOuterSubscriber));
//# sourceMappingURL=exhaustMap.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/expand.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/expand.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExpandOperator: () => (/* binding */ ExpandOperator),
/* harmony export */   ExpandSubscriber: () => (/* binding */ ExpandSubscriber),
/* harmony export */   expand: () => (/* binding */ expand)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function expand(project, concurrent, scheduler) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;
    return function (source) { return source.lift(new ExpandOperator(project, concurrent, scheduler)); };
}
var ExpandOperator = /*@__PURE__*/ (function () {
    function ExpandOperator(project, concurrent, scheduler) {
        this.project = project;
        this.concurrent = concurrent;
        this.scheduler = scheduler;
    }
    ExpandOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
    };
    return ExpandOperator;
}());

var ExpandSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ExpandSubscriber, _super);
    function ExpandSubscriber(destination, project, concurrent, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.concurrent = concurrent;
        _this.scheduler = scheduler;
        _this.index = 0;
        _this.active = 0;
        _this.hasCompleted = false;
        if (concurrent < Number.POSITIVE_INFINITY) {
            _this.buffer = [];
        }
        return _this;
    }
    ExpandSubscriber.dispatch = function (arg) {
        var subscriber = arg.subscriber, result = arg.result, value = arg.value, index = arg.index;
        subscriber.subscribeToProjection(result, value, index);
    };
    ExpandSubscriber.prototype._next = function (value) {
        var destination = this.destination;
        if (destination.closed) {
            this._complete();
            return;
        }
        var index = this.index++;
        if (this.active < this.concurrent) {
            destination.next(value);
            try {
                var project = this.project;
                var result = project(value, index);
                if (!this.scheduler) {
                    this.subscribeToProjection(result, value, index);
                }
                else {
                    var state = { subscriber: this, result: result, value: value, index: index };
                    var destination_1 = this.destination;
                    destination_1.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
                }
            }
            catch (e) {
                destination.error(e);
            }
        }
        else {
            this.buffer.push(value);
        }
    };
    ExpandSubscriber.prototype.subscribeToProjection = function (result, value, index) {
        this.active++;
        var destination = this.destination;
        destination.add((0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(result, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(this)));
    };
    ExpandSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
        this.unsubscribe();
    };
    ExpandSubscriber.prototype.notifyNext = function (innerValue) {
        this._next(innerValue);
    };
    ExpandSubscriber.prototype.notifyComplete = function () {
        var buffer = this.buffer;
        this.active--;
        if (buffer && buffer.length > 0) {
            this._next(buffer.shift());
        }
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
    };
    return ExpandSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));

//# sourceMappingURL=expand.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/filter.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/filter.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   filter: () => (/* binding */ filter)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function filter(predicate, thisArg) {
    return function filterOperatorFunction(source) {
        return source.lift(new FilterOperator(predicate, thisArg));
    };
}
var FilterOperator = /*@__PURE__*/ (function () {
    function FilterOperator(predicate, thisArg) {
        this.predicate = predicate;
        this.thisArg = thisArg;
    }
    FilterOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
    };
    return FilterOperator;
}());
var FilterSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(FilterSubscriber, _super);
    function FilterSubscriber(destination, predicate, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.thisArg = thisArg;
        _this.count = 0;
        return _this;
    }
    FilterSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.predicate.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (result) {
            this.destination.next(value);
        }
    };
    return FilterSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=filter.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/finalize.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/finalize.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   finalize: () => (/* binding */ finalize)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_Subscription PURE_IMPORTS_END */



function finalize(callback) {
    return function (source) { return source.lift(new FinallyOperator(callback)); };
}
var FinallyOperator = /*@__PURE__*/ (function () {
    function FinallyOperator(callback) {
        this.callback = callback;
    }
    FinallyOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new FinallySubscriber(subscriber, this.callback));
    };
    return FinallyOperator;
}());
var FinallySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(FinallySubscriber, _super);
    function FinallySubscriber(destination, callback) {
        var _this = _super.call(this, destination) || this;
        _this.add(new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription(callback));
        return _this;
    }
    return FinallySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
//# sourceMappingURL=finalize.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/find.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/find.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FindValueOperator: () => (/* binding */ FindValueOperator),
/* harmony export */   FindValueSubscriber: () => (/* binding */ FindValueSubscriber),
/* harmony export */   find: () => (/* binding */ find)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function find(predicate, thisArg) {
    if (typeof predicate !== 'function') {
        throw new TypeError('predicate is not a function');
    }
    return function (source) { return source.lift(new FindValueOperator(predicate, source, false, thisArg)); };
}
var FindValueOperator = /*@__PURE__*/ (function () {
    function FindValueOperator(predicate, source, yieldIndex, thisArg) {
        this.predicate = predicate;
        this.source = source;
        this.yieldIndex = yieldIndex;
        this.thisArg = thisArg;
    }
    FindValueOperator.prototype.call = function (observer, source) {
        return source.subscribe(new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg));
    };
    return FindValueOperator;
}());

var FindValueSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(FindValueSubscriber, _super);
    function FindValueSubscriber(destination, predicate, source, yieldIndex, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.source = source;
        _this.yieldIndex = yieldIndex;
        _this.thisArg = thisArg;
        _this.index = 0;
        return _this;
    }
    FindValueSubscriber.prototype.notifyComplete = function (value) {
        var destination = this.destination;
        destination.next(value);
        destination.complete();
        this.unsubscribe();
    };
    FindValueSubscriber.prototype._next = function (value) {
        var _a = this, predicate = _a.predicate, thisArg = _a.thisArg;
        var index = this.index++;
        try {
            var result = predicate.call(thisArg || this, value, index, this.source);
            if (result) {
                this.notifyComplete(this.yieldIndex ? index : value);
            }
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    FindValueSubscriber.prototype._complete = function () {
        this.notifyComplete(this.yieldIndex ? -1 : undefined);
    };
    return FindValueSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

//# sourceMappingURL=find.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/findIndex.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/findIndex.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findIndex: () => (/* binding */ findIndex)
/* harmony export */ });
/* harmony import */ var _operators_find__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../operators/find */ "../../node_modules/rxjs/_esm5/internal/operators/find.js");
/** PURE_IMPORTS_START _operators_find PURE_IMPORTS_END */

function findIndex(predicate, thisArg) {
    return function (source) { return source.lift(new _operators_find__WEBPACK_IMPORTED_MODULE_0__.FindValueOperator(predicate, source, true, thisArg)); };
}
//# sourceMappingURL=findIndex.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/first.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/first.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   first: () => (/* binding */ first)
/* harmony export */ });
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/EmptyError */ "../../node_modules/rxjs/_esm5/internal/util/EmptyError.js");
/* harmony import */ var _filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter */ "../../node_modules/rxjs/_esm5/internal/operators/filter.js");
/* harmony import */ var _take__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./take */ "../../node_modules/rxjs/_esm5/internal/operators/take.js");
/* harmony import */ var _defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./defaultIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./throwIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/throwIfEmpty.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/identity */ "../../node_modules/rxjs/_esm5/internal/util/identity.js");
/** PURE_IMPORTS_START _util_EmptyError,_filter,_take,_defaultIfEmpty,_throwIfEmpty,_util_identity PURE_IMPORTS_END */






function first(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) { return source.pipe(predicate ? (0,_filter__WEBPACK_IMPORTED_MODULE_0__.filter)(function (v, i) { return predicate(v, i, source); }) : _util_identity__WEBPACK_IMPORTED_MODULE_1__.identity, (0,_take__WEBPACK_IMPORTED_MODULE_2__.take)(1), hasDefaultValue ? (0,_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__.defaultIfEmpty)(defaultValue) : (0,_throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__.throwIfEmpty)(function () { return new _util_EmptyError__WEBPACK_IMPORTED_MODULE_5__.EmptyError(); })); };
}
//# sourceMappingURL=first.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/groupBy.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/groupBy.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GroupedObservable: () => (/* binding */ GroupedObservable),
/* harmony export */   groupBy: () => (/* binding */ groupBy)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_Subscription,_Observable,_Subject PURE_IMPORTS_END */





function groupBy(keySelector, elementSelector, durationSelector, subjectSelector) {
    return function (source) {
        return source.lift(new GroupByOperator(keySelector, elementSelector, durationSelector, subjectSelector));
    };
}
var GroupByOperator = /*@__PURE__*/ (function () {
    function GroupByOperator(keySelector, elementSelector, durationSelector, subjectSelector) {
        this.keySelector = keySelector;
        this.elementSelector = elementSelector;
        this.durationSelector = durationSelector;
        this.subjectSelector = subjectSelector;
    }
    GroupByOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new GroupBySubscriber(subscriber, this.keySelector, this.elementSelector, this.durationSelector, this.subjectSelector));
    };
    return GroupByOperator;
}());
var GroupBySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(GroupBySubscriber, _super);
    function GroupBySubscriber(destination, keySelector, elementSelector, durationSelector, subjectSelector) {
        var _this = _super.call(this, destination) || this;
        _this.keySelector = keySelector;
        _this.elementSelector = elementSelector;
        _this.durationSelector = durationSelector;
        _this.subjectSelector = subjectSelector;
        _this.groups = null;
        _this.attemptedToUnsubscribe = false;
        _this.count = 0;
        return _this;
    }
    GroupBySubscriber.prototype._next = function (value) {
        var key;
        try {
            key = this.keySelector(value);
        }
        catch (err) {
            this.error(err);
            return;
        }
        this._group(value, key);
    };
    GroupBySubscriber.prototype._group = function (value, key) {
        var groups = this.groups;
        if (!groups) {
            groups = this.groups = new Map();
        }
        var group = groups.get(key);
        var element;
        if (this.elementSelector) {
            try {
                element = this.elementSelector(value);
            }
            catch (err) {
                this.error(err);
            }
        }
        else {
            element = value;
        }
        if (!group) {
            group = (this.subjectSelector ? this.subjectSelector() : new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject());
            groups.set(key, group);
            var groupedObservable = new GroupedObservable(key, group, this);
            this.destination.next(groupedObservable);
            if (this.durationSelector) {
                var duration = void 0;
                try {
                    duration = this.durationSelector(new GroupedObservable(key, group));
                }
                catch (err) {
                    this.error(err);
                    return;
                }
                this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
            }
        }
        if (!group.closed) {
            group.next(element);
        }
    };
    GroupBySubscriber.prototype._error = function (err) {
        var groups = this.groups;
        if (groups) {
            groups.forEach(function (group, key) {
                group.error(err);
            });
            groups.clear();
        }
        this.destination.error(err);
    };
    GroupBySubscriber.prototype._complete = function () {
        var groups = this.groups;
        if (groups) {
            groups.forEach(function (group, key) {
                group.complete();
            });
            groups.clear();
        }
        this.destination.complete();
    };
    GroupBySubscriber.prototype.removeGroup = function (key) {
        this.groups.delete(key);
    };
    GroupBySubscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.attemptedToUnsubscribe = true;
            if (this.count === 0) {
                _super.prototype.unsubscribe.call(this);
            }
        }
    };
    return GroupBySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
var GroupDurationSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(GroupDurationSubscriber, _super);
    function GroupDurationSubscriber(key, group, parent) {
        var _this = _super.call(this, group) || this;
        _this.key = key;
        _this.group = group;
        _this.parent = parent;
        return _this;
    }
    GroupDurationSubscriber.prototype._next = function (value) {
        this.complete();
    };
    GroupDurationSubscriber.prototype._unsubscribe = function () {
        var _a = this, parent = _a.parent, key = _a.key;
        this.key = this.parent = null;
        if (parent) {
            parent.removeGroup(key);
        }
    };
    return GroupDurationSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
var GroupedObservable = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(GroupedObservable, _super);
    function GroupedObservable(key, groupSubject, refCountSubscription) {
        var _this = _super.call(this) || this;
        _this.key = key;
        _this.groupSubject = groupSubject;
        _this.refCountSubscription = refCountSubscription;
        return _this;
    }
    GroupedObservable.prototype._subscribe = function (subscriber) {
        var subscription = new _Subscription__WEBPACK_IMPORTED_MODULE_3__.Subscription();
        var _a = this, refCountSubscription = _a.refCountSubscription, groupSubject = _a.groupSubject;
        if (refCountSubscription && !refCountSubscription.closed) {
            subscription.add(new InnerRefCountSubscription(refCountSubscription));
        }
        subscription.add(groupSubject.subscribe(subscriber));
        return subscription;
    };
    return GroupedObservable;
}(_Observable__WEBPACK_IMPORTED_MODULE_4__.Observable));

var InnerRefCountSubscription = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(InnerRefCountSubscription, _super);
    function InnerRefCountSubscription(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        parent.count++;
        return _this;
    }
    InnerRefCountSubscription.prototype.unsubscribe = function () {
        var parent = this.parent;
        if (!parent.closed && !this.closed) {
            _super.prototype.unsubscribe.call(this);
            parent.count -= 1;
            if (parent.count === 0 && parent.attemptedToUnsubscribe) {
                parent.unsubscribe();
            }
        }
    };
    return InnerRefCountSubscription;
}(_Subscription__WEBPACK_IMPORTED_MODULE_3__.Subscription));
//# sourceMappingURL=groupBy.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/ignoreElements.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/ignoreElements.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ignoreElements: () => (/* binding */ ignoreElements)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function ignoreElements() {
    return function ignoreElementsOperatorFunction(source) {
        return source.lift(new IgnoreElementsOperator());
    };
}
var IgnoreElementsOperator = /*@__PURE__*/ (function () {
    function IgnoreElementsOperator() {
    }
    IgnoreElementsOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new IgnoreElementsSubscriber(subscriber));
    };
    return IgnoreElementsOperator;
}());
var IgnoreElementsSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(IgnoreElementsSubscriber, _super);
    function IgnoreElementsSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IgnoreElementsSubscriber.prototype._next = function (unused) {
    };
    return IgnoreElementsSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=ignoreElements.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/isEmpty.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/isEmpty.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isEmpty: () => (/* binding */ isEmpty)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function isEmpty() {
    return function (source) { return source.lift(new IsEmptyOperator()); };
}
var IsEmptyOperator = /*@__PURE__*/ (function () {
    function IsEmptyOperator() {
    }
    IsEmptyOperator.prototype.call = function (observer, source) {
        return source.subscribe(new IsEmptySubscriber(observer));
    };
    return IsEmptyOperator;
}());
var IsEmptySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(IsEmptySubscriber, _super);
    function IsEmptySubscriber(destination) {
        return _super.call(this, destination) || this;
    }
    IsEmptySubscriber.prototype.notifyComplete = function (isEmpty) {
        var destination = this.destination;
        destination.next(isEmpty);
        destination.complete();
    };
    IsEmptySubscriber.prototype._next = function (value) {
        this.notifyComplete(false);
    };
    IsEmptySubscriber.prototype._complete = function () {
        this.notifyComplete(true);
    };
    return IsEmptySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=isEmpty.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/last.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/last.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   last: () => (/* binding */ last)
/* harmony export */ });
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/EmptyError */ "../../node_modules/rxjs/_esm5/internal/util/EmptyError.js");
/* harmony import */ var _filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter */ "../../node_modules/rxjs/_esm5/internal/operators/filter.js");
/* harmony import */ var _takeLast__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./takeLast */ "../../node_modules/rxjs/_esm5/internal/operators/takeLast.js");
/* harmony import */ var _throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./throwIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/throwIfEmpty.js");
/* harmony import */ var _defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./defaultIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/identity */ "../../node_modules/rxjs/_esm5/internal/util/identity.js");
/** PURE_IMPORTS_START _util_EmptyError,_filter,_takeLast,_throwIfEmpty,_defaultIfEmpty,_util_identity PURE_IMPORTS_END */






function last(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) { return source.pipe(predicate ? (0,_filter__WEBPACK_IMPORTED_MODULE_0__.filter)(function (v, i) { return predicate(v, i, source); }) : _util_identity__WEBPACK_IMPORTED_MODULE_1__.identity, (0,_takeLast__WEBPACK_IMPORTED_MODULE_2__.takeLast)(1), hasDefaultValue ? (0,_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__.defaultIfEmpty)(defaultValue) : (0,_throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__.throwIfEmpty)(function () { return new _util_EmptyError__WEBPACK_IMPORTED_MODULE_5__.EmptyError(); })); };
}
//# sourceMappingURL=last.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/map.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/map.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MapOperator: () => (/* binding */ MapOperator),
/* harmony export */   map: () => (/* binding */ map)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function map(project, thisArg) {
    return function mapOperation(source) {
        if (typeof project !== 'function') {
            throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
        }
        return source.lift(new MapOperator(project, thisArg));
    };
}
var MapOperator = /*@__PURE__*/ (function () {
    function MapOperator(project, thisArg) {
        this.project = project;
        this.thisArg = thisArg;
    }
    MapOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
    };
    return MapOperator;
}());

var MapSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(MapSubscriber, _super);
    function MapSubscriber(destination, project, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.count = 0;
        _this.thisArg = thisArg || _this;
        return _this;
    }
    MapSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.project.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return MapSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=map.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/mapTo.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/mapTo.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mapTo: () => (/* binding */ mapTo)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function mapTo(value) {
    return function (source) { return source.lift(new MapToOperator(value)); };
}
var MapToOperator = /*@__PURE__*/ (function () {
    function MapToOperator(value) {
        this.value = value;
    }
    MapToOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new MapToSubscriber(subscriber, this.value));
    };
    return MapToOperator;
}());
var MapToSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(MapToSubscriber, _super);
    function MapToSubscriber(destination, value) {
        var _this = _super.call(this, destination) || this;
        _this.value = value;
        return _this;
    }
    MapToSubscriber.prototype._next = function (x) {
        this.destination.next(this.value);
    };
    return MapToSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=mapTo.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/materialize.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/materialize.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   materialize: () => (/* binding */ materialize)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Notification__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Notification */ "../../node_modules/rxjs/_esm5/internal/Notification.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */



function materialize() {
    return function materializeOperatorFunction(source) {
        return source.lift(new MaterializeOperator());
    };
}
var MaterializeOperator = /*@__PURE__*/ (function () {
    function MaterializeOperator() {
    }
    MaterializeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new MaterializeSubscriber(subscriber));
    };
    return MaterializeOperator;
}());
var MaterializeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(MaterializeSubscriber, _super);
    function MaterializeSubscriber(destination) {
        return _super.call(this, destination) || this;
    }
    MaterializeSubscriber.prototype._next = function (value) {
        this.destination.next(_Notification__WEBPACK_IMPORTED_MODULE_1__.Notification.createNext(value));
    };
    MaterializeSubscriber.prototype._error = function (err) {
        var destination = this.destination;
        destination.next(_Notification__WEBPACK_IMPORTED_MODULE_1__.Notification.createError(err));
        destination.complete();
    };
    MaterializeSubscriber.prototype._complete = function () {
        var destination = this.destination;
        destination.next(_Notification__WEBPACK_IMPORTED_MODULE_1__.Notification.createComplete());
        destination.complete();
    };
    return MaterializeSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
//# sourceMappingURL=materialize.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/max.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/max.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   max: () => (/* binding */ max)
/* harmony export */ });
/* harmony import */ var _reduce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reduce */ "../../node_modules/rxjs/_esm5/internal/operators/reduce.js");
/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */

function max(comparer) {
    var max = (typeof comparer === 'function')
        ? function (x, y) { return comparer(x, y) > 0 ? x : y; }
        : function (x, y) { return x > y ? x : y; };
    return (0,_reduce__WEBPACK_IMPORTED_MODULE_0__.reduce)(max);
}
//# sourceMappingURL=max.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/merge.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/merge.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   merge: () => (/* binding */ merge)
/* harmony export */ });
/* harmony import */ var _observable_merge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/merge */ "../../node_modules/rxjs/_esm5/internal/observable/merge.js");
/** PURE_IMPORTS_START _observable_merge PURE_IMPORTS_END */

function merge() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    return function (source) { return source.lift.call(_observable_merge__WEBPACK_IMPORTED_MODULE_0__.merge.apply(void 0, [source].concat(observables))); };
}
//# sourceMappingURL=merge.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/mergeAll.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/mergeAll.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mergeAll: () => (/* binding */ mergeAll)
/* harmony export */ });
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergeMap */ "../../node_modules/rxjs/_esm5/internal/operators/mergeMap.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/identity */ "../../node_modules/rxjs/_esm5/internal/util/identity.js");
/** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */


function mergeAll(concurrent) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    return (0,_mergeMap__WEBPACK_IMPORTED_MODULE_0__.mergeMap)(_util_identity__WEBPACK_IMPORTED_MODULE_1__.identity, concurrent);
}
//# sourceMappingURL=mergeAll.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/mergeMap.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/mergeMap.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MergeMapOperator: () => (/* binding */ MergeMapOperator),
/* harmony export */   MergeMapSubscriber: () => (/* binding */ MergeMapSubscriber),
/* harmony export */   flatMap: () => (/* binding */ flatMap),
/* harmony export */   mergeMap: () => (/* binding */ mergeMap)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */




function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    if (typeof resultSelector === 'function') {
        return function (source) { return source.pipe(mergeMap(function (a, i) { return (0,_observable_from__WEBPACK_IMPORTED_MODULE_0__.from)(project(a, i)).pipe((0,_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (b, ii) { return resultSelector(a, b, i, ii); })); }, concurrent)); };
    }
    else if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return function (source) { return source.lift(new MergeMapOperator(project, concurrent)); };
}
var MergeMapOperator = /*@__PURE__*/ (function () {
    function MergeMapOperator(project, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        this.project = project;
        this.concurrent = concurrent;
    }
    MergeMapOperator.prototype.call = function (observer, source) {
        return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
    };
    return MergeMapOperator;
}());

var MergeMapSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(MergeMapSubscriber, _super);
    function MergeMapSubscriber(destination, project, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.concurrent = concurrent;
        _this.hasCompleted = false;
        _this.buffer = [];
        _this.active = 0;
        _this.index = 0;
        return _this;
    }
    MergeMapSubscriber.prototype._next = function (value) {
        if (this.active < this.concurrent) {
            this._tryNext(value);
        }
        else {
            this.buffer.push(value);
        }
    };
    MergeMapSubscriber.prototype._tryNext = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.active++;
        this._innerSub(result);
    };
    MergeMapSubscriber.prototype._innerSub = function (ish) {
        var innerSubscriber = new _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        var innerSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.innerSubscribe)(ish, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            destination.add(innerSubscription);
        }
    };
    MergeMapSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
        this.unsubscribe();
    };
    MergeMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    MergeMapSubscriber.prototype.notifyComplete = function () {
        var buffer = this.buffer;
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    };
    return MergeMapSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleOuterSubscriber));

var flatMap = mergeMap;
//# sourceMappingURL=mergeMap.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/mergeMapTo.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/mergeMapTo.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mergeMapTo: () => (/* binding */ mergeMapTo)
/* harmony export */ });
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergeMap */ "../../node_modules/rxjs/_esm5/internal/operators/mergeMap.js");
/** PURE_IMPORTS_START _mergeMap PURE_IMPORTS_END */

function mergeMapTo(innerObservable, resultSelector, concurrent) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    if (typeof resultSelector === 'function') {
        return (0,_mergeMap__WEBPACK_IMPORTED_MODULE_0__.mergeMap)(function () { return innerObservable; }, resultSelector, concurrent);
    }
    if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return (0,_mergeMap__WEBPACK_IMPORTED_MODULE_0__.mergeMap)(function () { return innerObservable; }, concurrent);
}
//# sourceMappingURL=mergeMapTo.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/mergeScan.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/mergeScan.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MergeScanOperator: () => (/* binding */ MergeScanOperator),
/* harmony export */   MergeScanSubscriber: () => (/* binding */ MergeScanSubscriber),
/* harmony export */   mergeScan: () => (/* binding */ mergeScan)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function mergeScan(accumulator, seed, concurrent) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    return function (source) { return source.lift(new MergeScanOperator(accumulator, seed, concurrent)); };
}
var MergeScanOperator = /*@__PURE__*/ (function () {
    function MergeScanOperator(accumulator, seed, concurrent) {
        this.accumulator = accumulator;
        this.seed = seed;
        this.concurrent = concurrent;
    }
    MergeScanOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new MergeScanSubscriber(subscriber, this.accumulator, this.seed, this.concurrent));
    };
    return MergeScanOperator;
}());

var MergeScanSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(MergeScanSubscriber, _super);
    function MergeScanSubscriber(destination, accumulator, acc, concurrent) {
        var _this = _super.call(this, destination) || this;
        _this.accumulator = accumulator;
        _this.acc = acc;
        _this.concurrent = concurrent;
        _this.hasValue = false;
        _this.hasCompleted = false;
        _this.buffer = [];
        _this.active = 0;
        _this.index = 0;
        return _this;
    }
    MergeScanSubscriber.prototype._next = function (value) {
        if (this.active < this.concurrent) {
            var index = this.index++;
            var destination = this.destination;
            var ish = void 0;
            try {
                var accumulator = this.accumulator;
                ish = accumulator(this.acc, value, index);
            }
            catch (e) {
                return destination.error(e);
            }
            this.active++;
            this._innerSub(ish);
        }
        else {
            this.buffer.push(value);
        }
    };
    MergeScanSubscriber.prototype._innerSub = function (ish) {
        var innerSubscriber = new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        var innerSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(ish, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            destination.add(innerSubscription);
        }
    };
    MergeScanSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            if (this.hasValue === false) {
                this.destination.next(this.acc);
            }
            this.destination.complete();
        }
        this.unsubscribe();
    };
    MergeScanSubscriber.prototype.notifyNext = function (innerValue) {
        var destination = this.destination;
        this.acc = innerValue;
        this.hasValue = true;
        destination.next(innerValue);
    };
    MergeScanSubscriber.prototype.notifyComplete = function () {
        var buffer = this.buffer;
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            if (this.hasValue === false) {
                this.destination.next(this.acc);
            }
            this.destination.complete();
        }
    };
    return MergeScanSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));

//# sourceMappingURL=mergeScan.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/min.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/min.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   min: () => (/* binding */ min)
/* harmony export */ });
/* harmony import */ var _reduce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reduce */ "../../node_modules/rxjs/_esm5/internal/operators/reduce.js");
/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */

function min(comparer) {
    var min = (typeof comparer === 'function')
        ? function (x, y) { return comparer(x, y) < 0 ? x : y; }
        : function (x, y) { return x < y ? x : y; };
    return (0,_reduce__WEBPACK_IMPORTED_MODULE_0__.reduce)(min);
}
//# sourceMappingURL=min.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/multicast.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/multicast.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MulticastOperator: () => (/* binding */ MulticastOperator),
/* harmony export */   multicast: () => (/* binding */ multicast)
/* harmony export */ });
/* harmony import */ var _observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/ConnectableObservable */ "../../node_modules/rxjs/_esm5/internal/observable/ConnectableObservable.js");
/** PURE_IMPORTS_START _observable_ConnectableObservable PURE_IMPORTS_END */

function multicast(subjectOrSubjectFactory, selector) {
    return function multicastOperatorFunction(source) {
        var subjectFactory;
        if (typeof subjectOrSubjectFactory === 'function') {
            subjectFactory = subjectOrSubjectFactory;
        }
        else {
            subjectFactory = function subjectFactory() {
                return subjectOrSubjectFactory;
            };
        }
        if (typeof selector === 'function') {
            return source.lift(new MulticastOperator(subjectFactory, selector));
        }
        var connectable = Object.create(source, _observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_0__.connectableObservableDescriptor);
        connectable.source = source;
        connectable.subjectFactory = subjectFactory;
        return connectable;
    };
}
var MulticastOperator = /*@__PURE__*/ (function () {
    function MulticastOperator(subjectFactory, selector) {
        this.subjectFactory = subjectFactory;
        this.selector = selector;
    }
    MulticastOperator.prototype.call = function (subscriber, source) {
        var selector = this.selector;
        var subject = this.subjectFactory();
        var subscription = selector(subject).subscribe(subscriber);
        subscription.add(source.subscribe(subject));
        return subscription;
    };
    return MulticastOperator;
}());

//# sourceMappingURL=multicast.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/observeOn.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/observeOn.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ObserveOnMessage: () => (/* binding */ ObserveOnMessage),
/* harmony export */   ObserveOnOperator: () => (/* binding */ ObserveOnOperator),
/* harmony export */   ObserveOnSubscriber: () => (/* binding */ ObserveOnSubscriber),
/* harmony export */   observeOn: () => (/* binding */ observeOn)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Notification__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Notification */ "../../node_modules/rxjs/_esm5/internal/Notification.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */



function observeOn(scheduler, delay) {
    if (delay === void 0) {
        delay = 0;
    }
    return function observeOnOperatorFunction(source) {
        return source.lift(new ObserveOnOperator(scheduler, delay));
    };
}
var ObserveOnOperator = /*@__PURE__*/ (function () {
    function ObserveOnOperator(scheduler, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        this.scheduler = scheduler;
        this.delay = delay;
    }
    ObserveOnOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
    };
    return ObserveOnOperator;
}());

var ObserveOnSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ObserveOnSubscriber, _super);
    function ObserveOnSubscriber(destination, scheduler, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        var _this = _super.call(this, destination) || this;
        _this.scheduler = scheduler;
        _this.delay = delay;
        return _this;
    }
    ObserveOnSubscriber.dispatch = function (arg) {
        var notification = arg.notification, destination = arg.destination;
        notification.observe(destination);
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
        var destination = this.destination;
        destination.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
    };
    ObserveOnSubscriber.prototype._next = function (value) {
        this.scheduleMessage(_Notification__WEBPACK_IMPORTED_MODULE_1__.Notification.createNext(value));
    };
    ObserveOnSubscriber.prototype._error = function (err) {
        this.scheduleMessage(_Notification__WEBPACK_IMPORTED_MODULE_1__.Notification.createError(err));
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype._complete = function () {
        this.scheduleMessage(_Notification__WEBPACK_IMPORTED_MODULE_1__.Notification.createComplete());
        this.unsubscribe();
    };
    return ObserveOnSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));

var ObserveOnMessage = /*@__PURE__*/ (function () {
    function ObserveOnMessage(notification, destination) {
        this.notification = notification;
        this.destination = destination;
    }
    return ObserveOnMessage;
}());

//# sourceMappingURL=observeOn.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/onErrorResumeNext.js":
/*!*****************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/onErrorResumeNext.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   onErrorResumeNext: () => (/* binding */ onErrorResumeNext),
/* harmony export */   onErrorResumeNextStatic: () => (/* binding */ onErrorResumeNextStatic)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_observable_from,_util_isArray,_innerSubscribe PURE_IMPORTS_END */




function onErrorResumeNext() {
    var nextSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        nextSources[_i] = arguments[_i];
    }
    if (nextSources.length === 1 && (0,_util_isArray__WEBPACK_IMPORTED_MODULE_0__.isArray)(nextSources[0])) {
        nextSources = nextSources[0];
    }
    return function (source) { return source.lift(new OnErrorResumeNextOperator(nextSources)); };
}
function onErrorResumeNextStatic() {
    var nextSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        nextSources[_i] = arguments[_i];
    }
    var source = undefined;
    if (nextSources.length === 1 && (0,_util_isArray__WEBPACK_IMPORTED_MODULE_0__.isArray)(nextSources[0])) {
        nextSources = nextSources[0];
    }
    source = nextSources.shift();
    return (0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.from)(source).lift(new OnErrorResumeNextOperator(nextSources));
}
var OnErrorResumeNextOperator = /*@__PURE__*/ (function () {
    function OnErrorResumeNextOperator(nextSources) {
        this.nextSources = nextSources;
    }
    OnErrorResumeNextOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new OnErrorResumeNextSubscriber(subscriber, this.nextSources));
    };
    return OnErrorResumeNextOperator;
}());
var OnErrorResumeNextSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(OnErrorResumeNextSubscriber, _super);
    function OnErrorResumeNextSubscriber(destination, nextSources) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.nextSources = nextSources;
        return _this;
    }
    OnErrorResumeNextSubscriber.prototype.notifyError = function () {
        this.subscribeToNextSource();
    };
    OnErrorResumeNextSubscriber.prototype.notifyComplete = function () {
        this.subscribeToNextSource();
    };
    OnErrorResumeNextSubscriber.prototype._error = function (err) {
        this.subscribeToNextSource();
        this.unsubscribe();
    };
    OnErrorResumeNextSubscriber.prototype._complete = function () {
        this.subscribeToNextSource();
        this.unsubscribe();
    };
    OnErrorResumeNextSubscriber.prototype.subscribeToNextSource = function () {
        var next = this.nextSources.shift();
        if (!!next) {
            var innerSubscriber = new _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleInnerSubscriber(this);
            var destination = this.destination;
            destination.add(innerSubscriber);
            var innerSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.innerSubscribe)(next, innerSubscriber);
            if (innerSubscription !== innerSubscriber) {
                destination.add(innerSubscription);
            }
        }
        else {
            this.destination.complete();
        }
    };
    return OnErrorResumeNextSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleOuterSubscriber));
//# sourceMappingURL=onErrorResumeNext.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/pairwise.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/pairwise.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   pairwise: () => (/* binding */ pairwise)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function pairwise() {
    return function (source) { return source.lift(new PairwiseOperator()); };
}
var PairwiseOperator = /*@__PURE__*/ (function () {
    function PairwiseOperator() {
    }
    PairwiseOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new PairwiseSubscriber(subscriber));
    };
    return PairwiseOperator;
}());
var PairwiseSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(PairwiseSubscriber, _super);
    function PairwiseSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.hasPrev = false;
        return _this;
    }
    PairwiseSubscriber.prototype._next = function (value) {
        var pair;
        if (this.hasPrev) {
            pair = [this.prev, value];
        }
        else {
            this.hasPrev = true;
        }
        this.prev = value;
        if (pair) {
            this.destination.next(pair);
        }
    };
    return PairwiseSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=pairwise.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/partition.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/partition.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   partition: () => (/* binding */ partition)
/* harmony export */ });
/* harmony import */ var _util_not__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/not */ "../../node_modules/rxjs/_esm5/internal/util/not.js");
/* harmony import */ var _filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter */ "../../node_modules/rxjs/_esm5/internal/operators/filter.js");
/** PURE_IMPORTS_START _util_not,_filter PURE_IMPORTS_END */


function partition(predicate, thisArg) {
    return function (source) {
        return [
            (0,_filter__WEBPACK_IMPORTED_MODULE_0__.filter)(predicate, thisArg)(source),
            (0,_filter__WEBPACK_IMPORTED_MODULE_0__.filter)((0,_util_not__WEBPACK_IMPORTED_MODULE_1__.not)(predicate, thisArg))(source)
        ];
    };
}
//# sourceMappingURL=partition.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/pluck.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/pluck.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   pluck: () => (/* binding */ pluck)
/* harmony export */ });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/** PURE_IMPORTS_START _map PURE_IMPORTS_END */

function pluck() {
    var properties = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        properties[_i] = arguments[_i];
    }
    var length = properties.length;
    if (length === 0) {
        throw new Error('list of properties cannot be empty.');
    }
    return function (source) { return (0,_map__WEBPACK_IMPORTED_MODULE_0__.map)(plucker(properties, length))(source); };
}
function plucker(props, length) {
    var mapper = function (x) {
        var currentProp = x;
        for (var i = 0; i < length; i++) {
            var p = currentProp != null ? currentProp[props[i]] : undefined;
            if (p !== void 0) {
                currentProp = p;
            }
            else {
                return undefined;
            }
        }
        return currentProp;
    };
    return mapper;
}
//# sourceMappingURL=pluck.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/publish.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/publish.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   publish: () => (/* binding */ publish)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _multicast__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./multicast */ "../../node_modules/rxjs/_esm5/internal/operators/multicast.js");
/** PURE_IMPORTS_START _Subject,_multicast PURE_IMPORTS_END */


function publish(selector) {
    return selector ?
        (0,_multicast__WEBPACK_IMPORTED_MODULE_0__.multicast)(function () { return new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject(); }, selector) :
        (0,_multicast__WEBPACK_IMPORTED_MODULE_0__.multicast)(new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject());
}
//# sourceMappingURL=publish.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/publishBehavior.js":
/*!***************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/publishBehavior.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   publishBehavior: () => (/* binding */ publishBehavior)
/* harmony export */ });
/* harmony import */ var _BehaviorSubject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../BehaviorSubject */ "../../node_modules/rxjs/_esm5/internal/BehaviorSubject.js");
/* harmony import */ var _multicast__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./multicast */ "../../node_modules/rxjs/_esm5/internal/operators/multicast.js");
/** PURE_IMPORTS_START _BehaviorSubject,_multicast PURE_IMPORTS_END */


function publishBehavior(value) {
    return function (source) { return (0,_multicast__WEBPACK_IMPORTED_MODULE_0__.multicast)(new _BehaviorSubject__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(value))(source); };
}
//# sourceMappingURL=publishBehavior.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/publishLast.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/publishLast.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   publishLast: () => (/* binding */ publishLast)
/* harmony export */ });
/* harmony import */ var _AsyncSubject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../AsyncSubject */ "../../node_modules/rxjs/_esm5/internal/AsyncSubject.js");
/* harmony import */ var _multicast__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./multicast */ "../../node_modules/rxjs/_esm5/internal/operators/multicast.js");
/** PURE_IMPORTS_START _AsyncSubject,_multicast PURE_IMPORTS_END */


function publishLast() {
    return function (source) { return (0,_multicast__WEBPACK_IMPORTED_MODULE_0__.multicast)(new _AsyncSubject__WEBPACK_IMPORTED_MODULE_1__.AsyncSubject())(source); };
}
//# sourceMappingURL=publishLast.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/publishReplay.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/publishReplay.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   publishReplay: () => (/* binding */ publishReplay)
/* harmony export */ });
/* harmony import */ var _ReplaySubject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ReplaySubject */ "../../node_modules/rxjs/_esm5/internal/ReplaySubject.js");
/* harmony import */ var _multicast__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./multicast */ "../../node_modules/rxjs/_esm5/internal/operators/multicast.js");
/** PURE_IMPORTS_START _ReplaySubject,_multicast PURE_IMPORTS_END */


function publishReplay(bufferSize, windowTime, selectorOrScheduler, scheduler) {
    if (selectorOrScheduler && typeof selectorOrScheduler !== 'function') {
        scheduler = selectorOrScheduler;
    }
    var selector = typeof selectorOrScheduler === 'function' ? selectorOrScheduler : undefined;
    var subject = new _ReplaySubject__WEBPACK_IMPORTED_MODULE_0__.ReplaySubject(bufferSize, windowTime, scheduler);
    return function (source) { return (0,_multicast__WEBPACK_IMPORTED_MODULE_1__.multicast)(function () { return subject; }, selector)(source); };
}
//# sourceMappingURL=publishReplay.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/race.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/race.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   race: () => (/* binding */ race)
/* harmony export */ });
/* harmony import */ var _util_isArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/* harmony import */ var _observable_race__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/race */ "../../node_modules/rxjs/_esm5/internal/observable/race.js");
/** PURE_IMPORTS_START _util_isArray,_observable_race PURE_IMPORTS_END */


function race() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    return function raceOperatorFunction(source) {
        if (observables.length === 1 && (0,_util_isArray__WEBPACK_IMPORTED_MODULE_0__.isArray)(observables[0])) {
            observables = observables[0];
        }
        return source.lift.call(_observable_race__WEBPACK_IMPORTED_MODULE_1__.race.apply(void 0, [source].concat(observables)));
    };
}
//# sourceMappingURL=race.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/reduce.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/reduce.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   reduce: () => (/* binding */ reduce)
/* harmony export */ });
/* harmony import */ var _scan__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scan */ "../../node_modules/rxjs/_esm5/internal/operators/scan.js");
/* harmony import */ var _takeLast__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./takeLast */ "../../node_modules/rxjs/_esm5/internal/operators/takeLast.js");
/* harmony import */ var _defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./defaultIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _util_pipe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/pipe */ "../../node_modules/rxjs/_esm5/internal/util/pipe.js");
/** PURE_IMPORTS_START _scan,_takeLast,_defaultIfEmpty,_util_pipe PURE_IMPORTS_END */




function reduce(accumulator, seed) {
    if (arguments.length >= 2) {
        return function reduceOperatorFunctionWithSeed(source) {
            return (0,_util_pipe__WEBPACK_IMPORTED_MODULE_0__.pipe)((0,_scan__WEBPACK_IMPORTED_MODULE_1__.scan)(accumulator, seed), (0,_takeLast__WEBPACK_IMPORTED_MODULE_2__.takeLast)(1), (0,_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__.defaultIfEmpty)(seed))(source);
        };
    }
    return function reduceOperatorFunction(source) {
        return (0,_util_pipe__WEBPACK_IMPORTED_MODULE_0__.pipe)((0,_scan__WEBPACK_IMPORTED_MODULE_1__.scan)(function (acc, value, index) { return accumulator(acc, value, index + 1); }), (0,_takeLast__WEBPACK_IMPORTED_MODULE_2__.takeLast)(1))(source);
    };
}
//# sourceMappingURL=reduce.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/refCount.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/refCount.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   refCount: () => (/* binding */ refCount)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function refCount() {
    return function refCountOperatorFunction(source) {
        return source.lift(new RefCountOperator(source));
    };
}
var RefCountOperator = /*@__PURE__*/ (function () {
    function RefCountOperator(connectable) {
        this.connectable = connectable;
    }
    RefCountOperator.prototype.call = function (subscriber, source) {
        var connectable = this.connectable;
        connectable._refCount++;
        var refCounter = new RefCountSubscriber(subscriber, connectable);
        var subscription = source.subscribe(refCounter);
        if (!refCounter.closed) {
            refCounter.connection = connectable.connect();
        }
        return subscription;
    };
    return RefCountOperator;
}());
var RefCountSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(RefCountSubscriber, _super);
    function RefCountSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    RefCountSubscriber.prototype._unsubscribe = function () {
        var connectable = this.connectable;
        if (!connectable) {
            this.connection = null;
            return;
        }
        this.connectable = null;
        var refCount = connectable._refCount;
        if (refCount <= 0) {
            this.connection = null;
            return;
        }
        connectable._refCount = refCount - 1;
        if (refCount > 1) {
            this.connection = null;
            return;
        }
        var connection = this.connection;
        var sharedConnection = connectable._connection;
        this.connection = null;
        if (sharedConnection && (!connection || sharedConnection === connection)) {
            sharedConnection.unsubscribe();
        }
    };
    return RefCountSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=refCount.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/repeat.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/repeat.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   repeat: () => (/* binding */ repeat)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _observable_empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_observable_empty PURE_IMPORTS_END */



function repeat(count) {
    if (count === void 0) {
        count = -1;
    }
    return function (source) {
        if (count === 0) {
            return (0,_observable_empty__WEBPACK_IMPORTED_MODULE_0__.empty)();
        }
        else if (count < 0) {
            return source.lift(new RepeatOperator(-1, source));
        }
        else {
            return source.lift(new RepeatOperator(count - 1, source));
        }
    };
}
var RepeatOperator = /*@__PURE__*/ (function () {
    function RepeatOperator(count, source) {
        this.count = count;
        this.source = source;
    }
    RepeatOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new RepeatSubscriber(subscriber, this.count, this.source));
    };
    return RepeatOperator;
}());
var RepeatSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_1__.__extends(RepeatSubscriber, _super);
    function RepeatSubscriber(destination, count, source) {
        var _this = _super.call(this, destination) || this;
        _this.count = count;
        _this.source = source;
        return _this;
    }
    RepeatSubscriber.prototype.complete = function () {
        if (!this.isStopped) {
            var _a = this, source = _a.source, count = _a.count;
            if (count === 0) {
                return _super.prototype.complete.call(this);
            }
            else if (count > -1) {
                this.count = count - 1;
            }
            source.subscribe(this._unsubscribeAndRecycle());
        }
    };
    return RepeatSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
//# sourceMappingURL=repeat.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/repeatWhen.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/repeatWhen.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   repeatWhen: () => (/* binding */ repeatWhen)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */



function repeatWhen(notifier) {
    return function (source) { return source.lift(new RepeatWhenOperator(notifier)); };
}
var RepeatWhenOperator = /*@__PURE__*/ (function () {
    function RepeatWhenOperator(notifier) {
        this.notifier = notifier;
    }
    RepeatWhenOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new RepeatWhenSubscriber(subscriber, this.notifier, source));
    };
    return RepeatWhenOperator;
}());
var RepeatWhenSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(RepeatWhenSubscriber, _super);
    function RepeatWhenSubscriber(destination, notifier, source) {
        var _this = _super.call(this, destination) || this;
        _this.notifier = notifier;
        _this.source = source;
        _this.sourceIsBeingSubscribedTo = true;
        return _this;
    }
    RepeatWhenSubscriber.prototype.notifyNext = function () {
        this.sourceIsBeingSubscribedTo = true;
        this.source.subscribe(this);
    };
    RepeatWhenSubscriber.prototype.notifyComplete = function () {
        if (this.sourceIsBeingSubscribedTo === false) {
            return _super.prototype.complete.call(this);
        }
    };
    RepeatWhenSubscriber.prototype.complete = function () {
        this.sourceIsBeingSubscribedTo = false;
        if (!this.isStopped) {
            if (!this.retries) {
                this.subscribeToRetries();
            }
            if (!this.retriesSubscription || this.retriesSubscription.closed) {
                return _super.prototype.complete.call(this);
            }
            this._unsubscribeAndRecycle();
            this.notifications.next(undefined);
        }
    };
    RepeatWhenSubscriber.prototype._unsubscribe = function () {
        var _a = this, notifications = _a.notifications, retriesSubscription = _a.retriesSubscription;
        if (notifications) {
            notifications.unsubscribe();
            this.notifications = undefined;
        }
        if (retriesSubscription) {
            retriesSubscription.unsubscribe();
            this.retriesSubscription = undefined;
        }
        this.retries = undefined;
    };
    RepeatWhenSubscriber.prototype._unsubscribeAndRecycle = function () {
        var _unsubscribe = this._unsubscribe;
        this._unsubscribe = null;
        _super.prototype._unsubscribeAndRecycle.call(this);
        this._unsubscribe = _unsubscribe;
        return this;
    };
    RepeatWhenSubscriber.prototype.subscribeToRetries = function () {
        this.notifications = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject();
        var retries;
        try {
            var notifier = this.notifier;
            retries = notifier(this.notifications);
        }
        catch (e) {
            return _super.prototype.complete.call(this);
        }
        this.retries = retries;
        this.retriesSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.innerSubscribe)(retries, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.SimpleInnerSubscriber(this));
    };
    return RepeatWhenSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.SimpleOuterSubscriber));
//# sourceMappingURL=repeatWhen.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/retry.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/retry.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   retry: () => (/* binding */ retry)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function retry(count) {
    if (count === void 0) {
        count = -1;
    }
    return function (source) { return source.lift(new RetryOperator(count, source)); };
}
var RetryOperator = /*@__PURE__*/ (function () {
    function RetryOperator(count, source) {
        this.count = count;
        this.source = source;
    }
    RetryOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new RetrySubscriber(subscriber, this.count, this.source));
    };
    return RetryOperator;
}());
var RetrySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(RetrySubscriber, _super);
    function RetrySubscriber(destination, count, source) {
        var _this = _super.call(this, destination) || this;
        _this.count = count;
        _this.source = source;
        return _this;
    }
    RetrySubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _a = this, source = _a.source, count = _a.count;
            if (count === 0) {
                return _super.prototype.error.call(this, err);
            }
            else if (count > -1) {
                this.count = count - 1;
            }
            source.subscribe(this._unsubscribeAndRecycle());
        }
    };
    return RetrySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=retry.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/retryWhen.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/retryWhen.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   retryWhen: () => (/* binding */ retryWhen)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */



function retryWhen(notifier) {
    return function (source) { return source.lift(new RetryWhenOperator(notifier, source)); };
}
var RetryWhenOperator = /*@__PURE__*/ (function () {
    function RetryWhenOperator(notifier, source) {
        this.notifier = notifier;
        this.source = source;
    }
    RetryWhenOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new RetryWhenSubscriber(subscriber, this.notifier, this.source));
    };
    return RetryWhenOperator;
}());
var RetryWhenSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(RetryWhenSubscriber, _super);
    function RetryWhenSubscriber(destination, notifier, source) {
        var _this = _super.call(this, destination) || this;
        _this.notifier = notifier;
        _this.source = source;
        return _this;
    }
    RetryWhenSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var errors = this.errors;
            var retries = this.retries;
            var retriesSubscription = this.retriesSubscription;
            if (!retries) {
                errors = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject();
                try {
                    var notifier = this.notifier;
                    retries = notifier(errors);
                }
                catch (e) {
                    return _super.prototype.error.call(this, e);
                }
                retriesSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.innerSubscribe)(retries, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.SimpleInnerSubscriber(this));
            }
            else {
                this.errors = undefined;
                this.retriesSubscription = undefined;
            }
            this._unsubscribeAndRecycle();
            this.errors = errors;
            this.retries = retries;
            this.retriesSubscription = retriesSubscription;
            errors.next(err);
        }
    };
    RetryWhenSubscriber.prototype._unsubscribe = function () {
        var _a = this, errors = _a.errors, retriesSubscription = _a.retriesSubscription;
        if (errors) {
            errors.unsubscribe();
            this.errors = undefined;
        }
        if (retriesSubscription) {
            retriesSubscription.unsubscribe();
            this.retriesSubscription = undefined;
        }
        this.retries = undefined;
    };
    RetryWhenSubscriber.prototype.notifyNext = function () {
        var _unsubscribe = this._unsubscribe;
        this._unsubscribe = null;
        this._unsubscribeAndRecycle();
        this._unsubscribe = _unsubscribe;
        this.source.subscribe(this);
    };
    return RetryWhenSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_2__.SimpleOuterSubscriber));
//# sourceMappingURL=retryWhen.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/sample.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/sample.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sample: () => (/* binding */ sample)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function sample(notifier) {
    return function (source) { return source.lift(new SampleOperator(notifier)); };
}
var SampleOperator = /*@__PURE__*/ (function () {
    function SampleOperator(notifier) {
        this.notifier = notifier;
    }
    SampleOperator.prototype.call = function (subscriber, source) {
        var sampleSubscriber = new SampleSubscriber(subscriber);
        var subscription = source.subscribe(sampleSubscriber);
        subscription.add((0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.innerSubscribe)(this.notifier, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.SimpleInnerSubscriber(sampleSubscriber)));
        return subscription;
    };
    return SampleOperator;
}());
var SampleSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_1__.__extends(SampleSubscriber, _super);
    function SampleSubscriber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hasValue = false;
        return _this;
    }
    SampleSubscriber.prototype._next = function (value) {
        this.value = value;
        this.hasValue = true;
    };
    SampleSubscriber.prototype.notifyNext = function () {
        this.emitValue();
    };
    SampleSubscriber.prototype.notifyComplete = function () {
        this.emitValue();
    };
    SampleSubscriber.prototype.emitValue = function () {
        if (this.hasValue) {
            this.hasValue = false;
            this.destination.next(this.value);
        }
    };
    return SampleSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.SimpleOuterSubscriber));
//# sourceMappingURL=sample.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/sampleTime.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/sampleTime.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sampleTime: () => (/* binding */ sampleTime)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */



function sampleTime(period, scheduler) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    return function (source) { return source.lift(new SampleTimeOperator(period, scheduler)); };
}
var SampleTimeOperator = /*@__PURE__*/ (function () {
    function SampleTimeOperator(period, scheduler) {
        this.period = period;
        this.scheduler = scheduler;
    }
    SampleTimeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SampleTimeSubscriber(subscriber, this.period, this.scheduler));
    };
    return SampleTimeOperator;
}());
var SampleTimeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_1__.__extends(SampleTimeSubscriber, _super);
    function SampleTimeSubscriber(destination, period, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.period = period;
        _this.scheduler = scheduler;
        _this.hasValue = false;
        _this.add(scheduler.schedule(dispatchNotification, period, { subscriber: _this, period: period }));
        return _this;
    }
    SampleTimeSubscriber.prototype._next = function (value) {
        this.lastValue = value;
        this.hasValue = true;
    };
    SampleTimeSubscriber.prototype.notifyNext = function () {
        if (this.hasValue) {
            this.hasValue = false;
            this.destination.next(this.lastValue);
        }
    };
    return SampleTimeSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
function dispatchNotification(state) {
    var subscriber = state.subscriber, period = state.period;
    subscriber.notifyNext();
    this.schedule(state, period);
}
//# sourceMappingURL=sampleTime.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/scan.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/scan.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   scan: () => (/* binding */ scan)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function scan(accumulator, seed) {
    var hasSeed = false;
    if (arguments.length >= 2) {
        hasSeed = true;
    }
    return function scanOperatorFunction(source) {
        return source.lift(new ScanOperator(accumulator, seed, hasSeed));
    };
}
var ScanOperator = /*@__PURE__*/ (function () {
    function ScanOperator(accumulator, seed, hasSeed) {
        if (hasSeed === void 0) {
            hasSeed = false;
        }
        this.accumulator = accumulator;
        this.seed = seed;
        this.hasSeed = hasSeed;
    }
    ScanOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
    };
    return ScanOperator;
}());
var ScanSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ScanSubscriber, _super);
    function ScanSubscriber(destination, accumulator, _seed, hasSeed) {
        var _this = _super.call(this, destination) || this;
        _this.accumulator = accumulator;
        _this._seed = _seed;
        _this.hasSeed = hasSeed;
        _this.index = 0;
        return _this;
    }
    Object.defineProperty(ScanSubscriber.prototype, "seed", {
        get: function () {
            return this._seed;
        },
        set: function (value) {
            this.hasSeed = true;
            this._seed = value;
        },
        enumerable: true,
        configurable: true
    });
    ScanSubscriber.prototype._next = function (value) {
        if (!this.hasSeed) {
            this.seed = value;
            this.destination.next(value);
        }
        else {
            return this._tryNext(value);
        }
    };
    ScanSubscriber.prototype._tryNext = function (value) {
        var index = this.index++;
        var result;
        try {
            result = this.accumulator(this.seed, value, index);
        }
        catch (err) {
            this.destination.error(err);
        }
        this.seed = result;
        this.destination.next(result);
    };
    return ScanSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=scan.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/sequenceEqual.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/sequenceEqual.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SequenceEqualOperator: () => (/* binding */ SequenceEqualOperator),
/* harmony export */   SequenceEqualSubscriber: () => (/* binding */ SequenceEqualSubscriber),
/* harmony export */   sequenceEqual: () => (/* binding */ sequenceEqual)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function sequenceEqual(compareTo, comparator) {
    return function (source) { return source.lift(new SequenceEqualOperator(compareTo, comparator)); };
}
var SequenceEqualOperator = /*@__PURE__*/ (function () {
    function SequenceEqualOperator(compareTo, comparator) {
        this.compareTo = compareTo;
        this.comparator = comparator;
    }
    SequenceEqualOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SequenceEqualSubscriber(subscriber, this.compareTo, this.comparator));
    };
    return SequenceEqualOperator;
}());

var SequenceEqualSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SequenceEqualSubscriber, _super);
    function SequenceEqualSubscriber(destination, compareTo, comparator) {
        var _this = _super.call(this, destination) || this;
        _this.compareTo = compareTo;
        _this.comparator = comparator;
        _this._a = [];
        _this._b = [];
        _this._oneComplete = false;
        _this.destination.add(compareTo.subscribe(new SequenceEqualCompareToSubscriber(destination, _this)));
        return _this;
    }
    SequenceEqualSubscriber.prototype._next = function (value) {
        if (this._oneComplete && this._b.length === 0) {
            this.emit(false);
        }
        else {
            this._a.push(value);
            this.checkValues();
        }
    };
    SequenceEqualSubscriber.prototype._complete = function () {
        if (this._oneComplete) {
            this.emit(this._a.length === 0 && this._b.length === 0);
        }
        else {
            this._oneComplete = true;
        }
        this.unsubscribe();
    };
    SequenceEqualSubscriber.prototype.checkValues = function () {
        var _c = this, _a = _c._a, _b = _c._b, comparator = _c.comparator;
        while (_a.length > 0 && _b.length > 0) {
            var a = _a.shift();
            var b = _b.shift();
            var areEqual = false;
            try {
                areEqual = comparator ? comparator(a, b) : a === b;
            }
            catch (e) {
                this.destination.error(e);
            }
            if (!areEqual) {
                this.emit(false);
            }
        }
    };
    SequenceEqualSubscriber.prototype.emit = function (value) {
        var destination = this.destination;
        destination.next(value);
        destination.complete();
    };
    SequenceEqualSubscriber.prototype.nextB = function (value) {
        if (this._oneComplete && this._a.length === 0) {
            this.emit(false);
        }
        else {
            this._b.push(value);
            this.checkValues();
        }
    };
    SequenceEqualSubscriber.prototype.completeB = function () {
        if (this._oneComplete) {
            this.emit(this._a.length === 0 && this._b.length === 0);
        }
        else {
            this._oneComplete = true;
        }
    };
    return SequenceEqualSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

var SequenceEqualCompareToSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SequenceEqualCompareToSubscriber, _super);
    function SequenceEqualCompareToSubscriber(destination, parent) {
        var _this = _super.call(this, destination) || this;
        _this.parent = parent;
        return _this;
    }
    SequenceEqualCompareToSubscriber.prototype._next = function (value) {
        this.parent.nextB(value);
    };
    SequenceEqualCompareToSubscriber.prototype._error = function (err) {
        this.parent.error(err);
        this.unsubscribe();
    };
    SequenceEqualCompareToSubscriber.prototype._complete = function () {
        this.parent.completeB();
        this.unsubscribe();
    };
    return SequenceEqualCompareToSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=sequenceEqual.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/share.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/share.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   share: () => (/* binding */ share)
/* harmony export */ });
/* harmony import */ var _multicast__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./multicast */ "../../node_modules/rxjs/_esm5/internal/operators/multicast.js");
/* harmony import */ var _refCount__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./refCount */ "../../node_modules/rxjs/_esm5/internal/operators/refCount.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/** PURE_IMPORTS_START _multicast,_refCount,_Subject PURE_IMPORTS_END */



function shareSubjectFactory() {
    return new _Subject__WEBPACK_IMPORTED_MODULE_0__.Subject();
}
function share() {
    return function (source) { return (0,_refCount__WEBPACK_IMPORTED_MODULE_1__.refCount)()((0,_multicast__WEBPACK_IMPORTED_MODULE_2__.multicast)(shareSubjectFactory)(source)); };
}
//# sourceMappingURL=share.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/shareReplay.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/shareReplay.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   shareReplay: () => (/* binding */ shareReplay)
/* harmony export */ });
/* harmony import */ var _ReplaySubject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ReplaySubject */ "../../node_modules/rxjs/_esm5/internal/ReplaySubject.js");
/** PURE_IMPORTS_START _ReplaySubject PURE_IMPORTS_END */

function shareReplay(configOrBufferSize, windowTime, scheduler) {
    var config;
    if (configOrBufferSize && typeof configOrBufferSize === 'object') {
        config = configOrBufferSize;
    }
    else {
        config = {
            bufferSize: configOrBufferSize,
            windowTime: windowTime,
            refCount: false,
            scheduler: scheduler,
        };
    }
    return function (source) { return source.lift(shareReplayOperator(config)); };
}
function shareReplayOperator(_a) {
    var _b = _a.bufferSize, bufferSize = _b === void 0 ? Number.POSITIVE_INFINITY : _b, _c = _a.windowTime, windowTime = _c === void 0 ? Number.POSITIVE_INFINITY : _c, useRefCount = _a.refCount, scheduler = _a.scheduler;
    var subject;
    var refCount = 0;
    var subscription;
    var hasError = false;
    var isComplete = false;
    return function shareReplayOperation(source) {
        refCount++;
        var innerSub;
        if (!subject || hasError) {
            hasError = false;
            subject = new _ReplaySubject__WEBPACK_IMPORTED_MODULE_0__.ReplaySubject(bufferSize, windowTime, scheduler);
            innerSub = subject.subscribe(this);
            subscription = source.subscribe({
                next: function (value) {
                    subject.next(value);
                },
                error: function (err) {
                    hasError = true;
                    subject.error(err);
                },
                complete: function () {
                    isComplete = true;
                    subscription = undefined;
                    subject.complete();
                },
            });
            if (isComplete) {
                subscription = undefined;
            }
        }
        else {
            innerSub = subject.subscribe(this);
        }
        this.add(function () {
            refCount--;
            innerSub.unsubscribe();
            innerSub = undefined;
            if (subscription && !isComplete && useRefCount && refCount === 0) {
                subscription.unsubscribe();
                subscription = undefined;
                subject = undefined;
            }
        });
    };
}
//# sourceMappingURL=shareReplay.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/single.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/single.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   single: () => (/* binding */ single)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/EmptyError */ "../../node_modules/rxjs/_esm5/internal/util/EmptyError.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_util_EmptyError PURE_IMPORTS_END */



function single(predicate) {
    return function (source) { return source.lift(new SingleOperator(predicate, source)); };
}
var SingleOperator = /*@__PURE__*/ (function () {
    function SingleOperator(predicate, source) {
        this.predicate = predicate;
        this.source = source;
    }
    SingleOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SingleSubscriber(subscriber, this.predicate, this.source));
    };
    return SingleOperator;
}());
var SingleSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SingleSubscriber, _super);
    function SingleSubscriber(destination, predicate, source) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.source = source;
        _this.seenValue = false;
        _this.index = 0;
        return _this;
    }
    SingleSubscriber.prototype.applySingleValue = function (value) {
        if (this.seenValue) {
            this.destination.error('Sequence contains more than one element');
        }
        else {
            this.seenValue = true;
            this.singleValue = value;
        }
    };
    SingleSubscriber.prototype._next = function (value) {
        var index = this.index++;
        if (this.predicate) {
            this.tryNext(value, index);
        }
        else {
            this.applySingleValue(value);
        }
    };
    SingleSubscriber.prototype.tryNext = function (value, index) {
        try {
            if (this.predicate(value, index, this.source)) {
                this.applySingleValue(value);
            }
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    SingleSubscriber.prototype._complete = function () {
        var destination = this.destination;
        if (this.index > 0) {
            destination.next(this.seenValue ? this.singleValue : undefined);
            destination.complete();
        }
        else {
            destination.error(new _util_EmptyError__WEBPACK_IMPORTED_MODULE_1__.EmptyError);
        }
    };
    return SingleSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
//# sourceMappingURL=single.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/skip.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/skip.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   skip: () => (/* binding */ skip)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function skip(count) {
    return function (source) { return source.lift(new SkipOperator(count)); };
}
var SkipOperator = /*@__PURE__*/ (function () {
    function SkipOperator(total) {
        this.total = total;
    }
    SkipOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SkipSubscriber(subscriber, this.total));
    };
    return SkipOperator;
}());
var SkipSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SkipSubscriber, _super);
    function SkipSubscriber(destination, total) {
        var _this = _super.call(this, destination) || this;
        _this.total = total;
        _this.count = 0;
        return _this;
    }
    SkipSubscriber.prototype._next = function (x) {
        if (++this.count > this.total) {
            this.destination.next(x);
        }
    };
    return SkipSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=skip.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/skipLast.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/skipLast.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   skipLast: () => (/* binding */ skipLast)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/ArgumentOutOfRangeError */ "../../node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError PURE_IMPORTS_END */



function skipLast(count) {
    return function (source) { return source.lift(new SkipLastOperator(count)); };
}
var SkipLastOperator = /*@__PURE__*/ (function () {
    function SkipLastOperator(_skipCount) {
        this._skipCount = _skipCount;
        if (this._skipCount < 0) {
            throw new _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_0__.ArgumentOutOfRangeError;
        }
    }
    SkipLastOperator.prototype.call = function (subscriber, source) {
        if (this._skipCount === 0) {
            return source.subscribe(new _Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber(subscriber));
        }
        else {
            return source.subscribe(new SkipLastSubscriber(subscriber, this._skipCount));
        }
    };
    return SkipLastOperator;
}());
var SkipLastSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(SkipLastSubscriber, _super);
    function SkipLastSubscriber(destination, _skipCount) {
        var _this = _super.call(this, destination) || this;
        _this._skipCount = _skipCount;
        _this._count = 0;
        _this._ring = new Array(_skipCount);
        return _this;
    }
    SkipLastSubscriber.prototype._next = function (value) {
        var skipCount = this._skipCount;
        var count = this._count++;
        if (count < skipCount) {
            this._ring[count] = value;
        }
        else {
            var currentIndex = count % skipCount;
            var ring = this._ring;
            var oldValue = ring[currentIndex];
            ring[currentIndex] = value;
            this.destination.next(oldValue);
        }
    };
    return SkipLastSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=skipLast.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/skipUntil.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/skipUntil.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   skipUntil: () => (/* binding */ skipUntil)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function skipUntil(notifier) {
    return function (source) { return source.lift(new SkipUntilOperator(notifier)); };
}
var SkipUntilOperator = /*@__PURE__*/ (function () {
    function SkipUntilOperator(notifier) {
        this.notifier = notifier;
    }
    SkipUntilOperator.prototype.call = function (destination, source) {
        return source.subscribe(new SkipUntilSubscriber(destination, this.notifier));
    };
    return SkipUntilOperator;
}());
var SkipUntilSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SkipUntilSubscriber, _super);
    function SkipUntilSubscriber(destination, notifier) {
        var _this = _super.call(this, destination) || this;
        _this.hasValue = false;
        var innerSubscriber = new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(_this);
        _this.add(innerSubscriber);
        _this.innerSubscription = innerSubscriber;
        var innerSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(notifier, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            _this.add(innerSubscription);
            _this.innerSubscription = innerSubscription;
        }
        return _this;
    }
    SkipUntilSubscriber.prototype._next = function (value) {
        if (this.hasValue) {
            _super.prototype._next.call(this, value);
        }
    };
    SkipUntilSubscriber.prototype.notifyNext = function () {
        this.hasValue = true;
        if (this.innerSubscription) {
            this.innerSubscription.unsubscribe();
        }
    };
    SkipUntilSubscriber.prototype.notifyComplete = function () {
    };
    return SkipUntilSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));
//# sourceMappingURL=skipUntil.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/skipWhile.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/skipWhile.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   skipWhile: () => (/* binding */ skipWhile)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function skipWhile(predicate) {
    return function (source) { return source.lift(new SkipWhileOperator(predicate)); };
}
var SkipWhileOperator = /*@__PURE__*/ (function () {
    function SkipWhileOperator(predicate) {
        this.predicate = predicate;
    }
    SkipWhileOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SkipWhileSubscriber(subscriber, this.predicate));
    };
    return SkipWhileOperator;
}());
var SkipWhileSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(SkipWhileSubscriber, _super);
    function SkipWhileSubscriber(destination, predicate) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.skipping = true;
        _this.index = 0;
        return _this;
    }
    SkipWhileSubscriber.prototype._next = function (value) {
        var destination = this.destination;
        if (this.skipping) {
            this.tryCallPredicate(value);
        }
        if (!this.skipping) {
            destination.next(value);
        }
    };
    SkipWhileSubscriber.prototype.tryCallPredicate = function (value) {
        try {
            var result = this.predicate(value, this.index++);
            this.skipping = Boolean(result);
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    return SkipWhileSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=skipWhile.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/startWith.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/startWith.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   startWith: () => (/* binding */ startWith)
/* harmony export */ });
/* harmony import */ var _observable_concat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/concat */ "../../node_modules/rxjs/_esm5/internal/observable/concat.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/** PURE_IMPORTS_START _observable_concat,_util_isScheduler PURE_IMPORTS_END */


function startWith() {
    var array = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        array[_i] = arguments[_i];
    }
    var scheduler = array[array.length - 1];
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_0__.isScheduler)(scheduler)) {
        array.pop();
        return function (source) { return (0,_observable_concat__WEBPACK_IMPORTED_MODULE_1__.concat)(array, source, scheduler); };
    }
    else {
        return function (source) { return (0,_observable_concat__WEBPACK_IMPORTED_MODULE_1__.concat)(array, source); };
    }
}
//# sourceMappingURL=startWith.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/subscribeOn.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/subscribeOn.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   subscribeOn: () => (/* binding */ subscribeOn)
/* harmony export */ });
/* harmony import */ var _observable_SubscribeOnObservable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/SubscribeOnObservable */ "../../node_modules/rxjs/_esm5/internal/observable/SubscribeOnObservable.js");
/** PURE_IMPORTS_START _observable_SubscribeOnObservable PURE_IMPORTS_END */

function subscribeOn(scheduler, delay) {
    if (delay === void 0) {
        delay = 0;
    }
    return function subscribeOnOperatorFunction(source) {
        return source.lift(new SubscribeOnOperator(scheduler, delay));
    };
}
var SubscribeOnOperator = /*@__PURE__*/ (function () {
    function SubscribeOnOperator(scheduler, delay) {
        this.scheduler = scheduler;
        this.delay = delay;
    }
    SubscribeOnOperator.prototype.call = function (subscriber, source) {
        return new _observable_SubscribeOnObservable__WEBPACK_IMPORTED_MODULE_0__.SubscribeOnObservable(source, this.delay, this.scheduler).subscribe(subscriber);
    };
    return SubscribeOnOperator;
}());
//# sourceMappingURL=subscribeOn.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/switchAll.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/switchAll.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   switchAll: () => (/* binding */ switchAll)
/* harmony export */ });
/* harmony import */ var _switchMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./switchMap */ "../../node_modules/rxjs/_esm5/internal/operators/switchMap.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/identity */ "../../node_modules/rxjs/_esm5/internal/util/identity.js");
/** PURE_IMPORTS_START _switchMap,_util_identity PURE_IMPORTS_END */


function switchAll() {
    return (0,_switchMap__WEBPACK_IMPORTED_MODULE_0__.switchMap)(_util_identity__WEBPACK_IMPORTED_MODULE_1__.identity);
}
//# sourceMappingURL=switchAll.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/switchMap.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/switchMap.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   switchMap: () => (/* binding */ switchMap)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/from */ "../../node_modules/rxjs/_esm5/internal/observable/from.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */




function switchMap(project, resultSelector) {
    if (typeof resultSelector === 'function') {
        return function (source) { return source.pipe(switchMap(function (a, i) { return (0,_observable_from__WEBPACK_IMPORTED_MODULE_0__.from)(project(a, i)).pipe((0,_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (b, ii) { return resultSelector(a, b, i, ii); })); })); };
    }
    return function (source) { return source.lift(new SwitchMapOperator(project)); };
}
var SwitchMapOperator = /*@__PURE__*/ (function () {
    function SwitchMapOperator(project) {
        this.project = project;
    }
    SwitchMapOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SwitchMapSubscriber(subscriber, this.project));
    };
    return SwitchMapOperator;
}());
var SwitchMapSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(SwitchMapSubscriber, _super);
    function SwitchMapSubscriber(destination, project) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.index = 0;
        return _this;
    }
    SwitchMapSubscriber.prototype._next = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (error) {
            this.destination.error(error);
            return;
        }
        this._innerSub(result);
    };
    SwitchMapSubscriber.prototype._innerSub = function (result) {
        var innerSubscription = this.innerSubscription;
        if (innerSubscription) {
            innerSubscription.unsubscribe();
        }
        var innerSubscriber = new _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        this.innerSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.innerSubscribe)(result, innerSubscriber);
        if (this.innerSubscription !== innerSubscriber) {
            destination.add(this.innerSubscription);
        }
    };
    SwitchMapSubscriber.prototype._complete = function () {
        var innerSubscription = this.innerSubscription;
        if (!innerSubscription || innerSubscription.closed) {
            _super.prototype._complete.call(this);
        }
        this.unsubscribe();
    };
    SwitchMapSubscriber.prototype._unsubscribe = function () {
        this.innerSubscription = undefined;
    };
    SwitchMapSubscriber.prototype.notifyComplete = function () {
        this.innerSubscription = undefined;
        if (this.isStopped) {
            _super.prototype._complete.call(this);
        }
    };
    SwitchMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    return SwitchMapSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleOuterSubscriber));
//# sourceMappingURL=switchMap.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/switchMapTo.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/switchMapTo.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   switchMapTo: () => (/* binding */ switchMapTo)
/* harmony export */ });
/* harmony import */ var _switchMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./switchMap */ "../../node_modules/rxjs/_esm5/internal/operators/switchMap.js");
/** PURE_IMPORTS_START _switchMap PURE_IMPORTS_END */

function switchMapTo(innerObservable, resultSelector) {
    return resultSelector ? (0,_switchMap__WEBPACK_IMPORTED_MODULE_0__.switchMap)(function () { return innerObservable; }, resultSelector) : (0,_switchMap__WEBPACK_IMPORTED_MODULE_0__.switchMap)(function () { return innerObservable; });
}
//# sourceMappingURL=switchMapTo.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/take.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/take.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   take: () => (/* binding */ take)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/ArgumentOutOfRangeError */ "../../node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js");
/* harmony import */ var _observable_empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */




function take(count) {
    return function (source) {
        if (count === 0) {
            return (0,_observable_empty__WEBPACK_IMPORTED_MODULE_0__.empty)();
        }
        else {
            return source.lift(new TakeOperator(count));
        }
    };
}
var TakeOperator = /*@__PURE__*/ (function () {
    function TakeOperator(total) {
        this.total = total;
        if (this.total < 0) {
            throw new _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_1__.ArgumentOutOfRangeError;
        }
    }
    TakeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TakeSubscriber(subscriber, this.total));
    };
    return TakeOperator;
}());
var TakeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(TakeSubscriber, _super);
    function TakeSubscriber(destination, total) {
        var _this = _super.call(this, destination) || this;
        _this.total = total;
        _this.count = 0;
        return _this;
    }
    TakeSubscriber.prototype._next = function (value) {
        var total = this.total;
        var count = ++this.count;
        if (count <= total) {
            this.destination.next(value);
            if (count === total) {
                this.destination.complete();
                this.unsubscribe();
            }
        }
    };
    return TakeSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_3__.Subscriber));
//# sourceMappingURL=take.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/takeLast.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/takeLast.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   takeLast: () => (/* binding */ takeLast)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/ArgumentOutOfRangeError */ "../../node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js");
/* harmony import */ var _observable_empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/empty */ "../../node_modules/rxjs/_esm5/internal/observable/empty.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */




function takeLast(count) {
    return function takeLastOperatorFunction(source) {
        if (count === 0) {
            return (0,_observable_empty__WEBPACK_IMPORTED_MODULE_0__.empty)();
        }
        else {
            return source.lift(new TakeLastOperator(count));
        }
    };
}
var TakeLastOperator = /*@__PURE__*/ (function () {
    function TakeLastOperator(total) {
        this.total = total;
        if (this.total < 0) {
            throw new _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_1__.ArgumentOutOfRangeError;
        }
    }
    TakeLastOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TakeLastSubscriber(subscriber, this.total));
    };
    return TakeLastOperator;
}());
var TakeLastSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(TakeLastSubscriber, _super);
    function TakeLastSubscriber(destination, total) {
        var _this = _super.call(this, destination) || this;
        _this.total = total;
        _this.ring = new Array();
        _this.count = 0;
        return _this;
    }
    TakeLastSubscriber.prototype._next = function (value) {
        var ring = this.ring;
        var total = this.total;
        var count = this.count++;
        if (ring.length < total) {
            ring.push(value);
        }
        else {
            var index = count % total;
            ring[index] = value;
        }
    };
    TakeLastSubscriber.prototype._complete = function () {
        var destination = this.destination;
        var count = this.count;
        if (count > 0) {
            var total = this.count >= this.total ? this.total : this.count;
            var ring = this.ring;
            for (var i = 0; i < total; i++) {
                var idx = (count++) % total;
                destination.next(ring[idx]);
            }
        }
        destination.complete();
    };
    return TakeLastSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_3__.Subscriber));
//# sourceMappingURL=takeLast.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/takeUntil.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/takeUntil.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   takeUntil: () => (/* binding */ takeUntil)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function takeUntil(notifier) {
    return function (source) { return source.lift(new TakeUntilOperator(notifier)); };
}
var TakeUntilOperator = /*@__PURE__*/ (function () {
    function TakeUntilOperator(notifier) {
        this.notifier = notifier;
    }
    TakeUntilOperator.prototype.call = function (subscriber, source) {
        var takeUntilSubscriber = new TakeUntilSubscriber(subscriber);
        var notifierSubscription = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.innerSubscribe)(this.notifier, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.SimpleInnerSubscriber(takeUntilSubscriber));
        if (notifierSubscription && !takeUntilSubscriber.seenValue) {
            takeUntilSubscriber.add(notifierSubscription);
            return source.subscribe(takeUntilSubscriber);
        }
        return takeUntilSubscriber;
    };
    return TakeUntilOperator;
}());
var TakeUntilSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_1__.__extends(TakeUntilSubscriber, _super);
    function TakeUntilSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.seenValue = false;
        return _this;
    }
    TakeUntilSubscriber.prototype.notifyNext = function () {
        this.seenValue = true;
        this.complete();
    };
    TakeUntilSubscriber.prototype.notifyComplete = function () {
    };
    return TakeUntilSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.SimpleOuterSubscriber));
//# sourceMappingURL=takeUntil.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/takeWhile.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/takeWhile.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   takeWhile: () => (/* binding */ takeWhile)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function takeWhile(predicate, inclusive) {
    if (inclusive === void 0) {
        inclusive = false;
    }
    return function (source) {
        return source.lift(new TakeWhileOperator(predicate, inclusive));
    };
}
var TakeWhileOperator = /*@__PURE__*/ (function () {
    function TakeWhileOperator(predicate, inclusive) {
        this.predicate = predicate;
        this.inclusive = inclusive;
    }
    TakeWhileOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TakeWhileSubscriber(subscriber, this.predicate, this.inclusive));
    };
    return TakeWhileOperator;
}());
var TakeWhileSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(TakeWhileSubscriber, _super);
    function TakeWhileSubscriber(destination, predicate, inclusive) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.inclusive = inclusive;
        _this.index = 0;
        return _this;
    }
    TakeWhileSubscriber.prototype._next = function (value) {
        var destination = this.destination;
        var result;
        try {
            result = this.predicate(value, this.index++);
        }
        catch (err) {
            destination.error(err);
            return;
        }
        this.nextOrComplete(value, result);
    };
    TakeWhileSubscriber.prototype.nextOrComplete = function (value, predicateResult) {
        var destination = this.destination;
        if (Boolean(predicateResult)) {
            destination.next(value);
        }
        else {
            if (this.inclusive) {
                destination.next(value);
            }
            destination.complete();
        }
    };
    return TakeWhileSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
//# sourceMappingURL=takeWhile.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/tap.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/tap.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   tap: () => (/* binding */ tap)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/noop */ "../../node_modules/rxjs/_esm5/internal/util/noop.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isFunction */ "../../node_modules/rxjs/_esm5/internal/util/isFunction.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_util_noop,_util_isFunction PURE_IMPORTS_END */




function tap(nextOrObserver, error, complete) {
    return function tapOperatorFunction(source) {
        return source.lift(new DoOperator(nextOrObserver, error, complete));
    };
}
var DoOperator = /*@__PURE__*/ (function () {
    function DoOperator(nextOrObserver, error, complete) {
        this.nextOrObserver = nextOrObserver;
        this.error = error;
        this.complete = complete;
    }
    DoOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TapSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
    };
    return DoOperator;
}());
var TapSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(TapSubscriber, _super);
    function TapSubscriber(destination, observerOrNext, error, complete) {
        var _this = _super.call(this, destination) || this;
        _this._tapNext = _util_noop__WEBPACK_IMPORTED_MODULE_1__.noop;
        _this._tapError = _util_noop__WEBPACK_IMPORTED_MODULE_1__.noop;
        _this._tapComplete = _util_noop__WEBPACK_IMPORTED_MODULE_1__.noop;
        _this._tapError = error || _util_noop__WEBPACK_IMPORTED_MODULE_1__.noop;
        _this._tapComplete = complete || _util_noop__WEBPACK_IMPORTED_MODULE_1__.noop;
        if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_2__.isFunction)(observerOrNext)) {
            _this._context = _this;
            _this._tapNext = observerOrNext;
        }
        else if (observerOrNext) {
            _this._context = observerOrNext;
            _this._tapNext = observerOrNext.next || _util_noop__WEBPACK_IMPORTED_MODULE_1__.noop;
            _this._tapError = observerOrNext.error || _util_noop__WEBPACK_IMPORTED_MODULE_1__.noop;
            _this._tapComplete = observerOrNext.complete || _util_noop__WEBPACK_IMPORTED_MODULE_1__.noop;
        }
        return _this;
    }
    TapSubscriber.prototype._next = function (value) {
        try {
            this._tapNext.call(this._context, value);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(value);
    };
    TapSubscriber.prototype._error = function (err) {
        try {
            this._tapError.call(this._context, err);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.error(err);
    };
    TapSubscriber.prototype._complete = function () {
        try {
            this._tapComplete.call(this._context);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        return this.destination.complete();
    };
    return TapSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_3__.Subscriber));
//# sourceMappingURL=tap.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/throttle.js":
/*!********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/throttle.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultThrottleConfig: () => (/* binding */ defaultThrottleConfig),
/* harmony export */   throttle: () => (/* binding */ throttle)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


var defaultThrottleConfig = {
    leading: true,
    trailing: false
};
function throttle(durationSelector, config) {
    if (config === void 0) {
        config = defaultThrottleConfig;
    }
    return function (source) { return source.lift(new ThrottleOperator(durationSelector, !!config.leading, !!config.trailing)); };
}
var ThrottleOperator = /*@__PURE__*/ (function () {
    function ThrottleOperator(durationSelector, leading, trailing) {
        this.durationSelector = durationSelector;
        this.leading = leading;
        this.trailing = trailing;
    }
    ThrottleOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ThrottleSubscriber(subscriber, this.durationSelector, this.leading, this.trailing));
    };
    return ThrottleOperator;
}());
var ThrottleSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ThrottleSubscriber, _super);
    function ThrottleSubscriber(destination, durationSelector, _leading, _trailing) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.durationSelector = durationSelector;
        _this._leading = _leading;
        _this._trailing = _trailing;
        _this._hasValue = false;
        return _this;
    }
    ThrottleSubscriber.prototype._next = function (value) {
        this._hasValue = true;
        this._sendValue = value;
        if (!this._throttled) {
            if (this._leading) {
                this.send();
            }
            else {
                this.throttle(value);
            }
        }
    };
    ThrottleSubscriber.prototype.send = function () {
        var _a = this, _hasValue = _a._hasValue, _sendValue = _a._sendValue;
        if (_hasValue) {
            this.destination.next(_sendValue);
            this.throttle(_sendValue);
        }
        this._hasValue = false;
        this._sendValue = undefined;
    };
    ThrottleSubscriber.prototype.throttle = function (value) {
        var duration = this.tryDurationSelector(value);
        if (!!duration) {
            this.add(this._throttled = (0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.innerSubscribe)(duration, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleInnerSubscriber(this)));
        }
    };
    ThrottleSubscriber.prototype.tryDurationSelector = function (value) {
        try {
            return this.durationSelector(value);
        }
        catch (err) {
            this.destination.error(err);
            return null;
        }
    };
    ThrottleSubscriber.prototype.throttlingDone = function () {
        var _a = this, _throttled = _a._throttled, _trailing = _a._trailing;
        if (_throttled) {
            _throttled.unsubscribe();
        }
        this._throttled = undefined;
        if (_trailing) {
            this.send();
        }
    };
    ThrottleSubscriber.prototype.notifyNext = function () {
        this.throttlingDone();
    };
    ThrottleSubscriber.prototype.notifyComplete = function () {
        this.throttlingDone();
    };
    return ThrottleSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_1__.SimpleOuterSubscriber));
//# sourceMappingURL=throttle.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/throttleTime.js":
/*!************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/throttleTime.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   throttleTime: () => (/* binding */ throttleTime)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _throttle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./throttle */ "../../node_modules/rxjs/_esm5/internal/operators/throttle.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async,_throttle PURE_IMPORTS_END */




function throttleTime(duration, scheduler, config) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    if (config === void 0) {
        config = _throttle__WEBPACK_IMPORTED_MODULE_1__.defaultThrottleConfig;
    }
    return function (source) { return source.lift(new ThrottleTimeOperator(duration, scheduler, config.leading, config.trailing)); };
}
var ThrottleTimeOperator = /*@__PURE__*/ (function () {
    function ThrottleTimeOperator(duration, scheduler, leading, trailing) {
        this.duration = duration;
        this.scheduler = scheduler;
        this.leading = leading;
        this.trailing = trailing;
    }
    ThrottleTimeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler, this.leading, this.trailing));
    };
    return ThrottleTimeOperator;
}());
var ThrottleTimeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(ThrottleTimeSubscriber, _super);
    function ThrottleTimeSubscriber(destination, duration, scheduler, leading, trailing) {
        var _this = _super.call(this, destination) || this;
        _this.duration = duration;
        _this.scheduler = scheduler;
        _this.leading = leading;
        _this.trailing = trailing;
        _this._hasTrailingValue = false;
        _this._trailingValue = null;
        return _this;
    }
    ThrottleTimeSubscriber.prototype._next = function (value) {
        if (this.throttled) {
            if (this.trailing) {
                this._trailingValue = value;
                this._hasTrailingValue = true;
            }
        }
        else {
            this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, { subscriber: this }));
            if (this.leading) {
                this.destination.next(value);
            }
            else if (this.trailing) {
                this._trailingValue = value;
                this._hasTrailingValue = true;
            }
        }
    };
    ThrottleTimeSubscriber.prototype._complete = function () {
        if (this._hasTrailingValue) {
            this.destination.next(this._trailingValue);
            this.destination.complete();
        }
        else {
            this.destination.complete();
        }
    };
    ThrottleTimeSubscriber.prototype.clearThrottle = function () {
        var throttled = this.throttled;
        if (throttled) {
            if (this.trailing && this._hasTrailingValue) {
                this.destination.next(this._trailingValue);
                this._trailingValue = null;
                this._hasTrailingValue = false;
            }
            throttled.unsubscribe();
            this.remove(throttled);
            this.throttled = null;
        }
    };
    return ThrottleTimeSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_3__.Subscriber));
function dispatchNext(arg) {
    var subscriber = arg.subscriber;
    subscriber.clearThrottle();
}
//# sourceMappingURL=throttleTime.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/throwIfEmpty.js":
/*!************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/throwIfEmpty.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   throwIfEmpty: () => (/* binding */ throwIfEmpty)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/EmptyError */ "../../node_modules/rxjs/_esm5/internal/util/EmptyError.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START tslib,_util_EmptyError,_Subscriber PURE_IMPORTS_END */



function throwIfEmpty(errorFactory) {
    if (errorFactory === void 0) {
        errorFactory = defaultErrorFactory;
    }
    return function (source) {
        return source.lift(new ThrowIfEmptyOperator(errorFactory));
    };
}
var ThrowIfEmptyOperator = /*@__PURE__*/ (function () {
    function ThrowIfEmptyOperator(errorFactory) {
        this.errorFactory = errorFactory;
    }
    ThrowIfEmptyOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ThrowIfEmptySubscriber(subscriber, this.errorFactory));
    };
    return ThrowIfEmptyOperator;
}());
var ThrowIfEmptySubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(ThrowIfEmptySubscriber, _super);
    function ThrowIfEmptySubscriber(destination, errorFactory) {
        var _this = _super.call(this, destination) || this;
        _this.errorFactory = errorFactory;
        _this.hasValue = false;
        return _this;
    }
    ThrowIfEmptySubscriber.prototype._next = function (value) {
        this.hasValue = true;
        this.destination.next(value);
    };
    ThrowIfEmptySubscriber.prototype._complete = function () {
        if (!this.hasValue) {
            var err = void 0;
            try {
                err = this.errorFactory();
            }
            catch (e) {
                err = e;
            }
            this.destination.error(err);
        }
        else {
            return this.destination.complete();
        }
    };
    return ThrowIfEmptySubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));
function defaultErrorFactory() {
    return new _util_EmptyError__WEBPACK_IMPORTED_MODULE_2__.EmptyError();
}
//# sourceMappingURL=throwIfEmpty.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/timeInterval.js":
/*!************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/timeInterval.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimeInterval: () => (/* binding */ TimeInterval),
/* harmony export */   timeInterval: () => (/* binding */ timeInterval)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _scan__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scan */ "../../node_modules/rxjs/_esm5/internal/operators/scan.js");
/* harmony import */ var _observable_defer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/defer */ "../../node_modules/rxjs/_esm5/internal/observable/defer.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/** PURE_IMPORTS_START _scheduler_async,_scan,_observable_defer,_map PURE_IMPORTS_END */




function timeInterval(scheduler) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    return function (source) {
        return (0,_observable_defer__WEBPACK_IMPORTED_MODULE_1__.defer)(function () {
            return source.pipe((0,_scan__WEBPACK_IMPORTED_MODULE_2__.scan)(function (_a, value) {
                var current = _a.current;
                return ({ value: value, current: scheduler.now(), last: current });
            }, { current: scheduler.now(), value: undefined, last: undefined }), (0,_map__WEBPACK_IMPORTED_MODULE_3__.map)(function (_a) {
                var current = _a.current, last = _a.last, value = _a.value;
                return new TimeInterval(value, current - last);
            }));
        });
    };
}
var TimeInterval = /*@__PURE__*/ (function () {
    function TimeInterval(value, interval) {
        this.value = value;
        this.interval = interval;
    }
    return TimeInterval;
}());

//# sourceMappingURL=timeInterval.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/timeout.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/timeout.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   timeout: () => (/* binding */ timeout)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _util_TimeoutError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/TimeoutError */ "../../node_modules/rxjs/_esm5/internal/util/TimeoutError.js");
/* harmony import */ var _timeoutWith__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./timeoutWith */ "../../node_modules/rxjs/_esm5/internal/operators/timeoutWith.js");
/* harmony import */ var _observable_throwError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/throwError */ "../../node_modules/rxjs/_esm5/internal/observable/throwError.js");
/** PURE_IMPORTS_START _scheduler_async,_util_TimeoutError,_timeoutWith,_observable_throwError PURE_IMPORTS_END */




function timeout(due, scheduler) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    return (0,_timeoutWith__WEBPACK_IMPORTED_MODULE_1__.timeoutWith)(due, (0,_observable_throwError__WEBPACK_IMPORTED_MODULE_2__.throwError)(new _util_TimeoutError__WEBPACK_IMPORTED_MODULE_3__.TimeoutError()), scheduler);
}
//# sourceMappingURL=timeout.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/timeoutWith.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/timeoutWith.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   timeoutWith: () => (/* binding */ timeoutWith)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _util_isDate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isDate */ "../../node_modules/rxjs/_esm5/internal/util/isDate.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_innerSubscribe PURE_IMPORTS_END */




function timeoutWith(due, withObservable, scheduler) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    return function (source) {
        var absoluteTimeout = (0,_util_isDate__WEBPACK_IMPORTED_MODULE_1__.isDate)(due);
        var waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(due);
        return source.lift(new TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler));
    };
}
var TimeoutWithOperator = /*@__PURE__*/ (function () {
    function TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler) {
        this.waitFor = waitFor;
        this.absoluteTimeout = absoluteTimeout;
        this.withObservable = withObservable;
        this.scheduler = scheduler;
    }
    TimeoutWithOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TimeoutWithSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler));
    };
    return TimeoutWithOperator;
}());
var TimeoutWithSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_2__.__extends(TimeoutWithSubscriber, _super);
    function TimeoutWithSubscriber(destination, absoluteTimeout, waitFor, withObservable, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.absoluteTimeout = absoluteTimeout;
        _this.waitFor = waitFor;
        _this.withObservable = withObservable;
        _this.scheduler = scheduler;
        _this.scheduleTimeout();
        return _this;
    }
    TimeoutWithSubscriber.dispatchTimeout = function (subscriber) {
        var withObservable = subscriber.withObservable;
        subscriber._unsubscribeAndRecycle();
        subscriber.add((0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.innerSubscribe)(withObservable, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleInnerSubscriber(subscriber)));
    };
    TimeoutWithSubscriber.prototype.scheduleTimeout = function () {
        var action = this.action;
        if (action) {
            this.action = action.schedule(this, this.waitFor);
        }
        else {
            this.add(this.action = this.scheduler.schedule(TimeoutWithSubscriber.dispatchTimeout, this.waitFor, this));
        }
    };
    TimeoutWithSubscriber.prototype._next = function (value) {
        if (!this.absoluteTimeout) {
            this.scheduleTimeout();
        }
        _super.prototype._next.call(this, value);
    };
    TimeoutWithSubscriber.prototype._unsubscribe = function () {
        this.action = undefined;
        this.scheduler = null;
        this.withObservable = null;
    };
    return TimeoutWithSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_3__.SimpleOuterSubscriber));
//# sourceMappingURL=timeoutWith.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/timestamp.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/timestamp.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Timestamp: () => (/* binding */ Timestamp),
/* harmony export */   timestamp: () => (/* binding */ timestamp)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/** PURE_IMPORTS_START _scheduler_async,_map PURE_IMPORTS_END */


function timestamp(scheduler) {
    if (scheduler === void 0) {
        scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    }
    return (0,_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (value) { return new Timestamp(value, scheduler.now()); });
}
var Timestamp = /*@__PURE__*/ (function () {
    function Timestamp(value, timestamp) {
        this.value = value;
        this.timestamp = timestamp;
    }
    return Timestamp;
}());

//# sourceMappingURL=timestamp.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/toArray.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/toArray.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toArray: () => (/* binding */ toArray)
/* harmony export */ });
/* harmony import */ var _reduce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reduce */ "../../node_modules/rxjs/_esm5/internal/operators/reduce.js");
/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */

function toArrayReducer(arr, item, index) {
    if (index === 0) {
        return [item];
    }
    arr.push(item);
    return arr;
}
function toArray() {
    return (0,_reduce__WEBPACK_IMPORTED_MODULE_0__.reduce)(toArrayReducer, []);
}
//# sourceMappingURL=toArray.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/window.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/window.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   window: () => (/* binding */ window)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _innerSubscribe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../innerSubscribe */ "../../node_modules/rxjs/_esm5/internal/innerSubscribe.js");
/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */



function window(windowBoundaries) {
    return function windowOperatorFunction(source) {
        return source.lift(new WindowOperator(windowBoundaries));
    };
}
var WindowOperator = /*@__PURE__*/ (function () {
    function WindowOperator(windowBoundaries) {
        this.windowBoundaries = windowBoundaries;
    }
    WindowOperator.prototype.call = function (subscriber, source) {
        var windowSubscriber = new WindowSubscriber(subscriber);
        var sourceSubscription = source.subscribe(windowSubscriber);
        if (!sourceSubscription.closed) {
            windowSubscriber.add((0,_innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.innerSubscribe)(this.windowBoundaries, new _innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.SimpleInnerSubscriber(windowSubscriber)));
        }
        return sourceSubscription;
    };
    return WindowOperator;
}());
var WindowSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_1__.__extends(WindowSubscriber, _super);
    function WindowSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.window = new _Subject__WEBPACK_IMPORTED_MODULE_2__.Subject();
        destination.next(_this.window);
        return _this;
    }
    WindowSubscriber.prototype.notifyNext = function () {
        this.openWindow();
    };
    WindowSubscriber.prototype.notifyError = function (error) {
        this._error(error);
    };
    WindowSubscriber.prototype.notifyComplete = function () {
        this._complete();
    };
    WindowSubscriber.prototype._next = function (value) {
        this.window.next(value);
    };
    WindowSubscriber.prototype._error = function (err) {
        this.window.error(err);
        this.destination.error(err);
    };
    WindowSubscriber.prototype._complete = function () {
        this.window.complete();
        this.destination.complete();
    };
    WindowSubscriber.prototype._unsubscribe = function () {
        this.window = null;
    };
    WindowSubscriber.prototype.openWindow = function () {
        var prevWindow = this.window;
        if (prevWindow) {
            prevWindow.complete();
        }
        var destination = this.destination;
        var newWindow = this.window = new _Subject__WEBPACK_IMPORTED_MODULE_2__.Subject();
        destination.next(newWindow);
    };
    return WindowSubscriber;
}(_innerSubscribe__WEBPACK_IMPORTED_MODULE_0__.SimpleOuterSubscriber));
//# sourceMappingURL=window.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/windowCount.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/windowCount.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   windowCount: () => (/* binding */ windowCount)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/** PURE_IMPORTS_START tslib,_Subscriber,_Subject PURE_IMPORTS_END */



function windowCount(windowSize, startWindowEvery) {
    if (startWindowEvery === void 0) {
        startWindowEvery = 0;
    }
    return function windowCountOperatorFunction(source) {
        return source.lift(new WindowCountOperator(windowSize, startWindowEvery));
    };
}
var WindowCountOperator = /*@__PURE__*/ (function () {
    function WindowCountOperator(windowSize, startWindowEvery) {
        this.windowSize = windowSize;
        this.startWindowEvery = startWindowEvery;
    }
    WindowCountOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new WindowCountSubscriber(subscriber, this.windowSize, this.startWindowEvery));
    };
    return WindowCountOperator;
}());
var WindowCountSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(WindowCountSubscriber, _super);
    function WindowCountSubscriber(destination, windowSize, startWindowEvery) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.windowSize = windowSize;
        _this.startWindowEvery = startWindowEvery;
        _this.windows = [new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject()];
        _this.count = 0;
        destination.next(_this.windows[0]);
        return _this;
    }
    WindowCountSubscriber.prototype._next = function (value) {
        var startWindowEvery = (this.startWindowEvery > 0) ? this.startWindowEvery : this.windowSize;
        var destination = this.destination;
        var windowSize = this.windowSize;
        var windows = this.windows;
        var len = windows.length;
        for (var i = 0; i < len && !this.closed; i++) {
            windows[i].next(value);
        }
        var c = this.count - windowSize + 1;
        if (c >= 0 && c % startWindowEvery === 0 && !this.closed) {
            windows.shift().complete();
        }
        if (++this.count % startWindowEvery === 0 && !this.closed) {
            var window_1 = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject();
            windows.push(window_1);
            destination.next(window_1);
        }
    };
    WindowCountSubscriber.prototype._error = function (err) {
        var windows = this.windows;
        if (windows) {
            while (windows.length > 0 && !this.closed) {
                windows.shift().error(err);
            }
        }
        this.destination.error(err);
    };
    WindowCountSubscriber.prototype._complete = function () {
        var windows = this.windows;
        if (windows) {
            while (windows.length > 0 && !this.closed) {
                windows.shift().complete();
            }
        }
        this.destination.complete();
    };
    WindowCountSubscriber.prototype._unsubscribe = function () {
        this.count = 0;
        this.windows = null;
    };
    return WindowCountSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_2__.Subscriber));
//# sourceMappingURL=windowCount.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/windowTime.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/windowTime.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   windowTime: () => (/* binding */ windowTime)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _util_isNumeric__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isNumeric */ "../../node_modules/rxjs/_esm5/internal/util/isNumeric.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isScheduler */ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js");
/** PURE_IMPORTS_START tslib,_Subject,_scheduler_async,_Subscriber,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */






function windowTime(windowTimeSpan) {
    var scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    var windowCreationInterval = null;
    var maxWindowSize = Number.POSITIVE_INFINITY;
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(arguments[3])) {
        scheduler = arguments[3];
    }
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(arguments[2])) {
        scheduler = arguments[2];
    }
    else if ((0,_util_isNumeric__WEBPACK_IMPORTED_MODULE_2__.isNumeric)(arguments[2])) {
        maxWindowSize = Number(arguments[2]);
    }
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(arguments[1])) {
        scheduler = arguments[1];
    }
    else if ((0,_util_isNumeric__WEBPACK_IMPORTED_MODULE_2__.isNumeric)(arguments[1])) {
        windowCreationInterval = Number(arguments[1]);
    }
    return function windowTimeOperatorFunction(source) {
        return source.lift(new WindowTimeOperator(windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler));
    };
}
var WindowTimeOperator = /*@__PURE__*/ (function () {
    function WindowTimeOperator(windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler) {
        this.windowTimeSpan = windowTimeSpan;
        this.windowCreationInterval = windowCreationInterval;
        this.maxWindowSize = maxWindowSize;
        this.scheduler = scheduler;
    }
    WindowTimeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new WindowTimeSubscriber(subscriber, this.windowTimeSpan, this.windowCreationInterval, this.maxWindowSize, this.scheduler));
    };
    return WindowTimeOperator;
}());
var CountedSubject = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_3__.__extends(CountedSubject, _super);
    function CountedSubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._numberOfNextedValues = 0;
        return _this;
    }
    CountedSubject.prototype.next = function (value) {
        this._numberOfNextedValues++;
        _super.prototype.next.call(this, value);
    };
    Object.defineProperty(CountedSubject.prototype, "numberOfNextedValues", {
        get: function () {
            return this._numberOfNextedValues;
        },
        enumerable: true,
        configurable: true
    });
    return CountedSubject;
}(_Subject__WEBPACK_IMPORTED_MODULE_4__.Subject));
var WindowTimeSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_3__.__extends(WindowTimeSubscriber, _super);
    function WindowTimeSubscriber(destination, windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.windowTimeSpan = windowTimeSpan;
        _this.windowCreationInterval = windowCreationInterval;
        _this.maxWindowSize = maxWindowSize;
        _this.scheduler = scheduler;
        _this.windows = [];
        var window = _this.openWindow();
        if (windowCreationInterval !== null && windowCreationInterval >= 0) {
            var closeState = { subscriber: _this, window: window, context: null };
            var creationState = { windowTimeSpan: windowTimeSpan, windowCreationInterval: windowCreationInterval, subscriber: _this, scheduler: scheduler };
            _this.add(scheduler.schedule(dispatchWindowClose, windowTimeSpan, closeState));
            _this.add(scheduler.schedule(dispatchWindowCreation, windowCreationInterval, creationState));
        }
        else {
            var timeSpanOnlyState = { subscriber: _this, window: window, windowTimeSpan: windowTimeSpan };
            _this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, timeSpanOnlyState));
        }
        return _this;
    }
    WindowTimeSubscriber.prototype._next = function (value) {
        var windows = this.windows;
        var len = windows.length;
        for (var i = 0; i < len; i++) {
            var window_1 = windows[i];
            if (!window_1.closed) {
                window_1.next(value);
                if (window_1.numberOfNextedValues >= this.maxWindowSize) {
                    this.closeWindow(window_1);
                }
            }
        }
    };
    WindowTimeSubscriber.prototype._error = function (err) {
        var windows = this.windows;
        while (windows.length > 0) {
            windows.shift().error(err);
        }
        this.destination.error(err);
    };
    WindowTimeSubscriber.prototype._complete = function () {
        var windows = this.windows;
        while (windows.length > 0) {
            var window_2 = windows.shift();
            if (!window_2.closed) {
                window_2.complete();
            }
        }
        this.destination.complete();
    };
    WindowTimeSubscriber.prototype.openWindow = function () {
        var window = new CountedSubject();
        this.windows.push(window);
        var destination = this.destination;
        destination.next(window);
        return window;
    };
    WindowTimeSubscriber.prototype.closeWindow = function (window) {
        window.complete();
        var windows = this.windows;
        windows.splice(windows.indexOf(window), 1);
    };
    return WindowTimeSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_5__.Subscriber));
function dispatchWindowTimeSpanOnly(state) {
    var subscriber = state.subscriber, windowTimeSpan = state.windowTimeSpan, window = state.window;
    if (window) {
        subscriber.closeWindow(window);
    }
    state.window = subscriber.openWindow();
    this.schedule(state, windowTimeSpan);
}
function dispatchWindowCreation(state) {
    var windowTimeSpan = state.windowTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler, windowCreationInterval = state.windowCreationInterval;
    var window = subscriber.openWindow();
    var action = this;
    var context = { action: action, subscription: null };
    var timeSpanState = { subscriber: subscriber, window: window, context: context };
    context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, timeSpanState);
    action.add(context.subscription);
    action.schedule(state, windowCreationInterval);
}
function dispatchWindowClose(state) {
    var subscriber = state.subscriber, window = state.window, context = state.context;
    if (context && context.action && context.subscription) {
        context.action.remove(context.subscription);
    }
    subscriber.closeWindow(window);
}
//# sourceMappingURL=windowTime.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/windowToggle.js":
/*!************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/windowToggle.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   windowToggle: () => (/* binding */ windowToggle)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _OuterSubscriber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../OuterSubscriber */ "../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js");
/* harmony import */ var _util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/subscribeToResult */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js");
/** PURE_IMPORTS_START tslib,_Subject,_Subscription,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */





function windowToggle(openings, closingSelector) {
    return function (source) { return source.lift(new WindowToggleOperator(openings, closingSelector)); };
}
var WindowToggleOperator = /*@__PURE__*/ (function () {
    function WindowToggleOperator(openings, closingSelector) {
        this.openings = openings;
        this.closingSelector = closingSelector;
    }
    WindowToggleOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new WindowToggleSubscriber(subscriber, this.openings, this.closingSelector));
    };
    return WindowToggleOperator;
}());
var WindowToggleSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(WindowToggleSubscriber, _super);
    function WindowToggleSubscriber(destination, openings, closingSelector) {
        var _this = _super.call(this, destination) || this;
        _this.openings = openings;
        _this.closingSelector = closingSelector;
        _this.contexts = [];
        _this.add(_this.openSubscription = (0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__.subscribeToResult)(_this, openings, openings));
        return _this;
    }
    WindowToggleSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        if (contexts) {
            var len = contexts.length;
            for (var i = 0; i < len; i++) {
                contexts[i].window.next(value);
            }
        }
    };
    WindowToggleSubscriber.prototype._error = function (err) {
        var contexts = this.contexts;
        this.contexts = null;
        if (contexts) {
            var len = contexts.length;
            var index = -1;
            while (++index < len) {
                var context_1 = contexts[index];
                context_1.window.error(err);
                context_1.subscription.unsubscribe();
            }
        }
        _super.prototype._error.call(this, err);
    };
    WindowToggleSubscriber.prototype._complete = function () {
        var contexts = this.contexts;
        this.contexts = null;
        if (contexts) {
            var len = contexts.length;
            var index = -1;
            while (++index < len) {
                var context_2 = contexts[index];
                context_2.window.complete();
                context_2.subscription.unsubscribe();
            }
        }
        _super.prototype._complete.call(this);
    };
    WindowToggleSubscriber.prototype._unsubscribe = function () {
        var contexts = this.contexts;
        this.contexts = null;
        if (contexts) {
            var len = contexts.length;
            var index = -1;
            while (++index < len) {
                var context_3 = contexts[index];
                context_3.window.unsubscribe();
                context_3.subscription.unsubscribe();
            }
        }
    };
    WindowToggleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        if (outerValue === this.openings) {
            var closingNotifier = void 0;
            try {
                var closingSelector = this.closingSelector;
                closingNotifier = closingSelector(innerValue);
            }
            catch (e) {
                return this.error(e);
            }
            var window_1 = new _Subject__WEBPACK_IMPORTED_MODULE_2__.Subject();
            var subscription = new _Subscription__WEBPACK_IMPORTED_MODULE_3__.Subscription();
            var context_4 = { window: window_1, subscription: subscription };
            this.contexts.push(context_4);
            var innerSubscription = (0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__.subscribeToResult)(this, closingNotifier, context_4);
            if (innerSubscription.closed) {
                this.closeWindow(this.contexts.length - 1);
            }
            else {
                innerSubscription.context = context_4;
                subscription.add(innerSubscription);
            }
            this.destination.next(window_1);
        }
        else {
            this.closeWindow(this.contexts.indexOf(outerValue));
        }
    };
    WindowToggleSubscriber.prototype.notifyError = function (err) {
        this.error(err);
    };
    WindowToggleSubscriber.prototype.notifyComplete = function (inner) {
        if (inner !== this.openSubscription) {
            this.closeWindow(this.contexts.indexOf(inner.context));
        }
    };
    WindowToggleSubscriber.prototype.closeWindow = function (index) {
        if (index === -1) {
            return;
        }
        var contexts = this.contexts;
        var context = contexts[index];
        var window = context.window, subscription = context.subscription;
        contexts.splice(index, 1);
        window.complete();
        subscription.unsubscribe();
    };
    return WindowToggleSubscriber;
}(_OuterSubscriber__WEBPACK_IMPORTED_MODULE_4__.OuterSubscriber));
//# sourceMappingURL=windowToggle.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/windowWhen.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/windowWhen.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   windowWhen: () => (/* binding */ windowWhen)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "../../node_modules/rxjs/_esm5/internal/Subject.js");
/* harmony import */ var _OuterSubscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../OuterSubscriber */ "../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js");
/* harmony import */ var _util_subscribeToResult__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/subscribeToResult */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js");
/** PURE_IMPORTS_START tslib,_Subject,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */




function windowWhen(closingSelector) {
    return function windowWhenOperatorFunction(source) {
        return source.lift(new WindowOperator(closingSelector));
    };
}
var WindowOperator = /*@__PURE__*/ (function () {
    function WindowOperator(closingSelector) {
        this.closingSelector = closingSelector;
    }
    WindowOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new WindowSubscriber(subscriber, this.closingSelector));
    };
    return WindowOperator;
}());
var WindowSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(WindowSubscriber, _super);
    function WindowSubscriber(destination, closingSelector) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.closingSelector = closingSelector;
        _this.openWindow();
        return _this;
    }
    WindowSubscriber.prototype.notifyNext = function (_outerValue, _innerValue, _outerIndex, _innerIndex, innerSub) {
        this.openWindow(innerSub);
    };
    WindowSubscriber.prototype.notifyError = function (error) {
        this._error(error);
    };
    WindowSubscriber.prototype.notifyComplete = function (innerSub) {
        this.openWindow(innerSub);
    };
    WindowSubscriber.prototype._next = function (value) {
        this.window.next(value);
    };
    WindowSubscriber.prototype._error = function (err) {
        this.window.error(err);
        this.destination.error(err);
        this.unsubscribeClosingNotification();
    };
    WindowSubscriber.prototype._complete = function () {
        this.window.complete();
        this.destination.complete();
        this.unsubscribeClosingNotification();
    };
    WindowSubscriber.prototype.unsubscribeClosingNotification = function () {
        if (this.closingNotification) {
            this.closingNotification.unsubscribe();
        }
    };
    WindowSubscriber.prototype.openWindow = function (innerSub) {
        if (innerSub === void 0) {
            innerSub = null;
        }
        if (innerSub) {
            this.remove(innerSub);
            innerSub.unsubscribe();
        }
        var prevWindow = this.window;
        if (prevWindow) {
            prevWindow.complete();
        }
        var window = this.window = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject();
        this.destination.next(window);
        var closingNotifier;
        try {
            var closingSelector = this.closingSelector;
            closingNotifier = closingSelector();
        }
        catch (e) {
            this.destination.error(e);
            this.window.error(e);
            return;
        }
        this.add(this.closingNotification = (0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_2__.subscribeToResult)(this, closingNotifier));
    };
    return WindowSubscriber;
}(_OuterSubscriber__WEBPACK_IMPORTED_MODULE_3__.OuterSubscriber));
//# sourceMappingURL=windowWhen.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/withLatestFrom.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/withLatestFrom.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   withLatestFrom: () => (/* binding */ withLatestFrom)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _OuterSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../OuterSubscriber */ "../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js");
/* harmony import */ var _util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/subscribeToResult */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js");
/** PURE_IMPORTS_START tslib,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */



function withLatestFrom() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (source) {
        var project;
        if (typeof args[args.length - 1] === 'function') {
            project = args.pop();
        }
        var observables = args;
        return source.lift(new WithLatestFromOperator(observables, project));
    };
}
var WithLatestFromOperator = /*@__PURE__*/ (function () {
    function WithLatestFromOperator(observables, project) {
        this.observables = observables;
        this.project = project;
    }
    WithLatestFromOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new WithLatestFromSubscriber(subscriber, this.observables, this.project));
    };
    return WithLatestFromOperator;
}());
var WithLatestFromSubscriber = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(WithLatestFromSubscriber, _super);
    function WithLatestFromSubscriber(destination, observables, project) {
        var _this = _super.call(this, destination) || this;
        _this.observables = observables;
        _this.project = project;
        _this.toRespond = [];
        var len = observables.length;
        _this.values = new Array(len);
        for (var i = 0; i < len; i++) {
            _this.toRespond.push(i);
        }
        for (var i = 0; i < len; i++) {
            var observable = observables[i];
            _this.add((0,_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_1__.subscribeToResult)(_this, observable, undefined, i));
        }
        return _this;
    }
    WithLatestFromSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        this.values[outerIndex] = innerValue;
        var toRespond = this.toRespond;
        if (toRespond.length > 0) {
            var found = toRespond.indexOf(outerIndex);
            if (found !== -1) {
                toRespond.splice(found, 1);
            }
        }
    };
    WithLatestFromSubscriber.prototype.notifyComplete = function () {
    };
    WithLatestFromSubscriber.prototype._next = function (value) {
        if (this.toRespond.length === 0) {
            var args = [value].concat(this.values);
            if (this.project) {
                this._tryProject(args);
            }
            else {
                this.destination.next(args);
            }
        }
    };
    WithLatestFromSubscriber.prototype._tryProject = function (args) {
        var result;
        try {
            result = this.project.apply(this, args);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return WithLatestFromSubscriber;
}(_OuterSubscriber__WEBPACK_IMPORTED_MODULE_2__.OuterSubscriber));
//# sourceMappingURL=withLatestFrom.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/zip.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/zip.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   zip: () => (/* binding */ zip)
/* harmony export */ });
/* harmony import */ var _observable_zip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/zip */ "../../node_modules/rxjs/_esm5/internal/observable/zip.js");
/** PURE_IMPORTS_START _observable_zip PURE_IMPORTS_END */

function zip() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    return function zipOperatorFunction(source) {
        return source.lift.call(_observable_zip__WEBPACK_IMPORTED_MODULE_0__.zip.apply(void 0, [source].concat(observables)));
    };
}
//# sourceMappingURL=zip.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/operators/zipAll.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/operators/zipAll.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   zipAll: () => (/* binding */ zipAll)
/* harmony export */ });
/* harmony import */ var _observable_zip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/zip */ "../../node_modules/rxjs/_esm5/internal/observable/zip.js");
/** PURE_IMPORTS_START _observable_zip PURE_IMPORTS_END */

function zipAll(project) {
    return function (source) { return source.lift(new _observable_zip__WEBPACK_IMPORTED_MODULE_0__.ZipOperator(project)); };
}
//# sourceMappingURL=zipAll.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduleArray.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduled/scheduleArray.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   scheduleArray: () => (/* binding */ scheduleArray)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */


function scheduleArray(input, scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var sub = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
        var i = 0;
        sub.add(scheduler.schedule(function () {
            if (i === input.length) {
                subscriber.complete();
                return;
            }
            subscriber.next(input[i++]);
            if (!subscriber.closed) {
                sub.add(this.schedule());
            }
        }));
        return sub;
    });
}
//# sourceMappingURL=scheduleArray.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduleIterable.js":
/*!****************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduled/scheduleIterable.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   scheduleIterable: () => (/* binding */ scheduleIterable)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _symbol_iterator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../symbol/iterator */ "../../node_modules/rxjs/_esm5/internal/symbol/iterator.js");
/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator PURE_IMPORTS_END */



function scheduleIterable(input, scheduler) {
    if (!input) {
        throw new Error('Iterable cannot be null');
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var sub = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
        var iterator;
        sub.add(function () {
            if (iterator && typeof iterator.return === 'function') {
                iterator.return();
            }
        });
        sub.add(scheduler.schedule(function () {
            iterator = input[_symbol_iterator__WEBPACK_IMPORTED_MODULE_2__.iterator]();
            sub.add(scheduler.schedule(function () {
                if (subscriber.closed) {
                    return;
                }
                var value;
                var done;
                try {
                    var result = iterator.next();
                    value = result.value;
                    done = result.done;
                }
                catch (err) {
                    subscriber.error(err);
                    return;
                }
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                    this.schedule();
                }
            }));
        }));
        return sub;
    });
}
//# sourceMappingURL=scheduleIterable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduleObservable.js":
/*!******************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduled/scheduleObservable.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   scheduleObservable: () => (/* binding */ scheduleObservable)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../symbol/observable */ "../../node_modules/rxjs/_esm5/internal/symbol/observable.js");
/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable PURE_IMPORTS_END */



function scheduleObservable(input, scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var sub = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
        sub.add(scheduler.schedule(function () {
            var observable = input[_symbol_observable__WEBPACK_IMPORTED_MODULE_2__.observable]();
            sub.add(observable.subscribe({
                next: function (value) { sub.add(scheduler.schedule(function () { return subscriber.next(value); })); },
                error: function (err) { sub.add(scheduler.schedule(function () { return subscriber.error(err); })); },
                complete: function () { sub.add(scheduler.schedule(function () { return subscriber.complete(); })); },
            }));
        }));
        return sub;
    });
}
//# sourceMappingURL=scheduleObservable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduled/schedulePromise.js":
/*!***************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduled/schedulePromise.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   schedulePromise: () => (/* binding */ schedulePromise)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */


function schedulePromise(input, scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var sub = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
        sub.add(scheduler.schedule(function () {
            return input.then(function (value) {
                sub.add(scheduler.schedule(function () {
                    subscriber.next(value);
                    sub.add(scheduler.schedule(function () { return subscriber.complete(); }));
                }));
            }, function (err) {
                sub.add(scheduler.schedule(function () { return subscriber.error(err); }));
            });
        }));
        return sub;
    });
}
//# sourceMappingURL=schedulePromise.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduled.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduled/scheduled.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   scheduled: () => (/* binding */ scheduled)
/* harmony export */ });
/* harmony import */ var _scheduleObservable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scheduleObservable */ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduleObservable.js");
/* harmony import */ var _schedulePromise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./schedulePromise */ "../../node_modules/rxjs/_esm5/internal/scheduled/schedulePromise.js");
/* harmony import */ var _scheduleArray__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./scheduleArray */ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduleArray.js");
/* harmony import */ var _scheduleIterable__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./scheduleIterable */ "../../node_modules/rxjs/_esm5/internal/scheduled/scheduleIterable.js");
/* harmony import */ var _util_isInteropObservable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isInteropObservable */ "../../node_modules/rxjs/_esm5/internal/util/isInteropObservable.js");
/* harmony import */ var _util_isPromise__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isPromise */ "../../node_modules/rxjs/_esm5/internal/util/isPromise.js");
/* harmony import */ var _util_isArrayLike__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/isArrayLike */ "../../node_modules/rxjs/_esm5/internal/util/isArrayLike.js");
/* harmony import */ var _util_isIterable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/isIterable */ "../../node_modules/rxjs/_esm5/internal/util/isIterable.js");
/** PURE_IMPORTS_START _scheduleObservable,_schedulePromise,_scheduleArray,_scheduleIterable,_util_isInteropObservable,_util_isPromise,_util_isArrayLike,_util_isIterable PURE_IMPORTS_END */








function scheduled(input, scheduler) {
    if (input != null) {
        if ((0,_util_isInteropObservable__WEBPACK_IMPORTED_MODULE_0__.isInteropObservable)(input)) {
            return (0,_scheduleObservable__WEBPACK_IMPORTED_MODULE_1__.scheduleObservable)(input, scheduler);
        }
        else if ((0,_util_isPromise__WEBPACK_IMPORTED_MODULE_2__.isPromise)(input)) {
            return (0,_schedulePromise__WEBPACK_IMPORTED_MODULE_3__.schedulePromise)(input, scheduler);
        }
        else if ((0,_util_isArrayLike__WEBPACK_IMPORTED_MODULE_4__.isArrayLike)(input)) {
            return (0,_scheduleArray__WEBPACK_IMPORTED_MODULE_5__.scheduleArray)(input, scheduler);
        }
        else if ((0,_util_isIterable__WEBPACK_IMPORTED_MODULE_6__.isIterable)(input) || typeof input === 'string') {
            return (0,_scheduleIterable__WEBPACK_IMPORTED_MODULE_7__.scheduleIterable)(input, scheduler);
        }
    }
    throw new TypeError((input !== null && typeof input || input) + ' is not observable');
}
//# sourceMappingURL=scheduled.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/Action.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/Action.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Action: () => (/* binding */ Action)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "../../node_modules/rxjs/_esm5/internal/Subscription.js");
/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */


var Action = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return this;
    };
    return Action;
}(_Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription));

//# sourceMappingURL=Action.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/AnimationFrameAction.js":
/*!********************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/AnimationFrameAction.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnimationFrameAction: () => (/* binding */ AnimationFrameAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncAction */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js");
/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */


var AnimationFrameAction = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AnimationFrameAction, _super);
    function AnimationFrameAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler.scheduled || (scheduler.scheduled = requestAnimationFrame(function () { return scheduler.flush(null); }));
    };
    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        if (scheduler.actions.length === 0) {
            cancelAnimationFrame(id);
            scheduler.scheduled = undefined;
        }
        return undefined;
    };
    return AnimationFrameAction;
}(_AsyncAction__WEBPACK_IMPORTED_MODULE_1__.AsyncAction));

//# sourceMappingURL=AnimationFrameAction.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/AnimationFrameScheduler.js":
/*!***********************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/AnimationFrameScheduler.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnimationFrameScheduler: () => (/* binding */ AnimationFrameScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js");
/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */


var AnimationFrameScheduler = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AnimationFrameScheduler, _super);
    function AnimationFrameScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimationFrameScheduler.prototype.flush = function (action) {
        this.active = true;
        this.scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        var count = actions.length;
        action = action || actions.shift();
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this.active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AnimationFrameScheduler;
}(_AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__.AsyncScheduler));

//# sourceMappingURL=AnimationFrameScheduler.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/AsapAction.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/AsapAction.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsapAction: () => (/* binding */ AsapAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_Immediate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/Immediate */ "../../node_modules/rxjs/_esm5/internal/util/Immediate.js");
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AsyncAction */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js");
/** PURE_IMPORTS_START tslib,_util_Immediate,_AsyncAction PURE_IMPORTS_END */



var AsapAction = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AsapAction, _super);
    function AsapAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler.scheduled || (scheduler.scheduled = _util_Immediate__WEBPACK_IMPORTED_MODULE_1__.Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
    };
    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        if (scheduler.actions.length === 0) {
            _util_Immediate__WEBPACK_IMPORTED_MODULE_1__.Immediate.clearImmediate(id);
            scheduler.scheduled = undefined;
        }
        return undefined;
    };
    return AsapAction;
}(_AsyncAction__WEBPACK_IMPORTED_MODULE_2__.AsyncAction));

//# sourceMappingURL=AsapAction.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/AsapScheduler.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/AsapScheduler.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsapScheduler: () => (/* binding */ AsapScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js");
/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */


var AsapScheduler = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AsapScheduler, _super);
    function AsapScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsapScheduler.prototype.flush = function (action) {
        this.active = true;
        this.scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        var count = actions.length;
        action = action || actions.shift();
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this.active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsapScheduler;
}(_AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__.AsyncScheduler));

//# sourceMappingURL=AsapScheduler.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsyncAction: () => (/* binding */ AsyncAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Action__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Action */ "../../node_modules/rxjs/_esm5/internal/scheduler/Action.js");
/** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */


var AsyncAction = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && this.delay === delay && this.pending === false) {
            return id;
        }
        clearInterval(id);
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, delay) {
        var errored = false;
        var errorValue = undefined;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = !!e && e || new Error(e);
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype._unsubscribe = function () {
        var id = this.id;
        var scheduler = this.scheduler;
        var actions = scheduler.actions;
        var index = actions.indexOf(this);
        this.work = null;
        this.state = null;
        this.pending = false;
        this.scheduler = null;
        if (index !== -1) {
            actions.splice(index, 1);
        }
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, null);
        }
        this.delay = null;
    };
    return AsyncAction;
}(_Action__WEBPACK_IMPORTED_MODULE_1__.Action));

//# sourceMappingURL=AsyncAction.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsyncScheduler: () => (/* binding */ AsyncScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Scheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Scheduler */ "../../node_modules/rxjs/_esm5/internal/Scheduler.js");
/** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */


var AsyncScheduler = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) {
            now = _Scheduler__WEBPACK_IMPORTED_MODULE_1__.Scheduler.now;
        }
        var _this = _super.call(this, SchedulerAction, function () {
            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
                return AsyncScheduler.delegate.now();
            }
            else {
                return now();
            }
        }) || this;
        _this.actions = [];
        _this.active = false;
        _this.scheduled = undefined;
        return _this;
    }
    AsyncScheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) {
            delay = 0;
        }
        if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
            return AsyncScheduler.delegate.schedule(work, delay, state);
        }
        else {
            return _super.prototype.schedule.call(this, work, delay, state);
        }
    };
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this.active) {
            actions.push(action);
            return;
        }
        var error;
        this.active = true;
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (action = actions.shift());
        this.active = false;
        if (error) {
            while (action = actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(_Scheduler__WEBPACK_IMPORTED_MODULE_1__.Scheduler));

//# sourceMappingURL=AsyncScheduler.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/QueueAction.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/QueueAction.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   QueueAction: () => (/* binding */ QueueAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncAction */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js");
/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */


var QueueAction = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(QueueAction, _super);
    function QueueAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    QueueAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay > 0) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        this.scheduler.flush(this);
        return this;
    };
    QueueAction.prototype.execute = function (state, delay) {
        return (delay > 0 || this.closed) ?
            _super.prototype.execute.call(this, state, delay) :
            this._execute(state, delay);
    };
    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        return scheduler.flush(this);
    };
    return QueueAction;
}(_AsyncAction__WEBPACK_IMPORTED_MODULE_1__.AsyncAction));

//# sourceMappingURL=QueueAction.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/QueueScheduler.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/QueueScheduler.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   QueueScheduler: () => (/* binding */ QueueScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js");
/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */


var QueueScheduler = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(QueueScheduler, _super);
    function QueueScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QueueScheduler;
}(_AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__.AsyncScheduler));

//# sourceMappingURL=QueueScheduler.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/VirtualTimeScheduler.js":
/*!********************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/VirtualTimeScheduler.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VirtualAction: () => (/* binding */ VirtualAction),
/* harmony export */   VirtualTimeScheduler: () => (/* binding */ VirtualTimeScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AsyncAction */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js");
/** PURE_IMPORTS_START tslib,_AsyncAction,_AsyncScheduler PURE_IMPORTS_END */



var VirtualTimeScheduler = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(VirtualTimeScheduler, _super);
    function VirtualTimeScheduler(SchedulerAction, maxFrames) {
        if (SchedulerAction === void 0) {
            SchedulerAction = VirtualAction;
        }
        if (maxFrames === void 0) {
            maxFrames = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this, SchedulerAction, function () { return _this.frame; }) || this;
        _this.maxFrames = maxFrames;
        _this.frame = 0;
        _this.index = -1;
        return _this;
    }
    VirtualTimeScheduler.prototype.flush = function () {
        var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
        var error, action;
        while ((action = actions[0]) && action.delay <= maxFrames) {
            actions.shift();
            this.frame = action.delay;
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        }
        if (error) {
            while (action = actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    VirtualTimeScheduler.frameTimeFactor = 10;
    return VirtualTimeScheduler;
}(_AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__.AsyncScheduler));

var VirtualAction = /*@__PURE__*/ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__.__extends(VirtualAction, _super);
    function VirtualAction(scheduler, work, index) {
        if (index === void 0) {
            index = scheduler.index += 1;
        }
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.index = index;
        _this.active = true;
        _this.index = scheduler.index = index;
        return _this;
    }
    VirtualAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (!this.id) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.active = false;
        var action = new VirtualAction(this.scheduler, this.work);
        this.add(action);
        return action.schedule(state, delay);
    };
    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        this.delay = scheduler.frame + delay;
        var actions = scheduler.actions;
        actions.push(this);
        actions.sort(VirtualAction.sortActions);
        return true;
    };
    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return undefined;
    };
    VirtualAction.prototype._execute = function (state, delay) {
        if (this.active === true) {
            return _super.prototype._execute.call(this, state, delay);
        }
    };
    VirtualAction.sortActions = function (a, b) {
        if (a.delay === b.delay) {
            if (a.index === b.index) {
                return 0;
            }
            else if (a.index > b.index) {
                return 1;
            }
            else {
                return -1;
            }
        }
        else if (a.delay > b.delay) {
            return 1;
        }
        else {
            return -1;
        }
    };
    return VirtualAction;
}(_AsyncAction__WEBPACK_IMPORTED_MODULE_2__.AsyncAction));

//# sourceMappingURL=VirtualTimeScheduler.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/animationFrame.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/animationFrame.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   animationFrame: () => (/* binding */ animationFrame),
/* harmony export */   animationFrameScheduler: () => (/* binding */ animationFrameScheduler)
/* harmony export */ });
/* harmony import */ var _AnimationFrameAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AnimationFrameAction */ "../../node_modules/rxjs/_esm5/internal/scheduler/AnimationFrameAction.js");
/* harmony import */ var _AnimationFrameScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AnimationFrameScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/AnimationFrameScheduler.js");
/** PURE_IMPORTS_START _AnimationFrameAction,_AnimationFrameScheduler PURE_IMPORTS_END */


var animationFrameScheduler = /*@__PURE__*/ new _AnimationFrameScheduler__WEBPACK_IMPORTED_MODULE_0__.AnimationFrameScheduler(_AnimationFrameAction__WEBPACK_IMPORTED_MODULE_1__.AnimationFrameAction);
var animationFrame = animationFrameScheduler;
//# sourceMappingURL=animationFrame.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/asap.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/asap.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   asap: () => (/* binding */ asap),
/* harmony export */   asapScheduler: () => (/* binding */ asapScheduler)
/* harmony export */ });
/* harmony import */ var _AsapAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsapAction */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsapAction.js");
/* harmony import */ var _AsapScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AsapScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsapScheduler.js");
/** PURE_IMPORTS_START _AsapAction,_AsapScheduler PURE_IMPORTS_END */


var asapScheduler = /*@__PURE__*/ new _AsapScheduler__WEBPACK_IMPORTED_MODULE_0__.AsapScheduler(_AsapAction__WEBPACK_IMPORTED_MODULE_1__.AsapAction);
var asap = asapScheduler;
//# sourceMappingURL=asap.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/async.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/async.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   async: () => (/* binding */ async),
/* harmony export */   asyncScheduler: () => (/* binding */ asyncScheduler)
/* harmony export */ });
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncAction */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AsyncScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js");
/** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */


var asyncScheduler = /*@__PURE__*/ new _AsyncScheduler__WEBPACK_IMPORTED_MODULE_0__.AsyncScheduler(_AsyncAction__WEBPACK_IMPORTED_MODULE_1__.AsyncAction);
var async = asyncScheduler;
//# sourceMappingURL=async.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/scheduler/queue.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/scheduler/queue.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   queue: () => (/* binding */ queue),
/* harmony export */   queueScheduler: () => (/* binding */ queueScheduler)
/* harmony export */ });
/* harmony import */ var _QueueAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./QueueAction */ "../../node_modules/rxjs/_esm5/internal/scheduler/QueueAction.js");
/* harmony import */ var _QueueScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./QueueScheduler */ "../../node_modules/rxjs/_esm5/internal/scheduler/QueueScheduler.js");
/** PURE_IMPORTS_START _QueueAction,_QueueScheduler PURE_IMPORTS_END */


var queueScheduler = /*@__PURE__*/ new _QueueScheduler__WEBPACK_IMPORTED_MODULE_0__.QueueScheduler(_QueueAction__WEBPACK_IMPORTED_MODULE_1__.QueueAction);
var queue = queueScheduler;
//# sourceMappingURL=queue.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/symbol/iterator.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/symbol/iterator.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $$iterator: () => (/* binding */ $$iterator),
/* harmony export */   getSymbolIterator: () => (/* binding */ getSymbolIterator),
/* harmony export */   iterator: () => (/* binding */ iterator)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
var iterator = /*@__PURE__*/ getSymbolIterator();
var $$iterator = iterator;
//# sourceMappingURL=iterator.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/symbol/observable.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/symbol/observable.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   observable: () => (/* binding */ observable)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();
//# sourceMappingURL=observable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/symbol/rxSubscriber.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/symbol/rxSubscriber.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $$rxSubscriber: () => (/* binding */ $$rxSubscriber),
/* harmony export */   rxSubscriber: () => (/* binding */ rxSubscriber)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var rxSubscriber = /*@__PURE__*/ (function () {
    return typeof Symbol === 'function'
        ? /*@__PURE__*/ Symbol('rxSubscriber')
        : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
})();
var $$rxSubscriber = rxSubscriber;
//# sourceMappingURL=rxSubscriber.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js":
/*!******************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ArgumentOutOfRangeError: () => (/* binding */ ArgumentOutOfRangeError)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ArgumentOutOfRangeErrorImpl = /*@__PURE__*/ (function () {
    function ArgumentOutOfRangeErrorImpl() {
        Error.call(this);
        this.message = 'argument out of range';
        this.name = 'ArgumentOutOfRangeError';
        return this;
    }
    ArgumentOutOfRangeErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ArgumentOutOfRangeErrorImpl;
})();
var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;
//# sourceMappingURL=ArgumentOutOfRangeError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/EmptyError.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/EmptyError.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EmptyError: () => (/* binding */ EmptyError)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var EmptyErrorImpl = /*@__PURE__*/ (function () {
    function EmptyErrorImpl() {
        Error.call(this);
        this.message = 'no elements in sequence';
        this.name = 'EmptyError';
        return this;
    }
    EmptyErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return EmptyErrorImpl;
})();
var EmptyError = EmptyErrorImpl;
//# sourceMappingURL=EmptyError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/Immediate.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/Immediate.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Immediate: () => (/* binding */ Immediate),
/* harmony export */   TestTools: () => (/* binding */ TestTools)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var nextHandle = 1;
var RESOLVED = /*@__PURE__*/ (function () { return /*@__PURE__*/ Promise.resolve(); })();
var activeHandles = {};
function findAndClearHandle(handle) {
    if (handle in activeHandles) {
        delete activeHandles[handle];
        return true;
    }
    return false;
}
var Immediate = {
    setImmediate: function (cb) {
        var handle = nextHandle++;
        activeHandles[handle] = true;
        RESOLVED.then(function () { return findAndClearHandle(handle) && cb(); });
        return handle;
    },
    clearImmediate: function (handle) {
        findAndClearHandle(handle);
    },
};
var TestTools = {
    pending: function () {
        return Object.keys(activeHandles).length;
    }
};
//# sourceMappingURL=Immediate.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/ObjectUnsubscribedError.js":
/*!******************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/ObjectUnsubscribedError.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ObjectUnsubscribedError: () => (/* binding */ ObjectUnsubscribedError)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
    function ObjectUnsubscribedErrorImpl() {
        Error.call(this);
        this.message = 'object unsubscribed';
        this.name = 'ObjectUnsubscribedError';
        return this;
    }
    ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ObjectUnsubscribedErrorImpl;
})();
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;
//# sourceMappingURL=ObjectUnsubscribedError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/TimeoutError.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/TimeoutError.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimeoutError: () => (/* binding */ TimeoutError)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var TimeoutErrorImpl = /*@__PURE__*/ (function () {
    function TimeoutErrorImpl() {
        Error.call(this);
        this.message = 'Timeout has occurred';
        this.name = 'TimeoutError';
        return this;
    }
    TimeoutErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return TimeoutErrorImpl;
})();
var TimeoutError = TimeoutErrorImpl;
//# sourceMappingURL=TimeoutError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/UnsubscriptionError.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/UnsubscriptionError.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UnsubscriptionError: () => (/* binding */ UnsubscriptionError)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
    function UnsubscriptionErrorImpl(errors) {
        Error.call(this);
        this.message = errors ?
            errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
        return this;
    }
    UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return UnsubscriptionErrorImpl;
})();
var UnsubscriptionError = UnsubscriptionErrorImpl;
//# sourceMappingURL=UnsubscriptionError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/canReportError.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/canReportError.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canReportError: () => (/* binding */ canReportError)
/* harmony export */ });
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */

function canReportError(observer) {
    while (observer) {
        var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
        if (closed_1 || isStopped) {
            return false;
        }
        else if (destination && destination instanceof _Subscriber__WEBPACK_IMPORTED_MODULE_0__.Subscriber) {
            observer = destination;
        }
        else {
            observer = null;
        }
    }
    return true;
}
//# sourceMappingURL=canReportError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/hostReportError.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/hostReportError.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hostReportError: () => (/* binding */ hostReportError)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function hostReportError(err) {
    setTimeout(function () { throw err; }, 0);
}
//# sourceMappingURL=hostReportError.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/identity.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/identity.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   identity: () => (/* binding */ identity)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function identity(x) {
    return x;
}
//# sourceMappingURL=identity.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isArray.js":
/*!**************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isArray.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isArray: () => (/* binding */ isArray)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArray = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();
//# sourceMappingURL=isArray.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isArrayLike.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isArrayLike.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isArrayLike: () => (/* binding */ isArrayLike)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });
//# sourceMappingURL=isArrayLike.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isDate.js":
/*!*************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isDate.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isDate: () => (/* binding */ isDate)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isDate(value) {
    return value instanceof Date && !isNaN(+value);
}
//# sourceMappingURL=isDate.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isFunction.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isFunction.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isFunction: () => (/* binding */ isFunction)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isFunction(x) {
    return typeof x === 'function';
}
//# sourceMappingURL=isFunction.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isInteropObservable.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isInteropObservable.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isInteropObservable: () => (/* binding */ isInteropObservable)
/* harmony export */ });
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../symbol/observable */ "../../node_modules/rxjs/_esm5/internal/symbol/observable.js");
/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */

function isInteropObservable(input) {
    return input && typeof input[_symbol_observable__WEBPACK_IMPORTED_MODULE_0__.observable] === 'function';
}
//# sourceMappingURL=isInteropObservable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isIterable.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isIterable.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isIterable: () => (/* binding */ isIterable)
/* harmony export */ });
/* harmony import */ var _symbol_iterator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../symbol/iterator */ "../../node_modules/rxjs/_esm5/internal/symbol/iterator.js");
/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */

function isIterable(input) {
    return input && typeof input[_symbol_iterator__WEBPACK_IMPORTED_MODULE_0__.iterator] === 'function';
}
//# sourceMappingURL=isIterable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isNumeric.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isNumeric.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isNumeric: () => (/* binding */ isNumeric)
/* harmony export */ });
/* harmony import */ var _isArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isArray */ "../../node_modules/rxjs/_esm5/internal/util/isArray.js");
/** PURE_IMPORTS_START _isArray PURE_IMPORTS_END */

function isNumeric(val) {
    return !(0,_isArray__WEBPACK_IMPORTED_MODULE_0__.isArray)(val) && (val - parseFloat(val) + 1) >= 0;
}
//# sourceMappingURL=isNumeric.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isObject.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isObject.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isObject: () => (/* binding */ isObject)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isObject(x) {
    return x !== null && typeof x === 'object';
}
//# sourceMappingURL=isObject.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isObservable.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isObservable.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isObservable: () => (/* binding */ isObservable)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

function isObservable(obj) {
    return !!obj && (obj instanceof _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable || (typeof obj.lift === 'function' && typeof obj.subscribe === 'function'));
}
//# sourceMappingURL=isObservable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isPromise.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isPromise.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isPromise: () => (/* binding */ isPromise)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isPromise(value) {
    return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}
//# sourceMappingURL=isPromise.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/isScheduler.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/isScheduler.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isScheduler: () => (/* binding */ isScheduler)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isScheduler(value) {
    return value && typeof value.schedule === 'function';
}
//# sourceMappingURL=isScheduler.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/noop.js":
/*!***********************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/noop.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   noop: () => (/* binding */ noop)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function noop() { }
//# sourceMappingURL=noop.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/not.js":
/*!**********************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/not.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   not: () => (/* binding */ not)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function not(pred, thisArg) {
    function notPred() {
        return !(notPred.pred.apply(notPred.thisArg, arguments));
    }
    notPred.pred = pred;
    notPred.thisArg = thisArg;
    return notPred;
}
//# sourceMappingURL=not.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/pipe.js":
/*!***********************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/pipe.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   pipe: () => (/* binding */ pipe),
/* harmony export */   pipeFromArray: () => (/* binding */ pipeFromArray)
/* harmony export */ });
/* harmony import */ var _identity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./identity */ "../../node_modules/rxjs/_esm5/internal/util/identity.js");
/** PURE_IMPORTS_START _identity PURE_IMPORTS_END */

function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return pipeFromArray(fns);
}
function pipeFromArray(fns) {
    if (fns.length === 0) {
        return _identity__WEBPACK_IMPORTED_MODULE_0__.identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
//# sourceMappingURL=pipe.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/subscribeTo.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/subscribeTo.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   subscribeTo: () => (/* binding */ subscribeTo)
/* harmony export */ });
/* harmony import */ var _subscribeToArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./subscribeToArray */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToArray.js");
/* harmony import */ var _subscribeToPromise__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./subscribeToPromise */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToPromise.js");
/* harmony import */ var _subscribeToIterable__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./subscribeToIterable */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToIterable.js");
/* harmony import */ var _subscribeToObservable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./subscribeToObservable */ "../../node_modules/rxjs/_esm5/internal/util/subscribeToObservable.js");
/* harmony import */ var _isArrayLike__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isArrayLike */ "../../node_modules/rxjs/_esm5/internal/util/isArrayLike.js");
/* harmony import */ var _isPromise__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./isPromise */ "../../node_modules/rxjs/_esm5/internal/util/isPromise.js");
/* harmony import */ var _isObject__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./isObject */ "../../node_modules/rxjs/_esm5/internal/util/isObject.js");
/* harmony import */ var _symbol_iterator__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../symbol/iterator */ "../../node_modules/rxjs/_esm5/internal/symbol/iterator.js");
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../symbol/observable */ "../../node_modules/rxjs/_esm5/internal/symbol/observable.js");
/** PURE_IMPORTS_START _subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */









var subscribeTo = function (result) {
    if (!!result && typeof result[_symbol_observable__WEBPACK_IMPORTED_MODULE_0__.observable] === 'function') {
        return (0,_subscribeToObservable__WEBPACK_IMPORTED_MODULE_1__.subscribeToObservable)(result);
    }
    else if ((0,_isArrayLike__WEBPACK_IMPORTED_MODULE_2__.isArrayLike)(result)) {
        return (0,_subscribeToArray__WEBPACK_IMPORTED_MODULE_3__.subscribeToArray)(result);
    }
    else if ((0,_isPromise__WEBPACK_IMPORTED_MODULE_4__.isPromise)(result)) {
        return (0,_subscribeToPromise__WEBPACK_IMPORTED_MODULE_5__.subscribeToPromise)(result);
    }
    else if (!!result && typeof result[_symbol_iterator__WEBPACK_IMPORTED_MODULE_6__.iterator] === 'function') {
        return (0,_subscribeToIterable__WEBPACK_IMPORTED_MODULE_7__.subscribeToIterable)(result);
    }
    else {
        var value = (0,_isObject__WEBPACK_IMPORTED_MODULE_8__.isObject)(result) ? 'an invalid object' : "'" + result + "'";
        var msg = "You provided " + value + " where a stream was expected."
            + ' You can provide an Observable, Promise, Array, or Iterable.';
        throw new TypeError(msg);
    }
};
//# sourceMappingURL=subscribeTo.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/subscribeToArray.js":
/*!***********************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/subscribeToArray.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   subscribeToArray: () => (/* binding */ subscribeToArray)
/* harmony export */ });
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var subscribeToArray = function (array) {
    return function (subscriber) {
        for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    };
};
//# sourceMappingURL=subscribeToArray.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/subscribeToIterable.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/subscribeToIterable.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   subscribeToIterable: () => (/* binding */ subscribeToIterable)
/* harmony export */ });
/* harmony import */ var _symbol_iterator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../symbol/iterator */ "../../node_modules/rxjs/_esm5/internal/symbol/iterator.js");
/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */

var subscribeToIterable = function (iterable) {
    return function (subscriber) {
        var iterator = iterable[_symbol_iterator__WEBPACK_IMPORTED_MODULE_0__.iterator]();
        do {
            var item = void 0;
            try {
                item = iterator.next();
            }
            catch (err) {
                subscriber.error(err);
                return subscriber;
            }
            if (item.done) {
                subscriber.complete();
                break;
            }
            subscriber.next(item.value);
            if (subscriber.closed) {
                break;
            }
        } while (true);
        if (typeof iterator.return === 'function') {
            subscriber.add(function () {
                if (iterator.return) {
                    iterator.return();
                }
            });
        }
        return subscriber;
    };
};
//# sourceMappingURL=subscribeToIterable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/subscribeToObservable.js":
/*!****************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/subscribeToObservable.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   subscribeToObservable: () => (/* binding */ subscribeToObservable)
/* harmony export */ });
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../symbol/observable */ "../../node_modules/rxjs/_esm5/internal/symbol/observable.js");
/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */

var subscribeToObservable = function (obj) {
    return function (subscriber) {
        var obs = obj[_symbol_observable__WEBPACK_IMPORTED_MODULE_0__.observable]();
        if (typeof obs.subscribe !== 'function') {
            throw new TypeError('Provided object does not correctly implement Symbol.observable');
        }
        else {
            return obs.subscribe(subscriber);
        }
    };
};
//# sourceMappingURL=subscribeToObservable.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/subscribeToPromise.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/subscribeToPromise.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   subscribeToPromise: () => (/* binding */ subscribeToPromise)
/* harmony export */ });
/* harmony import */ var _hostReportError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./hostReportError */ "../../node_modules/rxjs/_esm5/internal/util/hostReportError.js");
/** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */

var subscribeToPromise = function (promise) {
    return function (subscriber) {
        promise.then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, _hostReportError__WEBPACK_IMPORTED_MODULE_0__.hostReportError);
        return subscriber;
    };
};
//# sourceMappingURL=subscribeToPromise.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js":
/*!************************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   subscribeToResult: () => (/* binding */ subscribeToResult)
/* harmony export */ });
/* harmony import */ var _InnerSubscriber__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../InnerSubscriber */ "../../node_modules/rxjs/_esm5/internal/InnerSubscriber.js");
/* harmony import */ var _subscribeTo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./subscribeTo */ "../../node_modules/rxjs/_esm5/internal/util/subscribeTo.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Observable */ "../../node_modules/rxjs/_esm5/internal/Observable.js");
/** PURE_IMPORTS_START _InnerSubscriber,_subscribeTo,_Observable PURE_IMPORTS_END */



function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
    if (innerSubscriber === void 0) {
        innerSubscriber = new _InnerSubscriber__WEBPACK_IMPORTED_MODULE_0__.InnerSubscriber(outerSubscriber, outerValue, outerIndex);
    }
    if (innerSubscriber.closed) {
        return undefined;
    }
    if (result instanceof _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable) {
        return result.subscribe(innerSubscriber);
    }
    return (0,_subscribeTo__WEBPACK_IMPORTED_MODULE_2__.subscribeTo)(result)(innerSubscriber);
}
//# sourceMappingURL=subscribeToResult.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/internal/util/toSubscriber.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/internal/util/toSubscriber.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toSubscriber: () => (/* binding */ toSubscriber)
/* harmony export */ });
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subscriber */ "../../node_modules/rxjs/_esm5/internal/Subscriber.js");
/* harmony import */ var _symbol_rxSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../symbol/rxSubscriber */ "../../node_modules/rxjs/_esm5/internal/symbol/rxSubscriber.js");
/* harmony import */ var _Observer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observer */ "../../node_modules/rxjs/_esm5/internal/Observer.js");
/** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */



function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof _Subscriber__WEBPACK_IMPORTED_MODULE_0__.Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[_symbol_rxSubscriber__WEBPACK_IMPORTED_MODULE_1__.rxSubscriber]) {
            return nextOrObserver[_symbol_rxSubscriber__WEBPACK_IMPORTED_MODULE_1__.rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new _Subscriber__WEBPACK_IMPORTED_MODULE_0__.Subscriber(_Observer__WEBPACK_IMPORTED_MODULE_2__.empty);
    }
    return new _Subscriber__WEBPACK_IMPORTED_MODULE_0__.Subscriber(nextOrObserver, error, complete);
}
//# sourceMappingURL=toSubscriber.js.map


/***/ }),

/***/ "../../node_modules/rxjs/_esm5/operators/index.js":
/*!********************************************************!*\
  !*** ../../node_modules/rxjs/_esm5/operators/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   audit: () => (/* reexport safe */ _internal_operators_audit__WEBPACK_IMPORTED_MODULE_0__.audit),
/* harmony export */   auditTime: () => (/* reexport safe */ _internal_operators_auditTime__WEBPACK_IMPORTED_MODULE_1__.auditTime),
/* harmony export */   buffer: () => (/* reexport safe */ _internal_operators_buffer__WEBPACK_IMPORTED_MODULE_2__.buffer),
/* harmony export */   bufferCount: () => (/* reexport safe */ _internal_operators_bufferCount__WEBPACK_IMPORTED_MODULE_3__.bufferCount),
/* harmony export */   bufferTime: () => (/* reexport safe */ _internal_operators_bufferTime__WEBPACK_IMPORTED_MODULE_4__.bufferTime),
/* harmony export */   bufferToggle: () => (/* reexport safe */ _internal_operators_bufferToggle__WEBPACK_IMPORTED_MODULE_5__.bufferToggle),
/* harmony export */   bufferWhen: () => (/* reexport safe */ _internal_operators_bufferWhen__WEBPACK_IMPORTED_MODULE_6__.bufferWhen),
/* harmony export */   catchError: () => (/* reexport safe */ _internal_operators_catchError__WEBPACK_IMPORTED_MODULE_7__.catchError),
/* harmony export */   combineAll: () => (/* reexport safe */ _internal_operators_combineAll__WEBPACK_IMPORTED_MODULE_8__.combineAll),
/* harmony export */   combineLatest: () => (/* reexport safe */ _internal_operators_combineLatest__WEBPACK_IMPORTED_MODULE_9__.combineLatest),
/* harmony export */   concat: () => (/* reexport safe */ _internal_operators_concat__WEBPACK_IMPORTED_MODULE_10__.concat),
/* harmony export */   concatAll: () => (/* reexport safe */ _internal_operators_concatAll__WEBPACK_IMPORTED_MODULE_11__.concatAll),
/* harmony export */   concatMap: () => (/* reexport safe */ _internal_operators_concatMap__WEBPACK_IMPORTED_MODULE_12__.concatMap),
/* harmony export */   concatMapTo: () => (/* reexport safe */ _internal_operators_concatMapTo__WEBPACK_IMPORTED_MODULE_13__.concatMapTo),
/* harmony export */   count: () => (/* reexport safe */ _internal_operators_count__WEBPACK_IMPORTED_MODULE_14__.count),
/* harmony export */   debounce: () => (/* reexport safe */ _internal_operators_debounce__WEBPACK_IMPORTED_MODULE_15__.debounce),
/* harmony export */   debounceTime: () => (/* reexport safe */ _internal_operators_debounceTime__WEBPACK_IMPORTED_MODULE_16__.debounceTime),
/* harmony export */   defaultIfEmpty: () => (/* reexport safe */ _internal_operators_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_17__.defaultIfEmpty),
/* harmony export */   delay: () => (/* reexport safe */ _internal_operators_delay__WEBPACK_IMPORTED_MODULE_18__.delay),
/* harmony export */   delayWhen: () => (/* reexport safe */ _internal_operators_delayWhen__WEBPACK_IMPORTED_MODULE_19__.delayWhen),
/* harmony export */   dematerialize: () => (/* reexport safe */ _internal_operators_dematerialize__WEBPACK_IMPORTED_MODULE_20__.dematerialize),
/* harmony export */   distinct: () => (/* reexport safe */ _internal_operators_distinct__WEBPACK_IMPORTED_MODULE_21__.distinct),
/* harmony export */   distinctUntilChanged: () => (/* reexport safe */ _internal_operators_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_22__.distinctUntilChanged),
/* harmony export */   distinctUntilKeyChanged: () => (/* reexport safe */ _internal_operators_distinctUntilKeyChanged__WEBPACK_IMPORTED_MODULE_23__.distinctUntilKeyChanged),
/* harmony export */   elementAt: () => (/* reexport safe */ _internal_operators_elementAt__WEBPACK_IMPORTED_MODULE_24__.elementAt),
/* harmony export */   endWith: () => (/* reexport safe */ _internal_operators_endWith__WEBPACK_IMPORTED_MODULE_25__.endWith),
/* harmony export */   every: () => (/* reexport safe */ _internal_operators_every__WEBPACK_IMPORTED_MODULE_26__.every),
/* harmony export */   exhaust: () => (/* reexport safe */ _internal_operators_exhaust__WEBPACK_IMPORTED_MODULE_27__.exhaust),
/* harmony export */   exhaustMap: () => (/* reexport safe */ _internal_operators_exhaustMap__WEBPACK_IMPORTED_MODULE_28__.exhaustMap),
/* harmony export */   expand: () => (/* reexport safe */ _internal_operators_expand__WEBPACK_IMPORTED_MODULE_29__.expand),
/* harmony export */   filter: () => (/* reexport safe */ _internal_operators_filter__WEBPACK_IMPORTED_MODULE_30__.filter),
/* harmony export */   finalize: () => (/* reexport safe */ _internal_operators_finalize__WEBPACK_IMPORTED_MODULE_31__.finalize),
/* harmony export */   find: () => (/* reexport safe */ _internal_operators_find__WEBPACK_IMPORTED_MODULE_32__.find),
/* harmony export */   findIndex: () => (/* reexport safe */ _internal_operators_findIndex__WEBPACK_IMPORTED_MODULE_33__.findIndex),
/* harmony export */   first: () => (/* reexport safe */ _internal_operators_first__WEBPACK_IMPORTED_MODULE_34__.first),
/* harmony export */   flatMap: () => (/* reexport safe */ _internal_operators_mergeMap__WEBPACK_IMPORTED_MODULE_45__.flatMap),
/* harmony export */   groupBy: () => (/* reexport safe */ _internal_operators_groupBy__WEBPACK_IMPORTED_MODULE_35__.groupBy),
/* harmony export */   ignoreElements: () => (/* reexport safe */ _internal_operators_ignoreElements__WEBPACK_IMPORTED_MODULE_36__.ignoreElements),
/* harmony export */   isEmpty: () => (/* reexport safe */ _internal_operators_isEmpty__WEBPACK_IMPORTED_MODULE_37__.isEmpty),
/* harmony export */   last: () => (/* reexport safe */ _internal_operators_last__WEBPACK_IMPORTED_MODULE_38__.last),
/* harmony export */   map: () => (/* reexport safe */ _internal_operators_map__WEBPACK_IMPORTED_MODULE_39__.map),
/* harmony export */   mapTo: () => (/* reexport safe */ _internal_operators_mapTo__WEBPACK_IMPORTED_MODULE_40__.mapTo),
/* harmony export */   materialize: () => (/* reexport safe */ _internal_operators_materialize__WEBPACK_IMPORTED_MODULE_41__.materialize),
/* harmony export */   max: () => (/* reexport safe */ _internal_operators_max__WEBPACK_IMPORTED_MODULE_42__.max),
/* harmony export */   merge: () => (/* reexport safe */ _internal_operators_merge__WEBPACK_IMPORTED_MODULE_43__.merge),
/* harmony export */   mergeAll: () => (/* reexport safe */ _internal_operators_mergeAll__WEBPACK_IMPORTED_MODULE_44__.mergeAll),
/* harmony export */   mergeMap: () => (/* reexport safe */ _internal_operators_mergeMap__WEBPACK_IMPORTED_MODULE_45__.mergeMap),
/* harmony export */   mergeMapTo: () => (/* reexport safe */ _internal_operators_mergeMapTo__WEBPACK_IMPORTED_MODULE_46__.mergeMapTo),
/* harmony export */   mergeScan: () => (/* reexport safe */ _internal_operators_mergeScan__WEBPACK_IMPORTED_MODULE_47__.mergeScan),
/* harmony export */   min: () => (/* reexport safe */ _internal_operators_min__WEBPACK_IMPORTED_MODULE_48__.min),
/* harmony export */   multicast: () => (/* reexport safe */ _internal_operators_multicast__WEBPACK_IMPORTED_MODULE_49__.multicast),
/* harmony export */   observeOn: () => (/* reexport safe */ _internal_operators_observeOn__WEBPACK_IMPORTED_MODULE_50__.observeOn),
/* harmony export */   onErrorResumeNext: () => (/* reexport safe */ _internal_operators_onErrorResumeNext__WEBPACK_IMPORTED_MODULE_51__.onErrorResumeNext),
/* harmony export */   pairwise: () => (/* reexport safe */ _internal_operators_pairwise__WEBPACK_IMPORTED_MODULE_52__.pairwise),
/* harmony export */   partition: () => (/* reexport safe */ _internal_operators_partition__WEBPACK_IMPORTED_MODULE_53__.partition),
/* harmony export */   pluck: () => (/* reexport safe */ _internal_operators_pluck__WEBPACK_IMPORTED_MODULE_54__.pluck),
/* harmony export */   publish: () => (/* reexport safe */ _internal_operators_publish__WEBPACK_IMPORTED_MODULE_55__.publish),
/* harmony export */   publishBehavior: () => (/* reexport safe */ _internal_operators_publishBehavior__WEBPACK_IMPORTED_MODULE_56__.publishBehavior),
/* harmony export */   publishLast: () => (/* reexport safe */ _internal_operators_publishLast__WEBPACK_IMPORTED_MODULE_57__.publishLast),
/* harmony export */   publishReplay: () => (/* reexport safe */ _internal_operators_publishReplay__WEBPACK_IMPORTED_MODULE_58__.publishReplay),
/* harmony export */   race: () => (/* reexport safe */ _internal_operators_race__WEBPACK_IMPORTED_MODULE_59__.race),
/* harmony export */   reduce: () => (/* reexport safe */ _internal_operators_reduce__WEBPACK_IMPORTED_MODULE_60__.reduce),
/* harmony export */   refCount: () => (/* reexport safe */ _internal_operators_refCount__WEBPACK_IMPORTED_MODULE_65__.refCount),
/* harmony export */   repeat: () => (/* reexport safe */ _internal_operators_repeat__WEBPACK_IMPORTED_MODULE_61__.repeat),
/* harmony export */   repeatWhen: () => (/* reexport safe */ _internal_operators_repeatWhen__WEBPACK_IMPORTED_MODULE_62__.repeatWhen),
/* harmony export */   retry: () => (/* reexport safe */ _internal_operators_retry__WEBPACK_IMPORTED_MODULE_63__.retry),
/* harmony export */   retryWhen: () => (/* reexport safe */ _internal_operators_retryWhen__WEBPACK_IMPORTED_MODULE_64__.retryWhen),
/* harmony export */   sample: () => (/* reexport safe */ _internal_operators_sample__WEBPACK_IMPORTED_MODULE_66__.sample),
/* harmony export */   sampleTime: () => (/* reexport safe */ _internal_operators_sampleTime__WEBPACK_IMPORTED_MODULE_67__.sampleTime),
/* harmony export */   scan: () => (/* reexport safe */ _internal_operators_scan__WEBPACK_IMPORTED_MODULE_68__.scan),
/* harmony export */   sequenceEqual: () => (/* reexport safe */ _internal_operators_sequenceEqual__WEBPACK_IMPORTED_MODULE_69__.sequenceEqual),
/* harmony export */   share: () => (/* reexport safe */ _internal_operators_share__WEBPACK_IMPORTED_MODULE_70__.share),
/* harmony export */   shareReplay: () => (/* reexport safe */ _internal_operators_shareReplay__WEBPACK_IMPORTED_MODULE_71__.shareReplay),
/* harmony export */   single: () => (/* reexport safe */ _internal_operators_single__WEBPACK_IMPORTED_MODULE_72__.single),
/* harmony export */   skip: () => (/* reexport safe */ _internal_operators_skip__WEBPACK_IMPORTED_MODULE_73__.skip),
/* harmony export */   skipLast: () => (/* reexport safe */ _internal_operators_skipLast__WEBPACK_IMPORTED_MODULE_74__.skipLast),
/* harmony export */   skipUntil: () => (/* reexport safe */ _internal_operators_skipUntil__WEBPACK_IMPORTED_MODULE_75__.skipUntil),
/* harmony export */   skipWhile: () => (/* reexport safe */ _internal_operators_skipWhile__WEBPACK_IMPORTED_MODULE_76__.skipWhile),
/* harmony export */   startWith: () => (/* reexport safe */ _internal_operators_startWith__WEBPACK_IMPORTED_MODULE_77__.startWith),
/* harmony export */   subscribeOn: () => (/* reexport safe */ _internal_operators_subscribeOn__WEBPACK_IMPORTED_MODULE_78__.subscribeOn),
/* harmony export */   switchAll: () => (/* reexport safe */ _internal_operators_switchAll__WEBPACK_IMPORTED_MODULE_79__.switchAll),
/* harmony export */   switchMap: () => (/* reexport safe */ _internal_operators_switchMap__WEBPACK_IMPORTED_MODULE_80__.switchMap),
/* harmony export */   switchMapTo: () => (/* reexport safe */ _internal_operators_switchMapTo__WEBPACK_IMPORTED_MODULE_81__.switchMapTo),
/* harmony export */   take: () => (/* reexport safe */ _internal_operators_take__WEBPACK_IMPORTED_MODULE_82__.take),
/* harmony export */   takeLast: () => (/* reexport safe */ _internal_operators_takeLast__WEBPACK_IMPORTED_MODULE_83__.takeLast),
/* harmony export */   takeUntil: () => (/* reexport safe */ _internal_operators_takeUntil__WEBPACK_IMPORTED_MODULE_84__.takeUntil),
/* harmony export */   takeWhile: () => (/* reexport safe */ _internal_operators_takeWhile__WEBPACK_IMPORTED_MODULE_85__.takeWhile),
/* harmony export */   tap: () => (/* reexport safe */ _internal_operators_tap__WEBPACK_IMPORTED_MODULE_86__.tap),
/* harmony export */   throttle: () => (/* reexport safe */ _internal_operators_throttle__WEBPACK_IMPORTED_MODULE_87__.throttle),
/* harmony export */   throttleTime: () => (/* reexport safe */ _internal_operators_throttleTime__WEBPACK_IMPORTED_MODULE_88__.throttleTime),
/* harmony export */   throwIfEmpty: () => (/* reexport safe */ _internal_operators_throwIfEmpty__WEBPACK_IMPORTED_MODULE_89__.throwIfEmpty),
/* harmony export */   timeInterval: () => (/* reexport safe */ _internal_operators_timeInterval__WEBPACK_IMPORTED_MODULE_90__.timeInterval),
/* harmony export */   timeout: () => (/* reexport safe */ _internal_operators_timeout__WEBPACK_IMPORTED_MODULE_91__.timeout),
/* harmony export */   timeoutWith: () => (/* reexport safe */ _internal_operators_timeoutWith__WEBPACK_IMPORTED_MODULE_92__.timeoutWith),
/* harmony export */   timestamp: () => (/* reexport safe */ _internal_operators_timestamp__WEBPACK_IMPORTED_MODULE_93__.timestamp),
/* harmony export */   toArray: () => (/* reexport safe */ _internal_operators_toArray__WEBPACK_IMPORTED_MODULE_94__.toArray),
/* harmony export */   window: () => (/* reexport safe */ _internal_operators_window__WEBPACK_IMPORTED_MODULE_95__.window),
/* harmony export */   windowCount: () => (/* reexport safe */ _internal_operators_windowCount__WEBPACK_IMPORTED_MODULE_96__.windowCount),
/* harmony export */   windowTime: () => (/* reexport safe */ _internal_operators_windowTime__WEBPACK_IMPORTED_MODULE_97__.windowTime),
/* harmony export */   windowToggle: () => (/* reexport safe */ _internal_operators_windowToggle__WEBPACK_IMPORTED_MODULE_98__.windowToggle),
/* harmony export */   windowWhen: () => (/* reexport safe */ _internal_operators_windowWhen__WEBPACK_IMPORTED_MODULE_99__.windowWhen),
/* harmony export */   withLatestFrom: () => (/* reexport safe */ _internal_operators_withLatestFrom__WEBPACK_IMPORTED_MODULE_100__.withLatestFrom),
/* harmony export */   zip: () => (/* reexport safe */ _internal_operators_zip__WEBPACK_IMPORTED_MODULE_101__.zip),
/* harmony export */   zipAll: () => (/* reexport safe */ _internal_operators_zipAll__WEBPACK_IMPORTED_MODULE_102__.zipAll)
/* harmony export */ });
/* harmony import */ var _internal_operators_audit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal/operators/audit */ "../../node_modules/rxjs/_esm5/internal/operators/audit.js");
/* harmony import */ var _internal_operators_auditTime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../internal/operators/auditTime */ "../../node_modules/rxjs/_esm5/internal/operators/auditTime.js");
/* harmony import */ var _internal_operators_buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../internal/operators/buffer */ "../../node_modules/rxjs/_esm5/internal/operators/buffer.js");
/* harmony import */ var _internal_operators_bufferCount__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../internal/operators/bufferCount */ "../../node_modules/rxjs/_esm5/internal/operators/bufferCount.js");
/* harmony import */ var _internal_operators_bufferTime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../internal/operators/bufferTime */ "../../node_modules/rxjs/_esm5/internal/operators/bufferTime.js");
/* harmony import */ var _internal_operators_bufferToggle__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../internal/operators/bufferToggle */ "../../node_modules/rxjs/_esm5/internal/operators/bufferToggle.js");
/* harmony import */ var _internal_operators_bufferWhen__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../internal/operators/bufferWhen */ "../../node_modules/rxjs/_esm5/internal/operators/bufferWhen.js");
/* harmony import */ var _internal_operators_catchError__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../internal/operators/catchError */ "../../node_modules/rxjs/_esm5/internal/operators/catchError.js");
/* harmony import */ var _internal_operators_combineAll__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../internal/operators/combineAll */ "../../node_modules/rxjs/_esm5/internal/operators/combineAll.js");
/* harmony import */ var _internal_operators_combineLatest__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../internal/operators/combineLatest */ "../../node_modules/rxjs/_esm5/internal/operators/combineLatest.js");
/* harmony import */ var _internal_operators_concat__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../internal/operators/concat */ "../../node_modules/rxjs/_esm5/internal/operators/concat.js");
/* harmony import */ var _internal_operators_concatAll__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../internal/operators/concatAll */ "../../node_modules/rxjs/_esm5/internal/operators/concatAll.js");
/* harmony import */ var _internal_operators_concatMap__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../internal/operators/concatMap */ "../../node_modules/rxjs/_esm5/internal/operators/concatMap.js");
/* harmony import */ var _internal_operators_concatMapTo__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../internal/operators/concatMapTo */ "../../node_modules/rxjs/_esm5/internal/operators/concatMapTo.js");
/* harmony import */ var _internal_operators_count__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../internal/operators/count */ "../../node_modules/rxjs/_esm5/internal/operators/count.js");
/* harmony import */ var _internal_operators_debounce__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../internal/operators/debounce */ "../../node_modules/rxjs/_esm5/internal/operators/debounce.js");
/* harmony import */ var _internal_operators_debounceTime__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../internal/operators/debounceTime */ "../../node_modules/rxjs/_esm5/internal/operators/debounceTime.js");
/* harmony import */ var _internal_operators_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../internal/operators/defaultIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _internal_operators_delay__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../internal/operators/delay */ "../../node_modules/rxjs/_esm5/internal/operators/delay.js");
/* harmony import */ var _internal_operators_delayWhen__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../internal/operators/delayWhen */ "../../node_modules/rxjs/_esm5/internal/operators/delayWhen.js");
/* harmony import */ var _internal_operators_dematerialize__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../internal/operators/dematerialize */ "../../node_modules/rxjs/_esm5/internal/operators/dematerialize.js");
/* harmony import */ var _internal_operators_distinct__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../internal/operators/distinct */ "../../node_modules/rxjs/_esm5/internal/operators/distinct.js");
/* harmony import */ var _internal_operators_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../internal/operators/distinctUntilChanged */ "../../node_modules/rxjs/_esm5/internal/operators/distinctUntilChanged.js");
/* harmony import */ var _internal_operators_distinctUntilKeyChanged__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../internal/operators/distinctUntilKeyChanged */ "../../node_modules/rxjs/_esm5/internal/operators/distinctUntilKeyChanged.js");
/* harmony import */ var _internal_operators_elementAt__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../internal/operators/elementAt */ "../../node_modules/rxjs/_esm5/internal/operators/elementAt.js");
/* harmony import */ var _internal_operators_endWith__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../internal/operators/endWith */ "../../node_modules/rxjs/_esm5/internal/operators/endWith.js");
/* harmony import */ var _internal_operators_every__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ../internal/operators/every */ "../../node_modules/rxjs/_esm5/internal/operators/every.js");
/* harmony import */ var _internal_operators_exhaust__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../internal/operators/exhaust */ "../../node_modules/rxjs/_esm5/internal/operators/exhaust.js");
/* harmony import */ var _internal_operators_exhaustMap__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ../internal/operators/exhaustMap */ "../../node_modules/rxjs/_esm5/internal/operators/exhaustMap.js");
/* harmony import */ var _internal_operators_expand__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ../internal/operators/expand */ "../../node_modules/rxjs/_esm5/internal/operators/expand.js");
/* harmony import */ var _internal_operators_filter__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ../internal/operators/filter */ "../../node_modules/rxjs/_esm5/internal/operators/filter.js");
/* harmony import */ var _internal_operators_finalize__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ../internal/operators/finalize */ "../../node_modules/rxjs/_esm5/internal/operators/finalize.js");
/* harmony import */ var _internal_operators_find__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ../internal/operators/find */ "../../node_modules/rxjs/_esm5/internal/operators/find.js");
/* harmony import */ var _internal_operators_findIndex__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ../internal/operators/findIndex */ "../../node_modules/rxjs/_esm5/internal/operators/findIndex.js");
/* harmony import */ var _internal_operators_first__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ../internal/operators/first */ "../../node_modules/rxjs/_esm5/internal/operators/first.js");
/* harmony import */ var _internal_operators_groupBy__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ../internal/operators/groupBy */ "../../node_modules/rxjs/_esm5/internal/operators/groupBy.js");
/* harmony import */ var _internal_operators_ignoreElements__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ../internal/operators/ignoreElements */ "../../node_modules/rxjs/_esm5/internal/operators/ignoreElements.js");
/* harmony import */ var _internal_operators_isEmpty__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ../internal/operators/isEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/isEmpty.js");
/* harmony import */ var _internal_operators_last__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ../internal/operators/last */ "../../node_modules/rxjs/_esm5/internal/operators/last.js");
/* harmony import */ var _internal_operators_map__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ../internal/operators/map */ "../../node_modules/rxjs/_esm5/internal/operators/map.js");
/* harmony import */ var _internal_operators_mapTo__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ../internal/operators/mapTo */ "../../node_modules/rxjs/_esm5/internal/operators/mapTo.js");
/* harmony import */ var _internal_operators_materialize__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ../internal/operators/materialize */ "../../node_modules/rxjs/_esm5/internal/operators/materialize.js");
/* harmony import */ var _internal_operators_max__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ../internal/operators/max */ "../../node_modules/rxjs/_esm5/internal/operators/max.js");
/* harmony import */ var _internal_operators_merge__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ../internal/operators/merge */ "../../node_modules/rxjs/_esm5/internal/operators/merge.js");
/* harmony import */ var _internal_operators_mergeAll__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ../internal/operators/mergeAll */ "../../node_modules/rxjs/_esm5/internal/operators/mergeAll.js");
/* harmony import */ var _internal_operators_mergeMap__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ../internal/operators/mergeMap */ "../../node_modules/rxjs/_esm5/internal/operators/mergeMap.js");
/* harmony import */ var _internal_operators_mergeMapTo__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ../internal/operators/mergeMapTo */ "../../node_modules/rxjs/_esm5/internal/operators/mergeMapTo.js");
/* harmony import */ var _internal_operators_mergeScan__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ../internal/operators/mergeScan */ "../../node_modules/rxjs/_esm5/internal/operators/mergeScan.js");
/* harmony import */ var _internal_operators_min__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ../internal/operators/min */ "../../node_modules/rxjs/_esm5/internal/operators/min.js");
/* harmony import */ var _internal_operators_multicast__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ../internal/operators/multicast */ "../../node_modules/rxjs/_esm5/internal/operators/multicast.js");
/* harmony import */ var _internal_operators_observeOn__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ../internal/operators/observeOn */ "../../node_modules/rxjs/_esm5/internal/operators/observeOn.js");
/* harmony import */ var _internal_operators_onErrorResumeNext__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ../internal/operators/onErrorResumeNext */ "../../node_modules/rxjs/_esm5/internal/operators/onErrorResumeNext.js");
/* harmony import */ var _internal_operators_pairwise__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! ../internal/operators/pairwise */ "../../node_modules/rxjs/_esm5/internal/operators/pairwise.js");
/* harmony import */ var _internal_operators_partition__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! ../internal/operators/partition */ "../../node_modules/rxjs/_esm5/internal/operators/partition.js");
/* harmony import */ var _internal_operators_pluck__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! ../internal/operators/pluck */ "../../node_modules/rxjs/_esm5/internal/operators/pluck.js");
/* harmony import */ var _internal_operators_publish__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! ../internal/operators/publish */ "../../node_modules/rxjs/_esm5/internal/operators/publish.js");
/* harmony import */ var _internal_operators_publishBehavior__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! ../internal/operators/publishBehavior */ "../../node_modules/rxjs/_esm5/internal/operators/publishBehavior.js");
/* harmony import */ var _internal_operators_publishLast__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! ../internal/operators/publishLast */ "../../node_modules/rxjs/_esm5/internal/operators/publishLast.js");
/* harmony import */ var _internal_operators_publishReplay__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! ../internal/operators/publishReplay */ "../../node_modules/rxjs/_esm5/internal/operators/publishReplay.js");
/* harmony import */ var _internal_operators_race__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! ../internal/operators/race */ "../../node_modules/rxjs/_esm5/internal/operators/race.js");
/* harmony import */ var _internal_operators_reduce__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! ../internal/operators/reduce */ "../../node_modules/rxjs/_esm5/internal/operators/reduce.js");
/* harmony import */ var _internal_operators_repeat__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! ../internal/operators/repeat */ "../../node_modules/rxjs/_esm5/internal/operators/repeat.js");
/* harmony import */ var _internal_operators_repeatWhen__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! ../internal/operators/repeatWhen */ "../../node_modules/rxjs/_esm5/internal/operators/repeatWhen.js");
/* harmony import */ var _internal_operators_retry__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! ../internal/operators/retry */ "../../node_modules/rxjs/_esm5/internal/operators/retry.js");
/* harmony import */ var _internal_operators_retryWhen__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! ../internal/operators/retryWhen */ "../../node_modules/rxjs/_esm5/internal/operators/retryWhen.js");
/* harmony import */ var _internal_operators_refCount__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! ../internal/operators/refCount */ "../../node_modules/rxjs/_esm5/internal/operators/refCount.js");
/* harmony import */ var _internal_operators_sample__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! ../internal/operators/sample */ "../../node_modules/rxjs/_esm5/internal/operators/sample.js");
/* harmony import */ var _internal_operators_sampleTime__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! ../internal/operators/sampleTime */ "../../node_modules/rxjs/_esm5/internal/operators/sampleTime.js");
/* harmony import */ var _internal_operators_scan__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! ../internal/operators/scan */ "../../node_modules/rxjs/_esm5/internal/operators/scan.js");
/* harmony import */ var _internal_operators_sequenceEqual__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(/*! ../internal/operators/sequenceEqual */ "../../node_modules/rxjs/_esm5/internal/operators/sequenceEqual.js");
/* harmony import */ var _internal_operators_share__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(/*! ../internal/operators/share */ "../../node_modules/rxjs/_esm5/internal/operators/share.js");
/* harmony import */ var _internal_operators_shareReplay__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(/*! ../internal/operators/shareReplay */ "../../node_modules/rxjs/_esm5/internal/operators/shareReplay.js");
/* harmony import */ var _internal_operators_single__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(/*! ../internal/operators/single */ "../../node_modules/rxjs/_esm5/internal/operators/single.js");
/* harmony import */ var _internal_operators_skip__WEBPACK_IMPORTED_MODULE_73__ = __webpack_require__(/*! ../internal/operators/skip */ "../../node_modules/rxjs/_esm5/internal/operators/skip.js");
/* harmony import */ var _internal_operators_skipLast__WEBPACK_IMPORTED_MODULE_74__ = __webpack_require__(/*! ../internal/operators/skipLast */ "../../node_modules/rxjs/_esm5/internal/operators/skipLast.js");
/* harmony import */ var _internal_operators_skipUntil__WEBPACK_IMPORTED_MODULE_75__ = __webpack_require__(/*! ../internal/operators/skipUntil */ "../../node_modules/rxjs/_esm5/internal/operators/skipUntil.js");
/* harmony import */ var _internal_operators_skipWhile__WEBPACK_IMPORTED_MODULE_76__ = __webpack_require__(/*! ../internal/operators/skipWhile */ "../../node_modules/rxjs/_esm5/internal/operators/skipWhile.js");
/* harmony import */ var _internal_operators_startWith__WEBPACK_IMPORTED_MODULE_77__ = __webpack_require__(/*! ../internal/operators/startWith */ "../../node_modules/rxjs/_esm5/internal/operators/startWith.js");
/* harmony import */ var _internal_operators_subscribeOn__WEBPACK_IMPORTED_MODULE_78__ = __webpack_require__(/*! ../internal/operators/subscribeOn */ "../../node_modules/rxjs/_esm5/internal/operators/subscribeOn.js");
/* harmony import */ var _internal_operators_switchAll__WEBPACK_IMPORTED_MODULE_79__ = __webpack_require__(/*! ../internal/operators/switchAll */ "../../node_modules/rxjs/_esm5/internal/operators/switchAll.js");
/* harmony import */ var _internal_operators_switchMap__WEBPACK_IMPORTED_MODULE_80__ = __webpack_require__(/*! ../internal/operators/switchMap */ "../../node_modules/rxjs/_esm5/internal/operators/switchMap.js");
/* harmony import */ var _internal_operators_switchMapTo__WEBPACK_IMPORTED_MODULE_81__ = __webpack_require__(/*! ../internal/operators/switchMapTo */ "../../node_modules/rxjs/_esm5/internal/operators/switchMapTo.js");
/* harmony import */ var _internal_operators_take__WEBPACK_IMPORTED_MODULE_82__ = __webpack_require__(/*! ../internal/operators/take */ "../../node_modules/rxjs/_esm5/internal/operators/take.js");
/* harmony import */ var _internal_operators_takeLast__WEBPACK_IMPORTED_MODULE_83__ = __webpack_require__(/*! ../internal/operators/takeLast */ "../../node_modules/rxjs/_esm5/internal/operators/takeLast.js");
/* harmony import */ var _internal_operators_takeUntil__WEBPACK_IMPORTED_MODULE_84__ = __webpack_require__(/*! ../internal/operators/takeUntil */ "../../node_modules/rxjs/_esm5/internal/operators/takeUntil.js");
/* harmony import */ var _internal_operators_takeWhile__WEBPACK_IMPORTED_MODULE_85__ = __webpack_require__(/*! ../internal/operators/takeWhile */ "../../node_modules/rxjs/_esm5/internal/operators/takeWhile.js");
/* harmony import */ var _internal_operators_tap__WEBPACK_IMPORTED_MODULE_86__ = __webpack_require__(/*! ../internal/operators/tap */ "../../node_modules/rxjs/_esm5/internal/operators/tap.js");
/* harmony import */ var _internal_operators_throttle__WEBPACK_IMPORTED_MODULE_87__ = __webpack_require__(/*! ../internal/operators/throttle */ "../../node_modules/rxjs/_esm5/internal/operators/throttle.js");
/* harmony import */ var _internal_operators_throttleTime__WEBPACK_IMPORTED_MODULE_88__ = __webpack_require__(/*! ../internal/operators/throttleTime */ "../../node_modules/rxjs/_esm5/internal/operators/throttleTime.js");
/* harmony import */ var _internal_operators_throwIfEmpty__WEBPACK_IMPORTED_MODULE_89__ = __webpack_require__(/*! ../internal/operators/throwIfEmpty */ "../../node_modules/rxjs/_esm5/internal/operators/throwIfEmpty.js");
/* harmony import */ var _internal_operators_timeInterval__WEBPACK_IMPORTED_MODULE_90__ = __webpack_require__(/*! ../internal/operators/timeInterval */ "../../node_modules/rxjs/_esm5/internal/operators/timeInterval.js");
/* harmony import */ var _internal_operators_timeout__WEBPACK_IMPORTED_MODULE_91__ = __webpack_require__(/*! ../internal/operators/timeout */ "../../node_modules/rxjs/_esm5/internal/operators/timeout.js");
/* harmony import */ var _internal_operators_timeoutWith__WEBPACK_IMPORTED_MODULE_92__ = __webpack_require__(/*! ../internal/operators/timeoutWith */ "../../node_modules/rxjs/_esm5/internal/operators/timeoutWith.js");
/* harmony import */ var _internal_operators_timestamp__WEBPACK_IMPORTED_MODULE_93__ = __webpack_require__(/*! ../internal/operators/timestamp */ "../../node_modules/rxjs/_esm5/internal/operators/timestamp.js");
/* harmony import */ var _internal_operators_toArray__WEBPACK_IMPORTED_MODULE_94__ = __webpack_require__(/*! ../internal/operators/toArray */ "../../node_modules/rxjs/_esm5/internal/operators/toArray.js");
/* harmony import */ var _internal_operators_window__WEBPACK_IMPORTED_MODULE_95__ = __webpack_require__(/*! ../internal/operators/window */ "../../node_modules/rxjs/_esm5/internal/operators/window.js");
/* harmony import */ var _internal_operators_windowCount__WEBPACK_IMPORTED_MODULE_96__ = __webpack_require__(/*! ../internal/operators/windowCount */ "../../node_modules/rxjs/_esm5/internal/operators/windowCount.js");
/* harmony import */ var _internal_operators_windowTime__WEBPACK_IMPORTED_MODULE_97__ = __webpack_require__(/*! ../internal/operators/windowTime */ "../../node_modules/rxjs/_esm5/internal/operators/windowTime.js");
/* harmony import */ var _internal_operators_windowToggle__WEBPACK_IMPORTED_MODULE_98__ = __webpack_require__(/*! ../internal/operators/windowToggle */ "../../node_modules/rxjs/_esm5/internal/operators/windowToggle.js");
/* harmony import */ var _internal_operators_windowWhen__WEBPACK_IMPORTED_MODULE_99__ = __webpack_require__(/*! ../internal/operators/windowWhen */ "../../node_modules/rxjs/_esm5/internal/operators/windowWhen.js");
/* harmony import */ var _internal_operators_withLatestFrom__WEBPACK_IMPORTED_MODULE_100__ = __webpack_require__(/*! ../internal/operators/withLatestFrom */ "../../node_modules/rxjs/_esm5/internal/operators/withLatestFrom.js");
/* harmony import */ var _internal_operators_zip__WEBPACK_IMPORTED_MODULE_101__ = __webpack_require__(/*! ../internal/operators/zip */ "../../node_modules/rxjs/_esm5/internal/operators/zip.js");
/* harmony import */ var _internal_operators_zipAll__WEBPACK_IMPORTED_MODULE_102__ = __webpack_require__(/*! ../internal/operators/zipAll */ "../../node_modules/rxjs/_esm5/internal/operators/zipAll.js");
/** PURE_IMPORTS_START  PURE_IMPORTS_END */







































































































//# sourceMappingURL=index.js.map


/***/ }),

/***/ "../../node_modules/rxjs/node_modules/tslib/tslib.es6.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rxjs/node_modules/tslib/tslib.es6.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __assign: () => (/* binding */ __assign),
/* harmony export */   __asyncDelegator: () => (/* binding */ __asyncDelegator),
/* harmony export */   __asyncGenerator: () => (/* binding */ __asyncGenerator),
/* harmony export */   __asyncValues: () => (/* binding */ __asyncValues),
/* harmony export */   __await: () => (/* binding */ __await),
/* harmony export */   __awaiter: () => (/* binding */ __awaiter),
/* harmony export */   __classPrivateFieldGet: () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   __classPrivateFieldSet: () => (/* binding */ __classPrivateFieldSet),
/* harmony export */   __createBinding: () => (/* binding */ __createBinding),
/* harmony export */   __decorate: () => (/* binding */ __decorate),
/* harmony export */   __exportStar: () => (/* binding */ __exportStar),
/* harmony export */   __extends: () => (/* binding */ __extends),
/* harmony export */   __generator: () => (/* binding */ __generator),
/* harmony export */   __importDefault: () => (/* binding */ __importDefault),
/* harmony export */   __importStar: () => (/* binding */ __importStar),
/* harmony export */   __makeTemplateObject: () => (/* binding */ __makeTemplateObject),
/* harmony export */   __metadata: () => (/* binding */ __metadata),
/* harmony export */   __param: () => (/* binding */ __param),
/* harmony export */   __read: () => (/* binding */ __read),
/* harmony export */   __rest: () => (/* binding */ __rest),
/* harmony export */   __spread: () => (/* binding */ __spread),
/* harmony export */   __spreadArrays: () => (/* binding */ __spreadArrays),
/* harmony export */   __values: () => (/* binding */ __values)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ }),

/***/ "./src/constants/UpdateMode.ts":
/*!*************************************!*\
  !*** ./src/constants/UpdateMode.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UpdateMode: () => (/* binding */ UpdateMode)
/* harmony export */ });
var UpdateMode;
(function(UpdateMode) {
    UpdateMode["PAGE"] = "page";
    UpdateMode["DOCUMENT"] = "document";
    UpdateMode["SELECTION"] = "selection";
})(UpdateMode || (UpdateMode = {}));


/***/ }),

/***/ "./src/plugin/asyncMessageHandlers/applySiblingStyle.ts":
/*!**************************************************************!*\
  !*** ./src/plugin/asyncMessageHandlers/applySiblingStyle.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applySiblingStyleId: () => (/* binding */ applySiblingStyleId)
/* harmony export */ });
/* harmony import */ var _getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getSiblingStyleId */ "./src/plugin/asyncMessageHandlers/getSiblingStyleId.ts");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return(g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g);
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}

// Goes through all styleable properties of a node and swaps the style - this traverses the whole tree of a node
function applySiblingStyleId(node, styleIds, styleMap, activeThemes) {
    return _applySiblingStyleId.apply(this, arguments);
}
function _applySiblingStyleId() {
    _applySiblingStyleId = _async_to_generator(function(node, styleIds, styleMap, activeThemes) {
        var _, newStrokeStyleId, newEffectStyleId, newTextStyleId, newFillStyleId, newFillStyleId1, _tmp, newStrokeStyleId1, _tmp1, newEffectStyleId1, _tmp2, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    _state.trys.push([
                        0,
                        23,
                        ,
                        24
                    ]);
                    _ = node.type;
                    switch(_){
                        case "TEXT":
                            return [
                                3,
                                1
                            ];
                        case "ELLIPSE":
                            return [
                                3,
                                10
                            ];
                        case "LINE":
                            return [
                                3,
                                10
                            ];
                        case "POLYGON":
                            return [
                                3,
                                10
                            ];
                        case "STAR":
                            return [
                                3,
                                10
                            ];
                        case "RECTANGLE":
                            return [
                                3,
                                10
                            ];
                        case "VECTOR":
                            return [
                                3,
                                10
                            ];
                        case "COMPONENT":
                            return [
                                3,
                                10
                            ];
                        case "INSTANCE":
                            return [
                                3,
                                10
                            ];
                        case "COMPONENT_SET":
                            return [
                                3,
                                10
                            ];
                        case "FRAME":
                            return [
                                3,
                                10
                            ];
                        case "SECTION":
                            return [
                                3,
                                10
                            ];
                        case "BOOLEAN_OPERATION":
                            return [
                                3,
                                10
                            ];
                        case "GROUP":
                            return [
                                3,
                                19
                            ];
                    }
                    return [
                        3,
                        21
                    ];
                case 1:
                    return [
                        4,
                        (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(node.strokeStyleId, styleIds, styleMap, activeThemes)
                    ];
                case 2:
                    newStrokeStyleId = _state.sent();
                    return [
                        4,
                        (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(node.effectStyleId, styleIds, styleMap, activeThemes)
                    ];
                case 3:
                    newEffectStyleId = _state.sent();
                    if (newStrokeStyleId) {
                        node.strokeStyleId = newStrokeStyleId;
                    }
                    if (newEffectStyleId) {
                        node.effectStyleId = newEffectStyleId;
                    }
                    if (!(node.textStyleId !== figma.mixed)) return [
                        3,
                        5
                    ];
                    return [
                        4,
                        (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(node.textStyleId, styleIds, styleMap, activeThemes)
                    ];
                case 4:
                    newTextStyleId = _state.sent();
                    if (newTextStyleId) {
                        node.textStyleId = newTextStyleId;
                    }
                    return [
                        3,
                        6
                    ];
                case 5:
                    node.getStyledTextSegments([
                        "textStyleId"
                    ]).forEach(function() {
                        var _ref = _async_to_generator(function(segment) {
                            var newTextStyleId;
                            return _ts_generator(this, function(_state) {
                                switch(_state.label){
                                    case 0:
                                        return [
                                            4,
                                            (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(segment.textStyleId, styleIds, styleMap, activeThemes)
                                        ];
                                    case 1:
                                        newTextStyleId = _state.sent();
                                        if (newTextStyleId) {
                                            node.setRangeTextStyleId(segment.start, segment.end, newTextStyleId);
                                        }
                                        return [
                                            2
                                        ];
                                }
                            });
                        });
                        return function(segment) {
                            return _ref.apply(this, arguments);
                        };
                    }());
                    _state.label = 6;
                case 6:
                    if (!(node.fillStyleId !== figma.mixed)) return [
                        3,
                        8
                    ];
                    return [
                        4,
                        (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(node.fillStyleId, styleIds, styleMap, activeThemes)
                    ];
                case 7:
                    newFillStyleId = _state.sent();
                    if (newFillStyleId) {
                        node.fillStyleId = newFillStyleId;
                    }
                    return [
                        3,
                        9
                    ];
                case 8:
                    node.getStyledTextSegments([
                        "fillStyleId"
                    ]).forEach(function() {
                        var _ref = _async_to_generator(function(segment) {
                            var newFillStyleId;
                            return _ts_generator(this, function(_state) {
                                switch(_state.label){
                                    case 0:
                                        return [
                                            4,
                                            (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(segment.fillStyleId, styleIds, styleMap, activeThemes)
                                        ];
                                    case 1:
                                        newFillStyleId = _state.sent();
                                        if (newFillStyleId) {
                                            node.setRangeFillStyleId(segment.start, segment.end, newFillStyleId);
                                        }
                                        return [
                                            2
                                        ];
                                }
                            });
                        });
                        return function(segment) {
                            return _ref.apply(this, arguments);
                        };
                    }());
                    _state.label = 9;
                case 9:
                    return [
                        3,
                        22
                    ];
                case 10:
                    _tmp = "fillStyleId" in node;
                    if (!_tmp) return [
                        3,
                        12
                    ];
                    return [
                        4,
                        (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(node.fillStyleId, styleIds, styleMap, activeThemes)
                    ];
                case 11:
                    _tmp = _state.sent();
                    _state.label = 12;
                case 12:
                    newFillStyleId1 = _tmp;
                    _tmp1 = "strokeStyleId" in node;
                    if (!_tmp1) return [
                        3,
                        14
                    ];
                    return [
                        4,
                        (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(node.strokeStyleId, styleIds, styleMap, activeThemes)
                    ];
                case 13:
                    _tmp1 = _state.sent();
                    _state.label = 14;
                case 14:
                    newStrokeStyleId1 = _tmp1;
                    _tmp2 = "effectStyleId" in node;
                    if (!_tmp2) return [
                        3,
                        16
                    ];
                    return [
                        4,
                        (0,_getSiblingStyleId__WEBPACK_IMPORTED_MODULE_0__.getNewStyleId)(node.effectStyleId, styleIds, styleMap, activeThemes)
                    ];
                case 15:
                    _tmp2 = _state.sent();
                    _state.label = 16;
                case 16:
                    newEffectStyleId1 = _tmp2;
                    if (newFillStyleId1) {
                        node.fillStyleId = newFillStyleId1;
                    }
                    if (newStrokeStyleId1) {
                        node.strokeStyleId = newStrokeStyleId1;
                    }
                    if (newEffectStyleId1) {
                        node.effectStyleId = newEffectStyleId1;
                    }
                    if (!([
                        "COMPONENT",
                        "COMPONENT_SET",
                        "SECTION",
                        "INSTANCE",
                        "FRAME",
                        "BOOLEAN_OPERATION"
                    ].includes(node.type) && "children" in node)) return [
                        3,
                        18
                    ];
                    return [
                        4,
                        Promise.all(node.children.map(function(child) {
                            return applySiblingStyleId(child, styleIds, styleMap, activeThemes);
                        }))
                    ];
                case 17:
                    _state.sent();
                    _state.label = 18;
                case 18:
                    return [
                        3,
                        22
                    ];
                case 19:
                    return [
                        4,
                        Promise.all(node.children.map(function(child) {
                            return applySiblingStyleId(child, styleIds, styleMap, activeThemes);
                        }))
                    ];
                case 20:
                    _state.sent();
                    return [
                        3,
                        22
                    ];
                case 21:
                    return [
                        3,
                        22
                    ];
                case 22:
                    return [
                        3,
                        24
                    ];
                case 23:
                    error = _state.sent();
                    console.error(error);
                    return [
                        3,
                        24
                    ];
                case 24:
                    return [
                        2
                    ];
            }
        });
    });
    return _applySiblingStyleId.apply(this, arguments);
}


/***/ }),

/***/ "./src/plugin/asyncMessageHandlers/getSiblingStyleId.ts":
/*!**************************************************************!*\
  !*** ./src/plugin/asyncMessageHandlers/getSiblingStyleId.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getNewStyleId: () => (/* binding */ getNewStyleId)
/* harmony export */ });
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var memo = {};
// Gets the sibling style for a given style considering the new theme
function getNewStyleId(styleId, styleIds, styleMap, activeThemes) {
    return _getNewStyleId.apply(this, arguments);
}
function _getNewStyleId() {
    _getNewStyleId = _async_to_generator(function(styleId, styleIds, styleMap, activeThemes) {
        var normalizedStyleId, tokenName, newTheme, newStyleToFetch, actualStyleId, styleKeyMatch, figmaStyle;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (!styleId) {
                        return [
                            2,
                            null
                        ];
                    }
                    // Removes the , 4:16 part after each style (we seem to store styleIds without that part)
                    normalizedStyleId = styleId.split(",")[0].concat(",");
                    tokenName = styleIds[normalizedStyleId];
                    // If there is no figmaStyleReference for that token, we can't do anything
                    if (!tokenName) {
                        console.warn("".concat(normalizedStyleId, " not found"));
                        return [
                            2,
                            null
                        ];
                    }
                    // Get the sibling style for the new theme
                    newTheme = Object.keys(styleMap[tokenName]).find(function(themeName) {
                        return activeThemes.includes(themeName);
                    });
                    if (!newTheme) return [
                        3,
                        4
                    ];
                    newStyleToFetch = styleMap[tokenName][newTheme];
                    // If there is none, return
                    if (!newStyleToFetch) {
                        console.warn("".concat(tokenName, " for theme ").concat(newTheme, " not found"));
                        return [
                            2,
                            null
                        ];
                    }
                    actualStyleId = newStyleToFetch;
                    if (!memo.hasOwnProperty(newStyleToFetch)) return [
                        3,
                        1
                    ];
                    actualStyleId = memo[newStyleToFetch];
                    return [
                        3,
                        3
                    ];
                case 1:
                    // Otherwise, fetch it and store it in memory
                    // This fetches the remote style and returns the local styleId that we need to apply the token
                    styleKeyMatch = newStyleToFetch.match(/^S:([a-zA-Z0-9_-]+),/);
                    if (!styleKeyMatch) return [
                        3,
                        3
                    ];
                    return [
                        4,
                        new Promise(function(resolve) {
                            figma.importStyleByKeyAsync(styleKeyMatch[1]).then(function(style) {
                                return resolve(style.id);
                            }).catch(function() {
                                return resolve(newStyleToFetch);
                            });
                        })
                    ];
                case 2:
                    actualStyleId = _state.sent();
                    memo[newStyleToFetch] = actualStyleId;
                    _state.label = 3;
                case 3:
                    figmaStyle = figma.getStyleById(actualStyleId);
                    // If there is no figmaStyle for that token, we can't do anything
                    if (!figmaStyle) {
                        console.warn("figma style for ".concat(tokenName, " not found, ").concat(newStyleToFetch));
                        return [
                            2,
                            null
                        ];
                    }
                    return [
                        2,
                        figmaStyle.id
                    ];
                case 4:
                    return [
                        2,
                        null
                    ];
            }
        });
    });
    return _getNewStyleId.apply(this, arguments);
}


/***/ }),

/***/ "./src/plugin/asyncMessageHandlers/swapStyles.ts":
/*!*******************************************************!*\
  !*** ./src/plugin/asyncMessageHandlers/swapStyles.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   swapStyles: () => (/* binding */ swapStyles)
/* harmony export */ });
/* harmony import */ var _constants_UpdateMode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/UpdateMode */ "./src/constants/UpdateMode.ts");
/* harmony import */ var _applySiblingStyle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./applySiblingStyle */ "./src/plugin/asyncMessageHandlers/applySiblingStyle.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}


function getRootNode(updateMode) {
    var rootNode = [];
    switch(updateMode){
        case _constants_UpdateMode__WEBPACK_IMPORTED_MODULE_0__.UpdateMode.PAGE:
            var _rootNode;
            if (figma.currentPage.children) (_rootNode = rootNode).push.apply(_rootNode, _to_consumable_array(figma.currentPage.children));
            break;
        case _constants_UpdateMode__WEBPACK_IMPORTED_MODULE_0__.UpdateMode.SELECTION:
            var _rootNode1;
            if (figma.currentPage.selection) (_rootNode1 = rootNode).push.apply(_rootNode1, _to_consumable_array(figma.currentPage.selection));
            break;
        case _constants_UpdateMode__WEBPACK_IMPORTED_MODULE_0__.UpdateMode.DOCUMENT:
            var _rootNode2;
            figma.root.children.forEach(function(page) {
                return (_rootNode2 = rootNode).push.apply(_rootNode2, _to_consumable_array(page.children));
            });
            break;
        default:
            var _rootNode3;
            (_rootNode3 = rootNode).push.apply(_rootNode3, _to_consumable_array(figma.currentPage.children));
            break;
    }
    return rootNode;
}
// Go through layers to swap styles
function swapStyles(activeTheme, themes, updateMode) {
    return _swapStyles.apply(this, arguments);
}
function _swapStyles() {
    _swapStyles = _async_to_generator(function(activeTheme, themes, updateMode) {
        var activeThemes, mappedStyleReferences, allStyleIds;
        return _ts_generator(this, function(_state) {
            activeThemes = themes.filter(function(theme) {
                return Object.values(activeTheme).some(function(v) {
                    return v === theme.id;
                });
            }).map(function(t) {
                return t.name;
            });
            // Creates an object that groups sibling styles by token name and theme name, e.g. { 'color.background': { 'dark': 'S:1234,4:16', 'light': 'S:1235,4:16' } }
            mappedStyleReferences = themes.reduce(function(acc, theme) {
                if (theme.$figmaStyleReferences) {
                    Object.entries(theme.$figmaStyleReferences).forEach(function(param) {
                        var _param = _sliced_to_array(param, 2), styleName = _param[0], styleId = _param[1];
                        acc[styleName] = _object_spread_props(_object_spread({}, acc[styleName]), _define_property({}, theme.name, styleId));
                    });
                }
                return acc;
            }, {});
            // Creates an object that maps styleIds to token names, e.g. { 'S:1234,4:16': 'color.background' }
            allStyleIds = Object.entries(mappedStyleReferences).reduce(function(acc, param) {
                var _param = _sliced_to_array(param, 2), tokenName = _param[0], mapping = _param[1];
                Object.values(mapping).forEach(function(styleId) {
                    acc[styleId] = tokenName;
                });
                return acc;
            }, {});
            if (activeThemes.length < 1 || !mappedStyleReferences || !allStyleIds) {
                return [
                    2
                ];
            }
            getRootNode(updateMode).forEach(function(layer) {
                (0,_applySiblingStyle__WEBPACK_IMPORTED_MODULE_1__.applySiblingStyleId)(layer, allStyleIds, mappedStyleReferences, activeThemes);
            });
            return [
                2
            ];
        });
    });
    return _swapStyles.apply(this, arguments);
}


/***/ }),

/***/ "../../node_modules/nanoid/index.browser.js":
/*!**************************************************!*\
  !*** ../../node_modules/nanoid/index.browser.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   customAlphabet: () => (/* binding */ customAlphabet),
/* harmony export */   customRandom: () => (/* binding */ customRandom),
/* harmony export */   nanoid: () => (/* binding */ nanoid),
/* harmony export */   random: () => (/* binding */ random),
/* harmony export */   urlAlphabet: () => (/* reexport safe */ _url_alphabet_index_js__WEBPACK_IMPORTED_MODULE_0__.urlAlphabet)
/* harmony export */ });
/* harmony import */ var _url_alphabet_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./url-alphabet/index.js */ "../../node_modules/nanoid/url-alphabet/index.js");

let random = bytes => crypto.getRandomValues(new Uint8Array(bytes))
let customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1
  let step = -~((1.6 * mask * defaultSize) / alphabet.length)
  return (size = defaultSize) => {
    let id = ''
    while (true) {
      let bytes = getRandom(step)
      let j = step
      while (j--) {
        id += alphabet[bytes[j] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}
let customAlphabet = (alphabet, size = 21) =>
  customRandom(alphabet, size, random)
let nanoid = (size = 21) =>
  crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
    byte &= 63
    if (byte < 36) {
      id += byte.toString(36)
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase()
    } else if (byte > 62) {
      id += '-'
    } else {
      id += '_'
    }
    return id
  }, '')



/***/ }),

/***/ "../../node_modules/nanoid/url-alphabet/index.js":
/*!*******************************************************!*\
  !*** ../../node_modules/nanoid/url-alphabet/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   urlAlphabet: () => (/* binding */ urlAlphabet)
/* harmony export */ });
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'



/***/ }),

/***/ "./benchmark/mocks/flat-file_children.json":
/*!*************************************************!*\
  !*** ./benchmark/mocks/flat-file_children.json ***!
  \*************************************************/
/***/ ((module) => {

module.exports = JSON.parse('[{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:2","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkBrand020"}},"name":"ink.inkBrand020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:3","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkBrand010"}},"name":"ink.inkBrand010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:4","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkInformative"}},"name":"ink.inkInformative"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:5","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkNotice"}},"name":"ink.inkNotice"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:6","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkNegative"}},"name":"ink.inkNegative"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:7","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkPositive"}},"name":"ink.inkPositive"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:8","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkDark010"}},"name":"ink.inkDark010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:9","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkLight010"}},"name":"ink.inkLight010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:10","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkInverse"}},"name":"ink.inkInverse"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:11","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkNonEssential"}},"name":"ink.inkNonEssential"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:12","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkSubtle"}},"name":"ink.inkSubtle"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:13","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkBase"}},"name":"ink.inkBase"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:14","parent":"undefined","sharedPluginData":{"tokens":{"fill":"ink.inkContrast"}},"name":"ink.inkContrast"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:15","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceSkeleton020"}},"name":"interface.interfaceSkeleton020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:16","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceSkeleton010"}},"name":"interface.interfaceSkeleton010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:17","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceNeutral020"}},"name":"interface.interfaceNeutral020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:18","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceNeutral010"}},"name":"interface.interfaceNeutral010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:19","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceInformative020"}},"name":"interface.interfaceInformative020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:20","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceInformative010"}},"name":"interface.interfaceInformative010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:21","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceNotice020"}},"name":"interface.interfaceNotice020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:22","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceNotice010"}},"name":"interface.interfaceNotice010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:23","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceNegative020"}},"name":"interface.interfaceNegative020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:24","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceNegative010"}},"name":"interface.interfaceNegative010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:25","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfacePositive020"}},"name":"interface.interfacePositive020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:26","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfacePositive010"}},"name":"interface.interfacePositive010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:27","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceBrand020"}},"name":"interface.interfaceBrand020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:28","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceBrand010"}},"name":"interface.interfaceBrand010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:29","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interface060"}},"name":"interface.interface060"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:30","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interface050"}},"name":"interface.interface050"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:31","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interface040"}},"name":"interface.interface040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:32","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interface030"}},"name":"interface.interface030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:33","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interface020"}},"name":"interface.interface020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:34","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interface010"}},"name":"interface.interface010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:35","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interface.interfaceBackground"}},"name":"interface.interfaceBackground"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:36","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInput050"}},"name":"interactive.interactiveInput050"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:37","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInput040"}},"name":"interactive.interactiveInput040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:38","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInput030"}},"name":"interactive.interactiveInput030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:39","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInput020"}},"name":"interactive.interactiveInput020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:40","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInput010"}},"name":"interactive.interactiveInput010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:41","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveFocus010"}},"name":"interactive.interactiveFocus010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:42","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveFocus020"}},"name":"interactive.interactiveFocus020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:43","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveVisited010"}},"name":"interactive.interactiveVisited010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:44","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveDisabled010"}},"name":"interactive.interactiveDisabled010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:45","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveLink030"}},"name":"interactive.interactiveLink030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:46","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveLink020"}},"name":"interactive.interactiveLink020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:47","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveLink010"}},"name":"interactive.interactiveLink010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:48","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInverse050"}},"name":"interactive.interactiveInverse050"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:49","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInverse040"}},"name":"interactive.interactiveInverse040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:50","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInverse030"}},"name":"interactive.interactiveInverse030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:51","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInverse020"}},"name":"interactive.interactiveInverse020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:52","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveInverse010"}},"name":"interactive.interactiveInverse010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:53","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveNegative050"}},"name":"interactive.interactiveNegative050"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:54","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveNegative040"}},"name":"interactive.interactiveNegative040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:55","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveNegative030"}},"name":"interactive.interactiveNegative030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:56","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveNegative020"}},"name":"interactive.interactiveNegative020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:57","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveNegative010"}},"name":"interactive.interactiveNegative010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:58","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePositive050"}},"name":"interactive.interactivePositive050"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:59","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePositive040"}},"name":"interactive.interactivePositive040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:60","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePositive030"}},"name":"interactive.interactivePositive030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:61","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePositive020"}},"name":"interactive.interactivePositive020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:62","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePositive010"}},"name":"interactive.interactivePositive010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:63","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveSecondary050"}},"name":"interactive.interactiveSecondary050"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:64","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveSecondary040"}},"name":"interactive.interactiveSecondary040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:65","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveSecondary030"}},"name":"interactive.interactiveSecondary030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:66","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveSecondary020"}},"name":"interactive.interactiveSecondary020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:67","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactiveSecondary010"}},"name":"interactive.interactiveSecondary010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:68","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePrimary050"}},"name":"interactive.interactivePrimary050"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:69","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePrimary040"}},"name":"interactive.interactivePrimary040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:70","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePrimary030"}},"name":"interactive.interactivePrimary030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:71","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePrimary020"}},"name":"interactive.interactivePrimary020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:72","parent":"undefined","sharedPluginData":{"tokens":{"fill":"interactive.interactivePrimary010"}},"name":"interactive.interactivePrimary010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:73","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayTintBase010"}},"name":"overlay.overlayTintBase010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:74","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayTintBase020"}},"name":"overlay.overlayTintBase020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:75","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayTintBase030"}},"name":"overlay.overlayTintBase030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:76","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayTintBase040"}},"name":"overlay.overlayTintBase040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:77","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayTintInverse010"}},"name":"overlay.overlayTintInverse010"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:78","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayTintInverse020"}},"name":"overlay.overlayTintInverse020"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:79","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayTintInverse030"}},"name":"overlay.overlayTintInverse030"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:80","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayTintInverse040"}},"name":"overlay.overlayTintInverse040"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:81","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayGradientBaseVertical"}},"name":"overlay.overlayGradientBaseVertical"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:82","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayGradientBaseHorizontal"}},"name":"overlay.overlayGradientBaseHorizontal"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:83","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayGradientInverseVertical"}},"name":"overlay.overlayGradientInverseVertical"},{"config":{"simulateErrors":true,"isWithoutTimeout":false},"type":"RECTANGLE","id":"1:84","parent":"undefined","sharedPluginData":{"tokens":{"fill":"overlay.overlayGradientInverseHorizontal"}},"name":"overlay.overlayGradientInverseHorizontal"}]');

/***/ }),

/***/ "./benchmark/mocks/swapThemeMock.json":
/*!********************************************!*\
  !*** ./benchmark/mocks/swapThemeMock.json ***!
  \********************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"activeTheme":{"internal_themes_no_group":"9421816dcb557abb47ccea1e29bce5547d92a339"},"themes":[{"id":"e58f3d507a89146a641d800c5d6d3879d5fdf095","name":"LightMode","selectedTokenSets":{"Foundations":"enabled","Light":"enabled"},"$figmaStyleReferences":{"ink.inkBrand020":"S:233fa43534ecff6bd375f6c64db122cb5dc840ca,","ink.inkInformative":"S:c359cf844bbb917dd802827b8fb895f7575be4c0,","ink.inkNotice":"S:ef1ec2eefb95a35c40cddc539e1a401a01e5ea22,","ink.inkNegative":"S:21f6e1e572718632632f002ef530d8c8028c9a10,","ink.inkPositive":"S:c87c9b91569f062c792fc288ea7e73b467068391,","ink.inkDark010":"S:3c6e9332b3bd0f69f3319f5544a8841d9b34d161,","ink.inkLight010":"S:539cd9a63bda681b224486f1d79d27ae705d58cc,","ink.inkInverse":"S:4dfc6673b1cd0d25e3cbdd654b8f4b3c7aac8933,","ink.inkNonEssential":"S:a05fcdfdacd4c038b85258931872ad58bce3f0f9,","ink.inkSubtle":"S:f590bc22c1dcd0aead2fb2e5ef7674355561c488,","ink.inkBase":"S:2be40836666597b53f0ed973d453ce3b9f19ceea,","interface.interfaceSkeleton020":"S:a6cbe2e1c73bd762bb8c857ad1b0d321e98f8cdb,","interface.interfaceSkeleton010":"S:6fb460c3031fb3655c0bcefb300615181b61f810,","interface.interfaceNeutral020":"S:94910eed0463338e7f22baf339f6855893c2f71a,","interface.interfaceNeutral010":"S:60d41aa6cf92ee43a639f52882dcad39337fc353,","interface.interfaceInformative020":"S:afe1f89e86234a17b6f5d5c1682a714840fccf38,","interface.interfaceInformative010":"S:caa7aa433ac361f9be5ee6b9104f5998217a885e,","interface.interfaceNotice020":"S:7b15c4b4b20d8ec2c4e8d78fbf0a27f4758d208d,","interface.interfaceNotice010":"S:df1515c6fb0a570663b9306130ac705aba1c7d3a,","interface.interfaceNegative020":"S:1d9913543f0df6a8fa89ecd0cc62b1f5fb0572a1,","interface.interfaceNegative010":"S:266de1dddacb3c6fbf3cdce80881a188052b23bd,","interface.interfacePositive020":"S:d50f7f3d64e6b951de5c9c5bc10c208bf6613223,","interface.interfacePositive010":"S:05e8799c9a483b1165a5826646b873a8316b563d,","interface.interfaceBrand020":"S:90f00d481491e2b1a07f740490a0c1fe034daef3,","interface.interfaceBrand010":"S:77cf2f786930ca0981c3f47e86144dc17cabeb17,","interface.interface060":"S:8df701db2a5e6eeb81a884dcbd184a1750951f13,","interface.interface050":"S:d3901c2c1fdcf858506c2c83a56d290c821cd24e,","interface.interface040":"S:a7e6eb5c378d02c60ae99bd2a38d8ab270a1e825,","interface.interface030":"S:e085df2102109a3dc7df07f1790b0aab0e7b896c,","interface.interface020":"S:28236ad7a0a7200e99cffc8100e80e6acfea98c4,","interface.interface010":"S:e6bf048f621316851caffb8cd23f995df6d4fc31,","interface.interfaceBackground":"S:7f68a5d8f425fc4d18c4a9bdc74f9be70a594329,","interactive.interactiveInput050":"S:6640bf3861e1d858ba9605ff55d03f80baffeade,","interactive.interactiveInput040":"S:5ba23e67111f84f36a635bb7f37c5e6861ed2889,","interactive.interactiveInput030":"S:3289ad2c312f323a4e91e42ce805f6e69962fc8f,","interactive.interactiveInput020":"S:0e9cb7e2dfe81101245f643f0c85fd77c5c915fe,","interactive.interactiveInput010":"S:08edd3036bb2eb824124622e8875bb6fe0d11dbf,","interactive.interactiveFocus010":"S:f0afb0ea4e8d3b79bf82c0d987be3197f7821187,","interactive.interactiveVisited010":"S:d6a19574dcda950cbbece64bf6270c38f35fd864,","interactive.interactiveDisabled010":"S:775afe46b0bb20696c773810722b3c083e7ecb86,","interactive.interactiveLink030":"S:b2d290a75db8040842fbf9e5554eb5bc85e1220c,","interactive.interactiveLink020":"S:9255e43db6ef4974be7e087bc0cf0e52b02042ce,","interactive.interactiveLink010":"S:96e98d5972206f99bc924a5ac9c4281696a776cc,","interactive.interactiveInverse050":"S:dd5e9cf81456805f38ac97b4918b1643784e88b9,","interactive.interactiveInverse040":"S:e6845cf69e1c62c63266c7996547ac70246ba10d,","interactive.interactiveInverse030":"S:f01b8678928a21ff63d47c2a3e7f436044354f3d,","interactive.interactiveInverse020":"S:4155c7b4a21c0ffe8bd2f6eb11b7e4c996ef2520,","interactive.interactiveInverse010":"S:8a18c58c90ba1adc7920869d231b19b056ac433e,","interactive.interactiveNegative050":"S:24e88b03be17635af246213e393c5a67e0f8a75a,","interactive.interactiveNegative040":"S:da8a3f194165bfd2d05f4b8ef79ad56f95991bd3,","interactive.interactiveNegative030":"S:1f4db4273d157a4714ec2ff18c436b24b784f5f0,","interactive.interactiveNegative020":"S:c9a1a5def1d7a14fe15fa612e2ba0bb82a69bd5c,","interactive.interactiveNegative010":"S:969f9d63f01210ab12760f8bdb60345d7a4709fa,","interactive.interactivePositive050":"S:8c3a528cd550756f3d1b22aa432b85fbe6a54e28,","interactive.interactivePositive040":"S:82e9c90202f81c4c45e8d9d507367250795726c7,","interactive.interactivePositive030":"S:48f70e2179a4820132765887e20418109b4b8ec3,","interactive.interactivePositive020":"S:85bc34182de81ed8185b8ac3f4dcea7ac74b45bc,","interactive.interactivePositive010":"S:d8ef086da4ba672c7eee00354fcddbaa6f56b92a,","interactive.interactiveSecondary050":"S:9a6f613ffd9f9554a8a121523b1b2c60b134204c,","interactive.interactiveSecondary040":"S:35fba243ea705809a3b0bc107f322163c456fc17,","interactive.interactiveSecondary030":"S:2638457516ca8f47e183e9e8b0f1f0195af84df6,","interactive.interactiveSecondary020":"S:4ba1252875b4ea8e0479f10c034269d8227ada5f,","interactive.interactiveSecondary010":"S:844e5482952bb567fed83096fd29eba6eb8bc8a9,","interactive.interactivePrimary050":"S:cecc4159595a2ab8076be414e46f750163c7d47e,","interactive.interactivePrimary040":"S:944593208dc84d0e29785b1e5817d940645da607,","interactive.interactivePrimary030":"S:d420bc65d232de70f326580ec3578120eb582580,","interactive.interactivePrimary020":"S:02a75c336e799a0ba2ab08a56c39c38d712b9cdf,","interactive.interactivePrimary010":"S:ba8df69817f5042b37e75cb35e948715d3646e72,","editorial.editorialLabel030":"S:2607ea98e9293cb0583f6b3ee4ce2694aa758b59,","editorial.editorialLabel020":"S:c7ecf003e6e0711b683fc95bbb085ec78e0ff108,","editorial.editorialLabel010":"S:5a036e61b2457701db7fbadf83d7b8c6bce3856b,","editorial.editorialCaption010":"S:8c3bed69c89240a16ec922097747bad296f6ecc8,","editorial.editorialQuote020":"S:d24f340dccf391996f5d06aaba780497603db519,","editorial.editorialQuote010":"S:6e145bab239ef6ec9da43de3fbc5e575911404c1,","editorial.editorialParagraph030":"S:4b54b1fd755b8082a922e9a0a76c1ae529634958,","editorial.editorialParagraph020":"S:8ffbfd7c1f74bb2ce82b666d4fc40360e7b2d3cf,","editorial.editorialParagraph010":"S:820c8391b399b2d4797532355ac5c56858821706,","editorial.editorialSubheadline050":"S:9f057e7a4b52d4b1deb1891f308b24dbdc05c4f8,","editorial.editorialSubheadline040":"S:55531fc6b7ffe4b519c25791620cdbd015678322,","editorial.editorialSubheadline030":"S:3cf548b90ccf0dbebb84f1803d718de8b692987f,","editorial.editorialSubheadline020":"S:fff362b6aec0366187bf22c6eeba5b6e00de594c,","editorial.editorialSubheadline010":"S:43cb84eb95940fcd46975dc3084286fd51c39b92,","editorial.editorialHeadline080":"S:9a32fdc261c0489602ecf8c14b67b97bb657a958,","editorial.editorialHeadline070":"S:7e4359aa0389578efe1493138fe89ff7d5fc07b5,","editorial.editorialHeadline060":"S:ff42f099cf40f361d0831e4aaeefc26286fa4f97,","editorial.editorialHeadline050":"S:9ba5a986df40b8db461f85d0cd96778859c4d777,","editorial.editorialHeadline040":"S:450d60db1bbce53a13802d57ee17d2df45fe342b,","editorial.editorialHeadline030":"S:7e70bf9a91d0c35fc33ccce0a83394f16ceff0cc,","editorial.editorialHeadline020":"S:121336e44b1483a4ef31b2a83d6ab11ee19c8c48,","editorial.editorialHeadline010":"S:c744f1a709864f756ce8952546ba42e0414b2264,","editorial.editorialDisplay030":"S:a73e724af42b119291d1619ce914b11e076c0635,","editorial.editorialDisplay020":"S:578fbdca473abd2aa8f78871957747d4284b271e,","editorial.editorialDisplay010":"S:8accf4475515a2a5a14fed5fd573eab14446cb85,","utility.utilityMeta010":"S:6b23fd9516c55a40c1e783753579750289fe5aa2,","utility.utilityMeta020":"S:299027de48debf7a42482e5cb030a6c87bda47ab,","utility.utilityButton010":"S:d0126e4bb288b0408c8bc8a56d35fba4c44cd400,","utility.utilityButton020":"S:109ac49b2f9579302707da5e73e4c8bdc6ed8f9b,","utility.utilityButton030":"S:38b8ba766f74ba5d9159d9c3cefc734e723c6f8e,","utility.utilityLabel010":"S:c15c20b674a9f46217f5a954478db80d869a75bf,","utility.utilityLabel020":"S:9cd74383982596e42110918eed0f5e9c5952e2d1,","utility.utilityLabel030":"S:7102e2c67cd63b1bda0c8dbbe154c1a53991fafa,","utility.utilityBody010":"S:6d40023ab17f4f3cc74e8dbcdf0c9a6e5ca8adce,","utility.utilityBody020":"S:0a77c355f2e1b30108c9a2843f7ad0ac8648cbeb,","utility.utilityBody030":"S:f7e584c65375171412729d9ee8fc7b91846005d2,","utility.utilitySubheading010":"S:5b1b7a528878b2bac54e6392e9accc36b9c24e93,","utility.utilitySubheading020":"S:069e639a2fcec245581f61fd19eb3580f8156526,","utility.utilitySubheading030":"S:dbfcfa87414281bb0045542cd9bcec6e01525f06,","utility.utilitySubheading040":"S:474ec6455ce7becda4674039ec81e42ebe339986,","utility.utilitySubheading050":"S:d8549114c819beef0010e22a9aad6b2402082e72,","utility.utilityHeading010":"S:2a6ecde3d652bdc8945d038a2b29f8b476f3b7a8,","utility.utilityHeading020":"S:77b25a72c86fe857c49d7ea3bac5b4f55138608b,","utility.utilityHeading030":"S:202017e1d16f10dbee234a2e6a9c043bb69b91e1,","utility.utilityHeading040":"S:7f76326cb9314670b863df9c5223e39f8f9e4fa1,","utility.utilityHeading050":"S:3590aef56920b309d7cc67db318371dc6089255a,","shadow010":"S:18a3d13cb98217e579f63879db897a88eb28bc87,","shadow020":"S:72c312c3fae7a6586d713d437359f4bf946c479d,","shadow030":"S:c37faf1c1c3a88496f500d8a5dc719f5667a0716,","shadow040":"S:b9a740d88c3618b85b8c7772a5ceb55b0bad15c3,","shadow050":"S:bcb753804868698599b4469e69dce8396cf2b489,","shadow060":"S:ff99b871b215ad9ae2f50924366066708bd1c87c,","overlay.overlayTintBase010":"S:a26ef44e9e8a39dd7cd398b448edc02de9cea6e3,","overlay.overlayTintBase020":"S:001ba9d09c4032667e78f3cae4cd0577ab050c8d,","overlay.overlayTintBase030":"S:d5ad707226946f677569767cc45ec4cac823e4c6,","overlay.overlayTintBase040":"S:154f84b94684216732096bb15aef51c4ea0a34d6,","overlay.overlayTintInverse010":"S:48b9e86cbceea4dcec1254efd5da146280f8116a,","overlay.overlayTintInverse020":"S:d305cf2064701e85e3e0dd957d018eecdf4e256d,","overlay.overlayTintInverse030":"S:b62d0e7af099d673e4376f9f7badb37b85165458,","overlay.overlayTintInverse040":"S:ffa70458e718273620c1e5e048a0a12d4717f6bb,","overlay.overlayGradientBaseVertical":"S:1307bfcc8d96d69c9d594df89b1e83a0540b23ea,","overlay.overlayGradientBaseHorizontal":"S:63c9b7f19f25c87bc9cad22d5306a60756b4f33b,","overlay.overlayGradientInverseVertical":"S:d80e7e1e9984d81f35c48c4b53457ae1cd26e9ec,","overlay.overlayGradientInverseHorizontal":"S:75d995f485a35d3e2bf72094972bcd6a5bb957e9,","blue010":"S:9038a23d2c76fe827805fab7077cb99fc8f93945,","blue020":"S:d4525a0a71b8583a40e2b773670e70840703f95b,","blue030":"S:5395dea612d0d81664b5bfaa01cdc83a359052c9,","blue040":"S:0f8a5d5492ebfce0958c298ec6c2fabad3a16fec,","blue050":"S:d88d7d42fc5429d00d3ce70b05d18f0e3cdf4f8d,","blue060":"S:be1ab7544725439d2dbe1a6bd73ce0aa2fd37fee,","blue070":"S:fb58be1c1418a01a87ff0cf256befeb1103e231c,","blue080":"S:6f9782769dc2ab8e7e311b075cb1e15947856685,","blue090":"S:de5674567e6715e81c7fe99917d3bfcd86b5a2d0,","blue100":"S:21580af2216495a4e4d823f4d201968ef38a26c4,","green010":"S:e8ffaf6a57643626e0f4f2174294ecddd704f08e,","green020":"S:56282e60e8960d087d4c1bf336da40dfc4bfb3a6,","green030":"S:072eee3a7171fcdfa06761c8b1d4eaf6816dbb4a,","green040":"S:b6bccf64735e19a59c44620b65fc878ae51f3d7a,","green050":"S:c263513a2d4199e9ac58ac86376d5ac5f0026edd,","green060":"S:62ee12269997539cd245430e9546a96050f0c104,","green070":"S:e9367d2721e8c4e481515874125a59eca5e2dd38,","green080":"S:585a547372792275f6ce37923b5e2fbd6bea67c8,","green090":"S:f326444d8e10b07bc053582abe7e1793b695fca8,","green100":"S:d80bbe8b6930c8126d93ef8e5348e0f8e1d368ae,","red010":"S:2563eb12be75eb710377dc9f5b2985c0a3ad3f6d,","red020":"S:0d22b18f47c3208500175fe8ad83d3b6d41b7e1f,","red030":"S:35709dd4f716f2738cb3022f7c708b73539073f8,","red040":"S:3e559e74fec6242b8876269bd7c37f035ee8ef81,","red050":"S:4e0b048ed836324ad2ce8b498ed789eff8594207,","red060":"S:49a56c4c549aa0f0e47a0e5a0d6dc22a56aee914,","red070":"S:5ddea3945c77853447156badf81e6a3fda88fe07,","red080":"S:1b28e42ae9861f30998dacb767185c0262c83ab9,","red090":"S:6a6eded830500dd70730cf1e5814f54d7d8b584c,","red100":"S:e1af9bb2de78e36e8fa82a3a626729943c56d246,","amber010":"S:4e8ea437bf9fa601e8edc62e592299629f3be76a,","amber020":"S:40437745258726ff7fd15b906204e36a607a2272,","amber030":"S:29656574019795b92a91140f168c6ee56cc25832,","amber040":"S:b0c0e098f9bba6cdf794ba0c38d28698f4503bc8,","amber050":"S:5ee4ff2698909dfe44fa46e6178f38e6896f1a80,","amber060":"S:38ce7a1373e0f4ced88dfd096ff0bbb36d479a66,","amber070":"S:7c19d43a984d3a3ef3a5014d948186c32e5bf7bf,","amber080":"S:ff99a1f817683e59eb97f97b4f38940d3c2af737,","amber090":"S:1a46082f85e13e475a827e1860b464d8c8395da8,","amber100":"S:6d407a96be078cc84c62084b22e0510dca263f5f,","teal010":"S:99bdf0941ab4028df4d31145921a8d9788973dbc,","teal020":"S:88f793727ffbc85f8bc223e5863f696625051072,","teal030":"S:5ab7851bb2891074900c46dce7273456f6944076,","teal040":"S:64c78d55790a0ddbd2cbbc31bbf9c1a39305f9d4,","teal050":"S:96560e902fb6ec25512dd9ec8b3f822b7cf33c33,","teal060":"S:3fe39dbfab098fa402ee60a029fdaad2241c22b2,","teal070":"S:0bfff2f24a03ba743ac93563031ac2aaa7ffc1bf,","teal080":"S:14c43cf12ca21dc40c31d15eb72bf6b25f45fbd2,","teal090":"S:c144ed8d2ad427d9e7d67dd3e0fe857a80146771,","teal100":"S:5167bfd3d20a3f73427982f043566174761e4fdb,","purple010":"S:b6c543a30be09b0e525e2efd7b4903ba2b0cb880,","purple020":"S:6ebcfc6099ffc6dfc572c8d8559b6e215cb9f38e,","purple030":"S:dd8f089f51c5cdd6250cdf58a503a7d383dbde6a,","purple040":"S:d664b7bdb29c206c43a099577bc518102a88a440,","purple050":"S:5f93b200c3774c607c4af35dcbcc80dc452dc7a4,","purple060":"S:f0bb0f6897cbc81b3e051a9f691e60fd6e14c4fc,","purple070":"S:c0f069ef81653eee5f7ab408b27e5eb4c2cd6aa1,","purple080":"S:c86fef4ed68e81a2502bc9629751777600cf12d9,","purple090":"S:98ff85cae68c29216ad8880e6348e916f322b1b2,","purple100":"S:2668c8f46f07169556604e8c51d24537394baa0b,","neutral010":"S:a67af927b3c1187b9808d3bc20dad46e86b317a9,","neutral020":"S:727101ea003d45d56d0c7c2ba672f366168285a5,","neutral030":"S:794f2dd8af4178a2c90556eb4b17ea3b9f52e2d6,","neutral040":"S:9c0cb0a9c4d907f7255cea3e6d75e993f46eca78,","neutral050":"S:8402071d4c7fb7c1d36363b9f653bf4f878cec66,","neutral060":"S:08023aa91f1d8814425d87b4e94c186c4c9cbd6b,","neutral070":"S:a74e5b7fbe8e6e62f9c5d7bb0126d892525eb257,","neutral080":"S:0e925734ce6e45fca4592df29ffac2705fb96024,","neutral090":"S:9cd031a7cac309afb1017515f6a752f539be2ca0,","neutral100":"S:5410e7f8c78d6015be2da8c50a9bb8f944d8c54c,","focus010":"S:5e49baf86d2d747330b858674a2cdd7ea6010264,","blackTint010":"S:6b15a5a9969166831c23779b1f03a027d61117fe,","blackTint020":"S:d786365ed8ef0942b8ac434fc79ad5c70a41a6be,","blackTint030":"S:68186e768245eb69a69cde31b08b27886f6d5518,","blackTint040":"S:b7a25f6c31c9d7b479ad397a4d2867465ae3cd11,","blackTint050":"S:8af16ea5d7ae9379f4f7ee3a9823f1d1c6d13c08,","blackTint060":"S:24d9ca605e8eb57ee0a4875c649d2f04701eefbe,","blackTint070":"S:c164b0bfc900bd315625172014c5e09d81ab12b5,","blackTint080":"S:58e7cd21f6d14f6425ec5bff656432786d998a76,","blackTint090":"S:68576f6389f3a22a227e8b28f947e526c17922e4,","black":"S:7b8cd41db4d5300b1c340b4bffaa4d656ef4fd0e,","whiteTint010":"S:0d9011434ad6664eae5804128be604aac149c0d1,","whiteTint020":"S:c179699ba29aca532c197b717afd747ebe29f9ff,","whiteTint030":"S:4331211e452a6ce2295feaf34d01e799cc84b81c,","whiteTint040":"S:cde16a7e8a116dc45679c918273b88d798695485,","whiteTint050":"S:82408c81973e819064497be7b8ddce2cd79fa4f2,","whiteTint060":"S:0bfec72e65d8a0a3903bbdc9bdfc6fc675604660,","whiteTint070":"S:00a39f5c3c7d34a3aa260e20940490cc7d0680a4,","whiteTint080":"S:093e260b3b467044e663cac90a8d9e12b002f98f,","whiteTint090":"S:d8b83d208aeb4db08ff101b3db003cc113b718f1,","white":"S:92247bf2258345dfb916f507f2745e32badfaf1e,","Reddit":"S:6205422d8482cb0d8ef8d4e8750269b571754bd4,","Whatsapp":"S:f00a1a6768fcb797a1359fc38307370025caa112,","Youtube":"S:2016817db038f98d5a1eba8149466103c011faa0,","Instagram":"S:ed777eb1bb99199bedd1ca1b4c8937a386984fc1,","Facebook":"S:0407f9c4df392d4efef5e5473d5aa52eccaf2963,","Twitter":"S:cd3dfbd130acac1c3e617b3d6e7d6bcfbe90a6d3,","Github":"S:21ac712499b7f0a659961ae70847c8f3381f2ec6,","Apple":"S:e65c6b432c774cdc6bddc9002c1a1ca99e11b04d,","GoogleBlue":"S:95ace415373f1b77223f9336bd3cf42c4b29ae5a,","GoogleRed":"S:ea698b75c38f1e2088b9192112c5622175de64fd,","GoogleYellow":"S:8229fb6a6385a2c2e48a11428777e3ffa8745b77,","GoogleGreen":"S:8ce4af833f651283bef9dffadc45a0bbd07100e8,","transparent":"S:8ea5fdda0d8f17fa3267acd185a89250f5903abb,","ink.inkBrand010":"S:1d7b6c810eb4fa3054b84064d9a5bcc80fad381b,","ink.inkContrast":"S:21bc6af60ca152d1ee0c70af96b02f8ba47462b9,"}},{"id":"9421816dcb557abb47ccea1e29bce5547d92a339","name":"DarkMode","selectedTokenSets":{"Foundations":"enabled","Dark":"enabled"},"$figmaStyleReferences":{"ink.inkBrand020":"S:91e838b5d6a7d4bb810ed282f216122756c89de5,","ink.inkInformative":"S:1c0844575e294573c09ae7f712905ee1f707c311,","ink.inkNotice":"S:bbf157c6a33d70b09b56f2664b681643aacb8b56,","ink.inkNegative":"S:a3d3de527fb4b1e953a5238c56023b7b76dc6e5c,","ink.inkPositive":"S:0f2ecc5225e4089b687d13453c02476eb8d27030,","ink.inkDark010":"S:bc804931e98530f92c399b89eb6042f7099148b6,","ink.inkLight010":"S:1f6b63d6c6d9bcdb726922d73a6ef85ec399ce68,","ink.inkInverse":"S:824400ace7c448098558d9291cb8fc4b5235be90,","ink.inkNonEssential":"S:f5c89d26c7c4140a8393854c63ec04a649ae8c32,","ink.inkSubtle":"S:f493667b2040a54021b9abf7eceec33ff7de90ee,","ink.inkBase":"S:3ff3d984378f866312615da9678660ea9d638882,","interface.interfaceSkeleton020":"S:04ea8d137ec785a40c292933e59bf0e036568f70,","interface.interfaceSkeleton010":"S:8f666ed01edb322c0234d4059b2b1ea5550ba9a4,","interface.interfaceNeutral020":"S:9cd3d885fd5ab5cb60a286b2d7376d1a3b9521f2,","interface.interfaceNeutral010":"S:50dcb6881152be663fbb05462b0e54e5dcdd1c7a,","interface.interfaceInformative020":"S:5a8b4a52184e35268b32e2a47c701780adcf26cc,","interface.interfaceInformative010":"S:608f179b3f5fe14c1fea2b919be9eddaa546a983,","interface.interfaceNotice020":"S:95597390f6e916a57d42ea4062a8ed6cacca873c,","interface.interfaceNotice010":"S:cb7e4928fd585ab8936e12c2050ab025a4ff5a59,","interface.interfaceNegative020":"S:d6d9c6ca4f8e0ec265d345c370dd1afb8c667bdf,","interface.interfaceNegative010":"S:a9e37635e3a07506ca67c4bc5ed0f52d74fa7e98,","interface.interfacePositive020":"S:44f2249a44c9b4804af3ed8b7540d32a29c44b1e,","interface.interfacePositive010":"S:0a3b0c5edfb3fecf32e770f0cb6ca1e03df3c58c,","interface.interfaceBrand020":"S:9c45ea898fc0c227e460f02a15cc2b4aa5977beb,","interface.interfaceBrand010":"S:cc027b6025b0477d378c21526ae8f65582b96ce6,","interface.interface060":"S:35e57eed6e4cd080adb78fe3c12f42f7ebd855eb,","interface.interface050":"S:6dcfc7a54838e8650ebfd1801af4efc4c133c05f,","interface.interface040":"S:726fd413d1a2190023d037c6b6a3f9f489d61fb5,","interface.interface030":"S:cf52a0228c21c532963ef1a2d061a6ef2d86f189,","interface.interface020":"S:559c792038eb28704d074966a04539fcd41e4678,","interface.interface010":"S:d4c28755609eef2606c6677d9386393280d29bbd,","interface.interfaceBackground":"S:cd5cdace1cabfb6b4dcfc2f55a9f8ebe3f2bde00,","interactive.interactiveInput050":"S:04d3f13448e84550353a8e49dd3e485a45fc9a28,","interactive.interactiveInput040":"S:76b1c9c9b7ae1bd7f585cddcfde31ce3cbea2411,","interactive.interactiveInput030":"S:d7ca03cd72cd720fb7ce62fbdf769bc55e77dace,","interactive.interactiveInput020":"S:a17a3a3dd262db4820b784de1a8f157fe9932f09,","interactive.interactiveInput010":"S:3962f61afa8aef025b97fc409e71b338c30a08c5,","interactive.interactiveFocus010":"S:a4cb8fbb3f4fc2af19cd008ec767e9f3997ed983,","interactive.interactiveVisited010":"S:d7776fcade5d838e825124711bd65a9005300efa,","interactive.interactiveDisabled010":"S:7b1e504d8774794edc15cd68cab5ac9d3af2ec5d,","interactive.interactiveLink030":"S:9f2fa66dcdc26f53c0fb4f9e4b484ac4adfb25d6,","interactive.interactiveLink020":"S:c9351bf53cab63d3bbd1eb8278dba32fba2fa3e3,","interactive.interactiveLink010":"S:7a9ad3b82f6d17b96b3252f4a47cdc12d600352e,","interactive.interactiveInverse050":"S:63bf25375f0076d46befe9fe640de4238695c8ce,","interactive.interactiveInverse040":"S:43fc709f645fc2bffa8ee942ab20cb58d87532c6,","interactive.interactiveInverse030":"S:6c9ef47895a8352e741c25567b64c9a3abdef193,","interactive.interactiveInverse020":"S:3d2a8b89e6341165ebb082c13bb77201ce7560e1,","interactive.interactiveInverse010":"S:701a633423dd76df170147e1de062e341f37c36a,","interactive.interactiveNegative050":"S:76b1b4627957193c73f97a19696e99ccce5ff045,","interactive.interactiveNegative040":"S:6506cfbb1fb17111090d767ca93b195f5edf39de,","interactive.interactiveNegative030":"S:e2dbdf8db573605d60f7a9de41e2fdd0557fb000,","interactive.interactiveNegative020":"S:c0c0f76d02e042433df765b3bc9dd0aba6f1a514,","interactive.interactiveNegative010":"S:b17aa005f7f7b77cdc79266c2b71b494bba01a52,","interactive.interactivePositive050":"S:e98a2796343386486a3d992021633e53d4ca2706,","interactive.interactivePositive040":"S:1313c40d17419e021296666d7f21f9ced1031953,","interactive.interactivePositive030":"S:22efe190b60726c2775fe56c2e4cc572e41a7956,","interactive.interactivePositive020":"S:ce48b7accf28c3327b7a51e7ff24130f80bdf83e,","interactive.interactivePositive010":"S:f34e122df0f70e0655c95a69604f4d5c67969ea8,","interactive.interactiveSecondary050":"S:0c333cc10f32893bf47565302a2bed6bc73cf98f,","interactive.interactiveSecondary040":"S:c1d50b6e3d82e0d053681d7316e3f760b74bed5f,","interactive.interactiveSecondary030":"S:0760eac06fb73ccf87cd44146065c7008697a3a3,","interactive.interactiveSecondary020":"S:61c88660049c2765e2e791affd2b13ec3e17002b,","interactive.interactiveSecondary010":"S:4f966ee781c21a1e7a6b65d7d3d57baa86819b7b,","interactive.interactivePrimary050":"S:897cc16e2cb620f8afa83976622a8f98e3d8343c,","interactive.interactivePrimary040":"S:253e57bdbb62fd32c383d09c7f45de0559dcda85,","interactive.interactivePrimary030":"S:335cac2ebea9d9a2cd1de3ac0bc019b974808443,","interactive.interactivePrimary020":"S:d67b68638ffa3b8ff5f0709007c7271d40346580,","interactive.interactivePrimary010":"S:bd208fb83dd40939cdca5a9d5b774b48657c10cb,","overlay.overlayTintBase010":"S:44e9ca833ca01f2a1c368d3db9ce740407e8eb0a,","overlay.overlayTintBase020":"S:6261edcc5e2ab7f69d8a4df552b9cbc74033a1e5,","overlay.overlayTintBase030":"S:9c2f268618b0e826d6c090c82e4a41c9eaf5e279,","overlay.overlayTintBase040":"S:c79dec66c3b30f29ea6025e7426858b74c40ebc2,","overlay.overlayTintInverse010":"S:3516bd11a567c747d15619cd524581a2cbe57e95,","overlay.overlayTintInverse020":"S:2dafa361793c9169344fd1d72db4b4722cb61190,","overlay.overlayTintInverse030":"S:302ed47ac46bb1b223bdfeb2a4acbf65a854bac0,","overlay.overlayTintInverse040":"S:5b0379043095b48eb566bf8b78d95db084edbb6b,","overlay.overlayGradientBaseVertical":"S:0e6d1caeadc192a3c1d39cc6044e0891b12d30f9,","overlay.overlayGradientBaseHorizontal":"S:dc93f2902fe454eb3a33d76a7bb311abbb8fc318,","overlay.overlayGradientInverseVertical":"S:d29faf8cc83cc871fea03920b6bc0d3be1f24dee,","overlay.overlayGradientInverseHorizontal":"S:90b072b9b251d3898fe1f3022eca272387d94ce9,","ink.inkBrand010":"S:021b1cd54db0cc7faed5b6109cc282f40a1f3674,","editorial.editorialDisplay010":"S:8accf4475515a2a5a14fed5fd573eab14446cb85,","editorial.editorialDisplay020":"S:578fbdca473abd2aa8f78871957747d4284b271e,","editorial.editorialDisplay030":"S:a73e724af42b119291d1619ce914b11e076c0635,","editorial.editorialHeadline010":"S:c744f1a709864f756ce8952546ba42e0414b2264,","editorial.editorialHeadline020":"S:121336e44b1483a4ef31b2a83d6ab11ee19c8c48,","editorial.editorialHeadline030":"S:7e70bf9a91d0c35fc33ccce0a83394f16ceff0cc,","editorial.editorialHeadline040":"S:450d60db1bbce53a13802d57ee17d2df45fe342b,","editorial.editorialHeadline050":"S:9ba5a986df40b8db461f85d0cd96778859c4d777,","editorial.editorialHeadline060":"S:ff42f099cf40f361d0831e4aaeefc26286fa4f97,","editorial.editorialHeadline070":"S:7e4359aa0389578efe1493138fe89ff7d5fc07b5,","editorial.editorialHeadline080":"S:9a32fdc261c0489602ecf8c14b67b97bb657a958,","editorial.editorialSubheadline010":"S:43cb84eb95940fcd46975dc3084286fd51c39b92,","editorial.editorialSubheadline020":"S:fff362b6aec0366187bf22c6eeba5b6e00de594c,","editorial.editorialSubheadline030":"S:3cf548b90ccf0dbebb84f1803d718de8b692987f,","editorial.editorialSubheadline040":"S:55531fc6b7ffe4b519c25791620cdbd015678322,","editorial.editorialSubheadline050":"S:9f057e7a4b52d4b1deb1891f308b24dbdc05c4f8,","editorial.editorialParagraph010":"S:820c8391b399b2d4797532355ac5c56858821706,","editorial.editorialParagraph020":"S:8ffbfd7c1f74bb2ce82b666d4fc40360e7b2d3cf,","editorial.editorialParagraph030":"S:4b54b1fd755b8082a922e9a0a76c1ae529634958,","editorial.editorialQuote010":"S:6e145bab239ef6ec9da43de3fbc5e575911404c1,","editorial.editorialQuote020":"S:d24f340dccf391996f5d06aaba780497603db519,","editorial.editorialCaption010":"S:8c3bed69c89240a16ec922097747bad296f6ecc8,","editorial.editorialLabel010":"S:5a036e61b2457701db7fbadf83d7b8c6bce3856b,","editorial.editorialLabel020":"S:c7ecf003e6e0711b683fc95bbb085ec78e0ff108,","editorial.editorialLabel030":"S:2607ea98e9293cb0583f6b3ee4ce2694aa758b59,","utility.utilityHeading010":"S:2a6ecde3d652bdc8945d038a2b29f8b476f3b7a8,","utility.utilityHeading020":"S:77b25a72c86fe857c49d7ea3bac5b4f55138608b,","utility.utilityHeading030":"S:202017e1d16f10dbee234a2e6a9c043bb69b91e1,","utility.utilityHeading040":"S:7f76326cb9314670b863df9c5223e39f8f9e4fa1,","utility.utilityHeading050":"S:3590aef56920b309d7cc67db318371dc6089255a,","utility.utilitySubheading010":"S:5b1b7a528878b2bac54e6392e9accc36b9c24e93,","utility.utilitySubheading020":"S:069e639a2fcec245581f61fd19eb3580f8156526,","utility.utilitySubheading030":"S:dbfcfa87414281bb0045542cd9bcec6e01525f06,","utility.utilitySubheading040":"S:474ec6455ce7becda4674039ec81e42ebe339986,","utility.utilitySubheading050":"S:d8549114c819beef0010e22a9aad6b2402082e72,","utility.utilityBody010":"S:6d40023ab17f4f3cc74e8dbcdf0c9a6e5ca8adce,","utility.utilityBody020":"S:0a77c355f2e1b30108c9a2843f7ad0ac8648cbeb,","utility.utilityBody030":"S:f7e584c65375171412729d9ee8fc7b91846005d2,","utility.utilityLabel010":"S:c15c20b674a9f46217f5a954478db80d869a75bf,","utility.utilityLabel020":"S:9cd74383982596e42110918eed0f5e9c5952e2d1,","utility.utilityLabel030":"S:7102e2c67cd63b1bda0c8dbbe154c1a53991fafa,","utility.utilityButton010":"S:d0126e4bb288b0408c8bc8a56d35fba4c44cd400,","utility.utilityButton020":"S:109ac49b2f9579302707da5e73e4c8bdc6ed8f9b,","utility.utilityButton030":"S:38b8ba766f74ba5d9159d9c3cefc734e723c6f8e,","utility.utilityMeta010":"S:6b23fd9516c55a40c1e783753579750289fe5aa2,","utility.utilityMeta020":"S:299027de48debf7a42482e5cb030a6c87bda47ab,","shadow010":"S:18a3d13cb98217e579f63879db897a88eb28bc87,","shadow020":"S:72c312c3fae7a6586d713d437359f4bf946c479d,","shadow030":"S:c37faf1c1c3a88496f500d8a5dc719f5667a0716,","shadow040":"S:b9a740d88c3618b85b8c7772a5ceb55b0bad15c3,","shadow050":"S:bcb753804868698599b4469e69dce8396cf2b489,","shadow060":"S:ff99b871b215ad9ae2f50924366066708bd1c87c,","ink.inkContrast":"S:f8dcb58bc0d6d76dfbcefb462e5e5f6c67ef6625,","blue010":"S:9038a23d2c76fe827805fab7077cb99fc8f93945,","blue020":"S:d4525a0a71b8583a40e2b773670e70840703f95b,","blue030":"S:5395dea612d0d81664b5bfaa01cdc83a359052c9,","blue040":"S:0f8a5d5492ebfce0958c298ec6c2fabad3a16fec,","blue050":"S:d88d7d42fc5429d00d3ce70b05d18f0e3cdf4f8d,","blue060":"S:be1ab7544725439d2dbe1a6bd73ce0aa2fd37fee,","blue070":"S:fb58be1c1418a01a87ff0cf256befeb1103e231c,","blue080":"S:6f9782769dc2ab8e7e311b075cb1e15947856685,","blue090":"S:de5674567e6715e81c7fe99917d3bfcd86b5a2d0,","blue100":"S:21580af2216495a4e4d823f4d201968ef38a26c4,","green010":"S:e8ffaf6a57643626e0f4f2174294ecddd704f08e,","green020":"S:56282e60e8960d087d4c1bf336da40dfc4bfb3a6,","green030":"S:072eee3a7171fcdfa06761c8b1d4eaf6816dbb4a,","green040":"S:b6bccf64735e19a59c44620b65fc878ae51f3d7a,","green050":"S:c263513a2d4199e9ac58ac86376d5ac5f0026edd,","green060":"S:62ee12269997539cd245430e9546a96050f0c104,","green070":"S:e9367d2721e8c4e481515874125a59eca5e2dd38,","green080":"S:585a547372792275f6ce37923b5e2fbd6bea67c8,","green090":"S:f326444d8e10b07bc053582abe7e1793b695fca8,","green100":"S:d80bbe8b6930c8126d93ef8e5348e0f8e1d368ae,","red010":"S:2563eb12be75eb710377dc9f5b2985c0a3ad3f6d,","red020":"S:0d22b18f47c3208500175fe8ad83d3b6d41b7e1f,","red030":"S:35709dd4f716f2738cb3022f7c708b73539073f8,","red040":"S:3e559e74fec6242b8876269bd7c37f035ee8ef81,","red050":"S:4e0b048ed836324ad2ce8b498ed789eff8594207,","red060":"S:49a56c4c549aa0f0e47a0e5a0d6dc22a56aee914,","red070":"S:5ddea3945c77853447156badf81e6a3fda88fe07,","red080":"S:1b28e42ae9861f30998dacb767185c0262c83ab9,","red090":"S:6a6eded830500dd70730cf1e5814f54d7d8b584c,","red100":"S:e1af9bb2de78e36e8fa82a3a626729943c56d246,","amber010":"S:4e8ea437bf9fa601e8edc62e592299629f3be76a,","amber020":"S:40437745258726ff7fd15b906204e36a607a2272,","amber030":"S:29656574019795b92a91140f168c6ee56cc25832,","amber040":"S:b0c0e098f9bba6cdf794ba0c38d28698f4503bc8,","amber050":"S:5ee4ff2698909dfe44fa46e6178f38e6896f1a80,","amber060":"S:38ce7a1373e0f4ced88dfd096ff0bbb36d479a66,","amber070":"S:7c19d43a984d3a3ef3a5014d948186c32e5bf7bf,","amber080":"S:ff99a1f817683e59eb97f97b4f38940d3c2af737,","amber090":"S:1a46082f85e13e475a827e1860b464d8c8395da8,","amber100":"S:6d407a96be078cc84c62084b22e0510dca263f5f,","teal010":"S:99bdf0941ab4028df4d31145921a8d9788973dbc,","teal020":"S:88f793727ffbc85f8bc223e5863f696625051072,","teal030":"S:5ab7851bb2891074900c46dce7273456f6944076,","teal040":"S:64c78d55790a0ddbd2cbbc31bbf9c1a39305f9d4,","teal050":"S:96560e902fb6ec25512dd9ec8b3f822b7cf33c33,","teal060":"S:3fe39dbfab098fa402ee60a029fdaad2241c22b2,","teal070":"S:0bfff2f24a03ba743ac93563031ac2aaa7ffc1bf,","teal080":"S:14c43cf12ca21dc40c31d15eb72bf6b25f45fbd2,","teal090":"S:c144ed8d2ad427d9e7d67dd3e0fe857a80146771,","teal100":"S:5167bfd3d20a3f73427982f043566174761e4fdb,","purple010":"S:b6c543a30be09b0e525e2efd7b4903ba2b0cb880,","purple020":"S:6ebcfc6099ffc6dfc572c8d8559b6e215cb9f38e,","purple030":"S:dd8f089f51c5cdd6250cdf58a503a7d383dbde6a,","purple040":"S:d664b7bdb29c206c43a099577bc518102a88a440,","purple050":"S:5f93b200c3774c607c4af35dcbcc80dc452dc7a4,","purple060":"S:f0bb0f6897cbc81b3e051a9f691e60fd6e14c4fc,","purple070":"S:c0f069ef81653eee5f7ab408b27e5eb4c2cd6aa1,","purple080":"S:c86fef4ed68e81a2502bc9629751777600cf12d9,","purple090":"S:98ff85cae68c29216ad8880e6348e916f322b1b2,","purple100":"S:2668c8f46f07169556604e8c51d24537394baa0b,","neutral010":"S:a67af927b3c1187b9808d3bc20dad46e86b317a9,","neutral020":"S:727101ea003d45d56d0c7c2ba672f366168285a5,","neutral030":"S:794f2dd8af4178a2c90556eb4b17ea3b9f52e2d6,","neutral040":"S:9c0cb0a9c4d907f7255cea3e6d75e993f46eca78,","neutral050":"S:8402071d4c7fb7c1d36363b9f653bf4f878cec66,","neutral060":"S:08023aa91f1d8814425d87b4e94c186c4c9cbd6b,","neutral070":"S:a74e5b7fbe8e6e62f9c5d7bb0126d892525eb257,","neutral080":"S:0e925734ce6e45fca4592df29ffac2705fb96024,","neutral090":"S:9cd031a7cac309afb1017515f6a752f539be2ca0,","neutral100":"S:5410e7f8c78d6015be2da8c50a9bb8f944d8c54c,","focus010":"S:5e49baf86d2d747330b858674a2cdd7ea6010264,","blackTint010":"S:6b15a5a9969166831c23779b1f03a027d61117fe,","blackTint020":"S:d786365ed8ef0942b8ac434fc79ad5c70a41a6be,","blackTint030":"S:68186e768245eb69a69cde31b08b27886f6d5518,","blackTint040":"S:b7a25f6c31c9d7b479ad397a4d2867465ae3cd11,","blackTint050":"S:8af16ea5d7ae9379f4f7ee3a9823f1d1c6d13c08,","blackTint060":"S:24d9ca605e8eb57ee0a4875c649d2f04701eefbe,","blackTint070":"S:c164b0bfc900bd315625172014c5e09d81ab12b5,","blackTint080":"S:58e7cd21f6d14f6425ec5bff656432786d998a76,","blackTint090":"S:68576f6389f3a22a227e8b28f947e526c17922e4,","black":"S:7b8cd41db4d5300b1c340b4bffaa4d656ef4fd0e,","whiteTint010":"S:0d9011434ad6664eae5804128be604aac149c0d1,","whiteTint020":"S:c179699ba29aca532c197b717afd747ebe29f9ff,","whiteTint030":"S:4331211e452a6ce2295feaf34d01e799cc84b81c,","whiteTint040":"S:cde16a7e8a116dc45679c918273b88d798695485,","whiteTint050":"S:82408c81973e819064497be7b8ddce2cd79fa4f2,","whiteTint060":"S:0bfec72e65d8a0a3903bbdc9bdfc6fc675604660,","whiteTint070":"S:00a39f5c3c7d34a3aa260e20940490cc7d0680a4,","whiteTint080":"S:093e260b3b467044e663cac90a8d9e12b002f98f,","whiteTint090":"S:d8b83d208aeb4db08ff101b3db003cc113b718f1,","white":"S:92247bf2258345dfb916f507f2745e32badfaf1e,","Reddit":"S:6205422d8482cb0d8ef8d4e8750269b571754bd4,","Whatsapp":"S:f00a1a6768fcb797a1359fc38307370025caa112,","Youtube":"S:2016817db038f98d5a1eba8149466103c011faa0,","Instagram":"S:ed777eb1bb99199bedd1ca1b4c8937a386984fc1,","Facebook":"S:0407f9c4df392d4efef5e5473d5aa52eccaf2963,","Twitter":"S:cd3dfbd130acac1c3e617b3d6e7d6bcfbe90a6d3,","Github":"S:21ac712499b7f0a659961ae70847c8f3381f2ec6,","Apple":"S:e65c6b432c774cdc6bddc9002c1a1ca99e11b04d,","GoogleBlue":"S:95ace415373f1b77223f9336bd3cf42c4b29ae5a,","GoogleRed":"S:ea698b75c38f1e2088b9192112c5622175de64fd,","GoogleYellow":"S:8229fb6a6385a2c2e48a11428777e3ffa8745b77,","GoogleGreen":"S:8ce4af833f651283bef9dffadc45a0bbd07100e8,","transparent":"S:8ea5fdda0d8f17fa3267acd185a89250f5903abb,"}}],"tokenValues":{"Foundations":[{"value":"#ecf1ff","type":"color","name":"blue010"},{"value":"#d5e0fc","type":"color","name":"blue020"},{"value":"#aebfff","type":"color","name":"blue030"},{"value":"#8ba6f6","type":"color","name":"blue040"},{"value":"#708de9","type":"color","name":"blue050"},{"value":"#3358cc","type":"color","name":"blue060"},{"value":"#254cac","type":"color","name":"blue070"},{"value":"#12387a","type":"color","name":"blue080"},{"value":"#03264d","type":"color","name":"blue090"},{"value":"#060f2c","type":"color","name":"blue100"},{"value":"#e5f4ea","type":"color","name":"green010"},{"value":"#c8e4d0","type":"color","name":"green020"},{"value":"#95caa3","type":"color","name":"green030"},{"value":"#6db681","type":"color","name":"green040"},{"value":"#41a05b","type":"color","name":"green050"},{"value":"#007b22","type":"color","name":"green060"},{"value":"#00601a","type":"color","name":"green070"},{"value":"#004514","type":"color","name":"green080"},{"value":"#002d0d","type":"color","name":"green090"},{"value":"#001506","type":"color","name":"green100"},{"value":"#feecec","type":"color","name":"red010"},{"value":"#fed8d8","type":"color","name":"red020"},{"value":"#feb3b3","type":"color","name":"red030"},{"value":"#fe8888","type":"color","name":"red040"},{"value":"#fb5959","type":"color","name":"red050"},{"value":"#d60000","type":"color","name":"red060"},{"value":"#a90000","type":"color","name":"red070"},{"value":"#7d0000","type":"color","name":"red080"},{"value":"#550000","type":"color","name":"red090"},{"value":"#2d0000","type":"color","name":"red100"},{"value":"#ffede1","type":"color","name":"amber010"},{"value":"#fddcc6","type":"color","name":"amber020"},{"value":"#feb788","type":"color","name":"amber030"},{"value":"#f79247","type":"color","name":"amber040"},{"value":"#cd6900","type":"color","name":"amber050"},{"value":"#a75500","type":"color","name":"amber060"},{"value":"#804200","type":"color","name":"amber070"},{"value":"#5d2f00","type":"color","name":"amber080"},{"value":"#3c1f00","type":"color","name":"amber090"},{"value":"#1d0d02","type":"color","name":"amber100"},{"value":"#e6f4f6","type":"color","name":"teal010"},{"value":"#c7e7ea","type":"color","name":"teal020"},{"value":"#97d0d6","type":"color","name":"teal030"},{"value":"#5eb8c0","type":"color","name":"teal040"},{"value":"#289fab","type":"color","name":"teal050"},{"value":"#017582","type":"color","name":"teal060"},{"value":"#005b65","type":"color","name":"teal070"},{"value":"#004249","type":"color","name":"teal080"},{"value":"#002b30","type":"color","name":"teal090"},{"value":"#001314","type":"color","name":"teal100"},{"value":"#eff0ff","type":"color","name":"purple010"},{"value":"#dfe0fe","type":"color","name":"purple020"},{"value":"#c0c2fc","type":"color","name":"purple030"},{"value":"#a3a3fb","type":"color","name":"purple040"},{"value":"#8883f6","type":"color","name":"purple050"},{"value":"#6454e3","type":"color","name":"purple060"},{"value":"#4c33cc","type":"color","name":"purple070"},{"value":"#37239c","type":"color","name":"purple080"},{"value":"#231668","type":"color","name":"purple090"},{"value":"#0f0936","type":"color","name":"purple100"},{"value":"#f1f1f1","type":"color","name":"neutral010"},{"value":"#e2e2e2","type":"color","name":"neutral020"},{"value":"#c6c6c6","type":"color","name":"neutral030"},{"value":"#ababab","type":"color","name":"neutral040"},{"value":"#919191","type":"color","name":"neutral050"},{"value":"#6a6a6a","type":"color","name":"neutral060"},{"value":"#525252","type":"color","name":"neutral070"},{"value":"#3b3b3b","type":"color","name":"neutral080"},{"value":"#262626","type":"color","name":"neutral090"},{"value":"#111111","type":"color","name":"neutral100"},{"value":"#3768fb","type":"color","name":"focus010"},{"value":"#0000001a","type":"color","name":"blackTint010"},{"value":"#00000033","type":"color","name":"blackTint020"},{"value":"#0000004d","type":"color","name":"blackTint030"},{"value":"#00000066","type":"color","name":"blackTint040"},{"value":"#00000080","type":"color","name":"blackTint050"},{"value":"#00000099","type":"color","name":"blackTint060"},{"value":"#000000b3","type":"color","name":"blackTint070"},{"value":"#000000cc","type":"color","name":"blackTint080"},{"value":"#000000e6","type":"color","name":"blackTint090"},{"value":"#111111","type":"color","name":"black"},{"value":"#ffffff1a","type":"color","name":"whiteTint010"},{"value":"#ffffff33","type":"color","name":"whiteTint020"},{"value":"#ffffff4d","type":"color","name":"whiteTint030"},{"value":"#ffffff66","type":"color","name":"whiteTint040"},{"value":"#ffffff80","type":"color","name":"whiteTint050"},{"value":"#ffffff99","type":"color","name":"whiteTint060"},{"value":"#ffffffb3","type":"color","name":"whiteTint070"},{"value":"#ffffffcc","type":"color","name":"whiteTint080"},{"value":"#ffffffe6","type":"color","name":"whiteTint090"},{"value":"#ffffff","type":"color","name":"white"},{"value":"#FF4500","type":"color","name":"Reddit"},{"value":"#25d366","type":"color","name":"Whatsapp"},{"value":"#ff0000","type":"color","name":"Youtube"},{"value":"#c32aa3","type":"color","name":"Instagram"},{"value":"#1877f2","type":"color","name":"Facebook"},{"value":"#1da1f2","type":"color","name":"Twitter"},{"value":"#000000","type":"color","name":"Github"},{"value":"#000000","type":"color","name":"Apple"},{"value":"#4285f4","type":"color","name":"GoogleBlue"},{"value":"#db4437","type":"color","name":"GoogleRed"},{"value":"#f4b400","type":"color","name":"GoogleYellow"},{"value":"#0f9d58","type":"color","name":"GoogleGreen"},{"value":"transparent","type":"color","name":"transparent"},{"value":"0","type":"opacity","name":"opacity000"},{"value":"0.1","type":"opacity","name":"opacity010"},{"value":"0.2","type":"opacity","name":"opacity020"},{"value":"0.3","type":"opacity","name":"opacity030"},{"value":"0.4","type":"opacity","name":"opacity040"},{"value":"0.5","type":"opacity","name":"opacity050"},{"value":"0.6","type":"opacity","name":"opacity060"},{"value":"0.7","type":"opacity","name":"opacity070"},{"value":"0.8","type":"opacity","name":"opacity080"},{"value":"0.9","type":"opacity","name":"opacity090"},{"value":"1","type":"opacity","name":"opacity100"},{"value":"0px","type":"sizing","name":"sizing000"},{"value":"4px","type":"sizing","name":"sizing010"},{"value":"8px","type":"sizing","name":"sizing020"},{"value":"12px","type":"sizing","name":"sizing030"},{"value":"16px","type":"sizing","name":"sizing040"},{"value":"20px","type":"sizing","name":"sizing045"},{"value":"24px","type":"sizing","name":"sizing050"},{"value":"32px","type":"sizing","name":"sizing060"},{"value":"40px","type":"sizing","name":"sizing070"},{"value":"48px","type":"sizing","name":"sizing080"},{"value":"64px","type":"sizing","name":"sizing090"},{"value":"80px","type":"sizing","name":"sizing100"},{"value":"120px","type":"sizing","name":"sizing110"},{"value":"160px","type":"sizing","name":"sizing120"},{"value":"{sizing020}","type":"sizing","name":"iconSize005"},{"value":"{sizing040}","type":"sizing","name":"iconSize010"},{"value":"{sizing050}","type":"sizing","name":"iconSize020"},{"value":"{sizing060}","type":"sizing","name":"iconSize030"},{"value":"{sizing080}","type":"sizing","name":"iconSize040"},{"value":"{sizing090}","type":"sizing","name":"iconSize050"},{"value":"{sizing000}","type":"spacing","name":"space000"},{"value":"{sizing010}","type":"spacing","name":"space010"},{"value":"{sizing020}","type":"spacing","name":"space020"},{"value":"{sizing030}","type":"spacing","name":"space030"},{"value":"{sizing040}","type":"spacing","name":"space040"},{"value":"{sizing045}","type":"spacing","name":"space045"},{"value":"{sizing050}","type":"spacing","name":"space050"},{"value":"{sizing060}","type":"spacing","name":"space060"},{"value":"{sizing070}","type":"spacing","name":"space070"},{"value":"{sizing080}","type":"spacing","name":"space080"},{"value":"{sizing090}","type":"spacing","name":"space090"},{"value":"{sizing100}","type":"spacing","name":"space100"},{"value":"{sizing110}","type":"spacing","name":"space110"},{"value":"{sizing120}","type":"spacing","name":"space120"},{"value":"DM Sans, sans-serif","type":"fontFamilies","name":"fontFamily010"},{"value":"Bitter, serif","type":"fontFamilies","name":"fontFamily020"},{"value":"Poppins, sans-serif","type":"fontFamilies","name":"fontFamily030"},{"value":"12px","type":"fontSizes","name":"fontSize010"},{"value":"14px","type":"fontSizes","name":"fontSize020"},{"value":"16px","type":"fontSizes","name":"fontSize030"},{"value":"18px","type":"fontSizes","name":"fontSize040"},{"value":"20px","type":"fontSizes","name":"fontSize050"},{"value":"22px","type":"fontSizes","name":"fontSize060"},{"value":"24px","type":"fontSizes","name":"fontSize070"},{"value":"28px","type":"fontSizes","name":"fontSize080"},{"value":"32px","type":"fontSizes","name":"fontSize090"},{"value":"36px","type":"fontSizes","name":"fontSize100"},{"value":"40px","type":"fontSizes","name":"fontSize110"},{"value":"44px","type":"fontSizes","name":"fontSize120"},{"value":"48px","type":"fontSizes","name":"fontSize130"},{"value":"56px","type":"fontSizes","name":"fontSize140"},{"value":"64px","type":"fontSizes","name":"fontSize150"},{"value":"80px","type":"fontSizes","name":"fontSize160"},{"value":"-1%","type":"letterSpacing","name":"letterSpacing010"},{"value":"-0.5%","type":"letterSpacing","name":"letterSpacing020"},{"value":"0%","type":"letterSpacing","name":"letterSpacing030"},{"value":"0.5%","type":"letterSpacing","name":"letterSpacing040"},{"value":"1%","type":"letterSpacing","name":"letterSpacing050"},{"value":"100%","type":"lineHeights","name":"fontLineHeight010"},{"value":"112.5%","type":"lineHeights","name":"fontLineHeight020"},{"value":"125%","type":"lineHeights","name":"fontLineHeight030"},{"value":"150%","type":"lineHeights","name":"fontLineHeight040"},{"value":"175%","type":"lineHeights","name":"fontLineHeight050"},{"value":"200%","type":"lineHeights","name":"fontLineHeight060"},{"value":"Thin","type":"fontWeights","description":"Thin","name":"weight.100"},{"value":"ExtraLight","type":"fontWeights","description":"Extra Light","name":"weight.200"},{"value":"Light","type":"fontWeights","description":"Light","name":"weight.300"},{"value":"Regular","type":"fontWeights","description":"Regular","name":"weight.400"},{"value":"Medium","type":"fontWeights","description":"Medium","name":"weight.500"},{"value":"SemiBold","type":"fontWeights","description":"Semi Bold","name":"weight.600"},{"value":"Bold","type":"fontWeights","description":"Bold","name":"weight.700"},{"value":"ExtraBold","type":"fontWeights","description":"Extra Bold","name":"weight.800"},{"value":"Black","type":"fontWeights","description":"Black","name":"weight.900"},{"value":"Ultra Condensed","type":"fontWeights","description":"Ultra condensed","name":"stretch.010"},{"value":"Extra Condensed","type":"fontWeights","description":"Extra condensed","name":"stretch.020"},{"value":"Condensed","type":"fontWeights","description":"Condensed","name":"stretch.030"},{"value":"Semi Condensed","type":"fontWeights","description":"Semi condensed","name":"stretch.040"},{"value":"Normal","type":"fontWeights","description":"Normal","name":"stretch.050"},{"value":"Semi Expanded","type":"fontWeights","description":"Semi expanded","name":"stretch.060"},{"value":"Expanded","type":"fontWeights","description":"Expanded","name":"stretch.070"},{"value":"Extra Expanded","type":"fontWeights","description":"Extra expanded","name":"stretch.080"},{"value":"Ultra Expanded","type":"fontWeights","description":"Ultra expanded","name":"stretch.090"},{"value":"Normal","type":"fontWeights","description":"Normal","name":"style.Normal"},{"value":"Italic","type":"fontWeights","description":"Italic","name":"style.Italic"},{"value":"Oblique","type":"fontWeights","description":"Oblique","name":"style.Oblique"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize140}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for large pieces of text content","name":"editorial.editorialDisplay010"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize150}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for large pieces of text content","name":"editorial.editorialDisplay020"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize160}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for large pieces of text content","name":"editorial.editorialDisplay030"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize040}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline010"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize050}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline020"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize070}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline030"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize080}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline040"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize090}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline050"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize100}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline060"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize110}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline070"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize130}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline080"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline010"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize050}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline020"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize070}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline030"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize080}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline040"},{"value":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize090}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline050"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for body text content such as for article text","name":"editorial.editorialParagraph010"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for body text content such as for article text","name":"editorial.editorialParagraph020"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize040}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for body text content such as for article text","name":"editorial.editorialParagraph030"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight030}","fontSize":"{fontSize060}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for quotes in body text content","name":"editorial.editorialQuote010"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight030}","fontSize":"{fontSize080}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for quotes in body text content","name":"editorial.editorialQuote020"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for captions such as for the image with caption","name":"editorial.editorialCaption010"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for non-interactive identifiers that are often defined by an editor, for example the author label in a card","name":"editorial.editorialLabel010"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for non-interactive identifiers that are often defined by an editor, for example the author label in a card","name":"editorial.editorialLabel020"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for non-interactive identifiers that are often defined by an editor, for example the author label in a card","name":"editorial.editorialLabel030"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading010"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize040}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading020"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize050}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading030"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize060}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading040"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize070}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading050"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading010"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading020"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize040}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading030"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize050}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading040"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize060}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading050"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for text inputs and banners","name":"utility.utilityBody010"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for text inputs and banners","name":"utility.utilityBody020"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for text inputs and banners","name":"utility.utilityBody030"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for text labels such as for menus and lists","name":"utility.utilityLabel010"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for text labels such as for menus and lists","name":"utility.utilityLabel020"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for text labels such as for menus and lists","name":"utility.utilityLabel030"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for button text and standalone links","name":"utility.utilityButton010"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for button text and standalone links","name":"utility.utilityButton020"},{"value":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for button text and standalone links","name":"utility.utilityButton030"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for bylines and date time","name":"utility.utilityMeta010"},{"value":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"},"type":"typography","description":"Used for bylines and date time","name":"utility.utilityMeta020"},{"value":"{sizing020}","type":"borderRadius","name":"borderRadiusDefault"},{"value":"{sizing010}","type":"borderRadius","name":"borderRadiusRounded010"},{"value":"{sizing020}","type":"borderRadius","name":"borderRadiusRounded020"},{"value":"{sizing030}","type":"borderRadius","name":"borderRadiusRounded030"},{"value":"{sizing040}","type":"borderRadius","name":"borderRadiusRounded040"},{"value":"{sizing050}","type":"borderRadius","name":"borderRadiusRounded050"},{"value":"{sizing000}","type":"borderRadius","name":"borderRadiusSharp"},{"value":"50%","type":"borderRadius","name":"borderRadiusCircle"},{"value":"20rem","type":"borderRadius","name":"borderRadiusPill"},{"value":"{borderWidth010}","type":"borderWidth","name":"borderWidthDefault"},{"value":"0px","type":"borderWidth","name":"borderWidth000"},{"value":"1px","type":"borderWidth","name":"borderWidth010"},{"value":"2px","type":"borderWidth","name":"borderWidth020"},{"value":"4px","type":"borderWidth","name":"borderWidth030"},{"value":{"x":"0","y":"0.5","blur":"2","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"},"type":"boxShadow","description":"Default states of cards and active states of buttons","name":"shadow010"},{"value":{"x":"0","y":"2","blur":"4","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"},"type":"boxShadow","description":"Notification badges","name":"shadow020"},{"value":{"x":"0","y":"4","blur":"8","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"},"type":"boxShadow","description":"Navigation menu bars","name":"shadow030"},{"value":{"x":"0","y":"8","blur":"16","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"},"type":"boxShadow","description":"Hover states of cards and button hover states","name":"shadow040"},{"value":{"x":"0","y":"16","blur":"24","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"},"type":"boxShadow","description":"Pickers and popovers","name":"shadow050"},{"value":{"x":"0","y":"20","blur":"32","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"},"type":"boxShadow","description":"Modals and dialogs","name":"shadow060"},{"value":"https://corsproxy.io/?","type":"other","name":"CORS service"}],"Light":[{"value":"{blue080}","type":"color","description":"Brand colour complimentary to inkBrand010","name":"ink.inkBrand020"},{"value":"{blue060}","type":"color","description":"Prominent brand colour applied to text and icons (e.g. icons in outlined buttons)","name":"ink.inkBrand010"},{"value":"{teal060}","type":"color","description":"Text and icons for informative messages","name":"ink.inkInformative"},{"value":"{neutral070}","type":"color","description":"Text and icons for notice messages","name":"ink.inkNotice"},{"value":"{red060}","type":"color","description":"Text and icons for error messages. Feedback notifications (invalid) (e.g. assistive text in a text field)","name":"ink.inkNegative"},{"value":"{green060}","type":"color","description":"Text and icons for success messages. Feedback notifications (valid) (e.g. assistive text in a text field)","name":"ink.inkPositive"},{"value":"{neutral100}","type":"color","description":"Used when the same dark colour value is required across all colour themes","name":"ink.inkDark010"},{"value":"{white}","type":"color","description":"Used when the same light colour value is required across all colour themes","name":"ink.inkLight010"},{"value":"{white}","type":"color","description":"Text and icons where the recommended contrast against the background cannot be achieved","name":"ink.inkInverse"},{"value":"{neutral040}","type":"color","description":"Text and icons in an inactive (disabled) state","name":"ink.inkNonEssential"},{"value":"{neutral060}","type":"color","description":"Subheadlines, labels and secondary text","name":"ink.inkSubtle"},{"value":"{neutral080}","type":"color","description":"Body and paragraph text","name":"ink.inkBase"},{"value":"{neutral100}","type":"color","description":"Headlines or copy where emphasis is needed","name":"ink.inkContrast"},{"value":"{neutral020}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) to indicate the skeleton (loading) state of a component","name":"interface.interfaceSkeleton020"},{"value":"{neutral010}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) to indicate the skeleton (loading) state of a component","name":"interface.interfaceSkeleton010"},{"value":"{neutral010}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for neutral messages","name":"interface.interfaceNeutral020"},{"value":"{neutral080}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for neutral messages, & feedback notifications (e.g. banner, flag, inline message)","name":"interface.interfaceNeutral010"},{"value":"{teal010}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for informative messages","name":"interface.interfaceInformative020"},{"value":"{teal060}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for informative messages","name":"interface.interfaceInformative010"},{"value":"{neutral010}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for notice or warning messages","name":"interface.interfaceNotice020"},{"value":"{neutral080}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for notice or warning messages","name":"interface.interfaceNotice010"},{"value":"{red010}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for error messages","name":"interface.interfaceNegative020"},{"value":"{red060}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for error messages","name":"interface.interfaceNegative010"},{"value":"{green010}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for success messages","name":"interface.interfacePositive020"},{"value":"{green060}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for success messages","name":"interface.interfacePositive010"},{"value":"{blue090}","type":"color","description":"Brand colour complimentary to interfaceBrand010","name":"interface.interfaceBrand020"},{"value":"{blue060}","type":"color","description":"Prominent brand colour applied to backgrounds e.g. a footer, or header","name":"interface.interfaceBrand010"},{"value":"{neutral100}","type":"color","description":"Component backgrounds of contrasting colours","name":"interface.interface060"},{"value":"{neutral040}","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface050"},{"value":"{neutral030}","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface040"},{"value":"{neutral020}","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface030"},{"value":"{neutral010}","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface020"},{"value":"{white}","type":"color","description":"Component backgrounds (e.g. card)","name":"interface.interface010"},{"value":"{white}","type":"color","description":"Page background","name":"interface.interfaceBackground"},{"value":"{blue070}","type":"color","description":"Active state background and border for selection controls, and input components","name":"interactive.interactiveInput050"},{"value":"{blue060}","type":"color","description":"Background & border colours applied to the Selected state of the Switch, the checkbox, & radio components","name":"interactive.interactiveInput040"},{"value":"{blue010}","type":"color","description":"Background colour applied to the ‘feedback’ of the checkbox, & radio components","name":"interactive.interactiveInput030"},{"value":"{neutral050}","type":"color","description":"Background & border colours applied to the unselected state of the switch, the checkbox, & radio components","name":"interactive.interactiveInput020"},{"value":"{neutral010}","type":"color","description":"Background colour applied to the hover state of the text field, & the select component button, & the list item","name":"interactive.interactiveInput010"},{"value":"{focus010}","type":"color","description":"Focus tabbing","name":"interactive.interactiveFocus010"},{"value":"{white}","type":"color","description":"Inverse focus tabbing ","name":"interactive.interactiveFocus020"},{"value":"{purple060}","type":"color","description":"Visited state","name":"interactive.interactiveVisited010"},{"value":"{neutral020}","type":"color","description":"Disabled state","name":"interactive.interactiveDisabled010"},{"value":"{blue080}","type":"color","description":"Colour applied to the active state of an inline and standalone link","name":"interactive.interactiveLink030"},{"value":"{blue070}","type":"color","description":"Colour applied to the hover state of an inline and standalone link","name":"interactive.interactiveLink020"},{"value":"{blue060}","type":"color","description":"Colour applied to the base state of an inline and standalone link","name":"interactive.interactiveLink010"},{"value":"{whiteTint080}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse050"},{"value":"{whiteTint070}","type":"color","description":"Background colour applied to the hover state of the Solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse040"},{"value":"{white}","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse030"},{"value":"{whiteTint020}","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveInverse020"},{"value":"{whiteTint010}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactiveInverse010"},{"value":"{red080}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative050"},{"value":"{red070}","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative040"},{"value":"{red060}","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative030"},{"value":"{red020}","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveNegative020"},{"value":"{red010}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactiveNegative010"},{"value":"{green080}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive050"},{"value":"{green070}","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive040"},{"value":"{green060}","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive030"},{"value":"{green020}","type":"color","description":"Background colour applied to the loading state of all button, & the active state of the outlined & minimal button","name":"interactive.interactivePositive020"},{"value":"{green010}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactivePositive010"},{"value":"{neutral100}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveSecondary050"},{"value":"{neutral090}","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveSecondary040"},{"value":"{neutral080}","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button ","name":"interactive.interactiveSecondary030"},{"value":"{neutral020}","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveSecondary020"},{"value":"{neutral010}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactiveSecondary010"},{"value":"{blue080}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary050"},{"value":"{blue070}","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary040"},{"value":"{blue060}","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary030"},{"value":"{blue020}","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactivePrimary020"},{"value":"{blue010}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactivePrimary010"},{"value":"{blackTint020}","type":"color","description":"Overlay to darken the base interface when a modal or drawer is used","name":"overlay.overlayTintBase010"},{"value":"{blackTint040}","type":"color","description":"Overlay to darken the base interface when a modal or drawer is used","name":"overlay.overlayTintBase020"},{"value":"{blackTint060}","type":"color","description":"Overlay to darken the base interface when a modal or drawer is used","name":"overlay.overlayTintBase030"},{"value":"{blackTint080}","type":"color","description":"Overlay to darken the base interface when a modal or drawer is used","name":"overlay.overlayTintBase040"},{"value":"{whiteTint020}","type":"color","description":"Overlay to lighten the base interface when a modal or drawer is used","name":"overlay.overlayTintInverse010"},{"value":"{whiteTint040}","type":"color","description":"Overlay to lighten the base interface when a modal or drawer is used","name":"overlay.overlayTintInverse020"},{"value":"{whiteTint060}","type":"color","description":"Overlay to lighten the base interface when a modal or drawer is used","name":"overlay.overlayTintInverse030"},{"value":"{whiteTint080}","type":"color","description":"Overlay to lighten the base interface when a modal or drawer is used","name":"overlay.overlayTintInverse040"},{"value":"linear-gradient(0deg, rgba({white}, 0) 0%, rgba({white}, 1) 100%)","type":"color","description":"Base gradient tokens fade elements into the interface background","name":"overlay.overlayGradientBaseVertical"},{"value":"linear-gradient(-90deg, rgba({white}, 0) 0%, rgba({white}, 1) 100%)","type":"color","description":"Base gradient tokens fade elements into the interface background","name":"overlay.overlayGradientBaseHorizontal"},{"value":"linear-gradient(0deg, rgba({black}, 0) 0%, rgba({black}, 1) 100%)","type":"color","description":"Inverse gradient tokens fade elements into a dark background in a light theme","name":"overlay.overlayGradientInverseVertical"},{"value":"linear-gradient(-90deg, rgba({black}, 0) 0%, rgba({black}, 1) 100%)","type":"color","description":"Inverse gradient tokens fade elements into a dark background in a light theme","name":"overlay.overlayGradientInverseHorizontal"}],"Dark":[{"value":"{blue030}","type":"color","description":"Brand colour complimentary to inkBrand010","name":"ink.inkBrand020"},{"value":"{blue050}","type":"color","description":"Prominent brand colour applied to text and icons (e.g. icons in outlined buttons)","name":"ink.inkBrand010"},{"value":"{teal050}","type":"color","description":"Text and icons for informative messages","name":"ink.inkInformative"},{"value":"{neutral040}","type":"color","description":"Text and icons for notice messages","name":"ink.inkNotice"},{"value":"{red050}","type":"color","description":"Text and icons for error messages. Feedback notifications (invalid) (e.g. assistive text in a text field)","name":"ink.inkNegative"},{"value":"{green050}","type":"color","description":"Text and icons for success messages. Feedback notifications (valid) (e.g. assistive text in a text field)","name":"ink.inkPositive"},{"value":"{neutral100}","type":"color","description":"Used when the same dark colour value is required across all colour themes","name":"ink.inkDark010"},{"value":"{white}","type":"color","description":"Used when the same light colour value is required across all colour themes","name":"ink.inkLight010"},{"value":"{neutral100}","type":"color","description":"Text and icons where the recommended contrast against the background cannot be achieved","name":"ink.inkInverse"},{"value":"{neutral050}","type":"color","description":"Text and icons in an inactive (disabled) state","name":"ink.inkNonEssential"},{"value":"{neutral040}","type":"color","description":"Subheadlines, labels and secondary text","name":"ink.inkSubtle"},{"value":"{neutral020}","type":"color","description":"Body and paragraph text","name":"ink.inkBase"},{"value":"{white}","type":"color","description":"Headlines or copy where emphasis is needed","name":"ink.inkContrast"},{"value":"{neutral080}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) to indicate the skeleton (loading) state of a component","name":"interface.interfaceSkeleton020"},{"value":"{neutral090}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) to indicate the skeleton (loading) state of a component","name":"interface.interfaceSkeleton010"},{"value":"{neutral080}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for neutral messages","name":"interface.interfaceNeutral020"},{"value":"{neutral030}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for neutral messages, & feedback notifications (e.g. banner, flag, inline message)","name":"interface.interfaceNeutral010"},{"value":"{teal090}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for informative messages","name":"interface.interfaceInformative020"},{"value":"{teal050}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for informative messages","name":"interface.interfaceInformative010"},{"value":"{neutral080}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for notice or warning messages","name":"interface.interfaceNotice020"},{"value":"{neutral030}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for notice or warning messages","name":"interface.interfaceNotice010"},{"value":"{red090}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for error messages","name":"interface.interfaceNegative020"},{"value":"{red050}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for error messages","name":"interface.interfaceNegative010"},{"value":"{green090}","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for success messages","name":"interface.interfacePositive020"},{"value":"{green050}","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for success messages","name":"interface.interfacePositive010"},{"value":"{blue030}","type":"color","description":"Brand colour complimentary to interfaceBrand010","name":"interface.interfaceBrand020"},{"value":"{blue050}","type":"color","description":"Prominent brand colour applied to backgrounds e.g. a footer, or header","name":"interface.interfaceBrand010"},{"value":"{neutral030}","type":"color","description":"Component backgrounds of contrasting colours","name":"interface.interface060"},{"value":"{neutral050}","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface050"},{"value":"{neutral060}","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface040"},{"value":"{neutral070}","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface030"},{"value":"{neutral080}","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface020"},{"value":"{neutral090}","type":"color","description":"Component backgrounds (e.g. card)","name":"interface.interface010"},{"value":"{neutral100}","type":"color","description":"Page background","name":"interface.interfaceBackground"},{"value":"{blue030}","type":"color","description":"Active state background and border for selection controls, and input components","name":"interactive.interactiveInput050"},{"value":"{blue050}","type":"color","description":"Background & border colours applied to the Selected state of the Switch, the checkbox, & radio components","name":"interactive.interactiveInput040"},{"value":"{blue090}","type":"color","description":"Background colour applied to the ‘feedback’ of the checkbox, & radio components","name":"interactive.interactiveInput030"},{"value":"{neutral060}","type":"color","description":"Background & border colours applied to the unselected state of the switch, the checkbox, & radio components","name":"interactive.interactiveInput020"},{"value":"{neutral090}","type":"color","description":"Background colour applied to the hover state of the text field, & the select component button, & the list item","name":"interactive.interactiveInput010"},{"value":"{focus010}","type":"color","description":"Focus tabbing","name":"interactive.interactiveFocus010"},{"value":"{blackTint090}","type":"color","description":"Inverse focus tabbing","name":"interactive.interactiveFocus020"},{"value":"{purple050}","type":"color","description":"Visited state","name":"interactive.interactiveVisited010"},{"value":"{neutral080}","type":"color","description":"Disabled state","name":"interactive.interactiveDisabled010"},{"value":"{blue030}","type":"color","description":"","name":"interactive.interactiveLink030"},{"value":"{blue040}","type":"color","description":"","name":"interactive.interactiveLink020"},{"value":"{blue050}","type":"color","description":"","name":"interactive.interactiveLink010"},{"value":"{blackTint080}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse050"},{"value":"{blackTint070}","type":"color","description":"Background colour applied to the hover state of the Solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse040"},{"value":"{blackTint090}","type":"color","description":"Background colour applied to the Base state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse030"},{"value":"{blackTint020}","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveInverse020"},{"value":"{blackTint010}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactiveInverse010"},{"value":"{red030}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative050"},{"value":"{red040}","type":"color","description":"Background colour applied to the Hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative040"},{"value":"{red050}","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative030"},{"value":"{red080}","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveNegative020"},{"value":"{red090}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactiveNegative010"},{"value":"{green030}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive050"},{"value":"{green040}","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive040"},{"value":"{green050}","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive030"},{"value":"{green080}","type":"color","description":"Background colour applied to the loading state of all button, & the active state of the outlined & minimal button","name":"interactive.interactivePositive020"},{"value":"{green090}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactivePositive010"},{"value":"{neutral030}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveSecondary050"},{"value":"{neutral040}","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveSecondary040"},{"value":"{neutral050}","type":"color","description":"Background colour applied to the Base state of the solid button, & the border colour of the outlined button ","name":"interactive.interactiveSecondary030"},{"value":"{neutral080}","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveSecondary020"},{"value":"{neutral090}","type":"color","description":"Background colour applied to the Hover state of the outlined & minimal button","name":"interactive.interactiveSecondary010"},{"value":"{blue030}","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary050"},{"value":"{blue040}","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary040"},{"value":"{blue050}","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary030"},{"value":"{blue080}","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactivePrimary020"},{"value":"{blue090}","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactivePrimary010"},{"value":"{whiteTint020}","type":"color","description":"Creative use case","name":"overlay.overlayTintBase010"},{"value":"{whiteTint040}","type":"color","description":"Creative use case","name":"overlay.overlayTintBase020"},{"value":"{whiteTint060}","type":"color","description":"Creative use case","name":"overlay.overlayTintBase030"},{"value":"{whiteTint080}","type":"color","description":"Internal overlay component that sits behind the panels (used by modals and drawers)","name":"overlay.overlayTintBase040"},{"value":"{blackTint020}","type":"color","description":"Creative use case","name":"overlay.overlayTintInverse010"},{"value":"{blackTint040}","type":"color","description":"Creative use case","name":"overlay.overlayTintInverse020"},{"value":"{blackTint060}","type":"color","description":"Creative use case","name":"overlay.overlayTintInverse030"},{"value":"{blackTint080}","type":"color","description":"Creative use case","name":"overlay.overlayTintInverse040"},{"value":"linear-gradient(0deg, rgba({black}, 0) 0%, rgba({black}, 1) 100%)","type":"color","description":"Base gradient tokens fade elements into the interface background","name":"overlay.overlayGradientBaseVertical"},{"value":"linear-gradient(-90deg, rgba({black}, 0) 0%, rgba({black}, 1) 100%)","type":"color","description":"Base gradient tokens fade elements into the interface background","name":"overlay.overlayGradientBaseHorizontal"},{"value":"linear-gradient(0deg, rgba({neutral030}, 0) 0%, rgba({neutral030}, 1) 100%)","type":"color","description":"Inverse gradient tokens fade elements into a light background in a dark theme","name":"overlay.overlayGradientInverseVertical"},{"value":"linear-gradient(-90deg, rgba({neutral030}, 0) 0%, rgba({neutral030}, 1) 100%)","type":"color","description":"Inverse gradient tokens fade elements into a light background in a dark theme","name":"overlay.overlayGradientInverseHorizontal"}]},"tokens":[{"value":"#aebfff","type":"color","description":"Brand colour complimentary to inkBrand010","name":"ink.inkBrand020","internal__Parent":"Dark","rawValue":"{blue030}"},{"value":"#708de9","type":"color","description":"Prominent brand colour applied to text and icons (e.g. icons in outlined buttons)","name":"ink.inkBrand010","internal__Parent":"Dark","rawValue":"{blue050}"},{"value":"#289fab","type":"color","description":"Text and icons for informative messages","name":"ink.inkInformative","internal__Parent":"Dark","rawValue":"{teal050}"},{"value":"#ababab","type":"color","description":"Text and icons for notice messages","name":"ink.inkNotice","internal__Parent":"Dark","rawValue":"{neutral040}"},{"value":"#fb5959","type":"color","description":"Text and icons for error messages. Feedback notifications (invalid) (e.g. assistive text in a text field)","name":"ink.inkNegative","internal__Parent":"Dark","rawValue":"{red050}"},{"value":"#41a05b","type":"color","description":"Text and icons for success messages. Feedback notifications (valid) (e.g. assistive text in a text field)","name":"ink.inkPositive","internal__Parent":"Dark","rawValue":"{green050}"},{"value":"#111111","type":"color","description":"Used when the same dark colour value is required across all colour themes","name":"ink.inkDark010","internal__Parent":"Dark","rawValue":"{neutral100}"},{"value":"#ffffff","type":"color","description":"Used when the same light colour value is required across all colour themes","name":"ink.inkLight010","internal__Parent":"Dark","rawValue":"{white}"},{"value":"#111111","type":"color","description":"Text and icons where the recommended contrast against the background cannot be achieved","name":"ink.inkInverse","internal__Parent":"Dark","rawValue":"{neutral100}"},{"value":"#919191","type":"color","description":"Text and icons in an inactive (disabled) state","name":"ink.inkNonEssential","internal__Parent":"Dark","rawValue":"{neutral050}"},{"value":"#ababab","type":"color","description":"Subheadlines, labels and secondary text","name":"ink.inkSubtle","internal__Parent":"Dark","rawValue":"{neutral040}"},{"value":"#e2e2e2","type":"color","description":"Body and paragraph text","name":"ink.inkBase","internal__Parent":"Dark","rawValue":"{neutral020}"},{"value":"#ffffff","type":"color","description":"Headlines or copy where emphasis is needed","name":"ink.inkContrast","internal__Parent":"Dark","rawValue":"{white}"},{"value":"#3b3b3b","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) to indicate the skeleton (loading) state of a component","name":"interface.interfaceSkeleton020","internal__Parent":"Dark","rawValue":"{neutral080}"},{"value":"#262626","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) to indicate the skeleton (loading) state of a component","name":"interface.interfaceSkeleton010","internal__Parent":"Dark","rawValue":"{neutral090}"},{"value":"#3b3b3b","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for neutral messages","name":"interface.interfaceNeutral020","internal__Parent":"Dark","rawValue":"{neutral080}"},{"value":"#c6c6c6","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for neutral messages, & feedback notifications (e.g. banner, flag, inline message)","name":"interface.interfaceNeutral010","internal__Parent":"Dark","rawValue":"{neutral030}"},{"value":"#002b30","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for informative messages","name":"interface.interfaceInformative020","internal__Parent":"Dark","rawValue":"{teal090}"},{"value":"#289fab","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for informative messages","name":"interface.interfaceInformative010","internal__Parent":"Dark","rawValue":"{teal050}"},{"value":"#3b3b3b","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for notice or warning messages","name":"interface.interfaceNotice020","internal__Parent":"Dark","rawValue":"{neutral080}"},{"value":"#c6c6c6","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for notice or warning messages","name":"interface.interfaceNotice010","internal__Parent":"Dark","rawValue":"{neutral030}"},{"value":"#550000","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for error messages","name":"interface.interfaceNegative020","internal__Parent":"Dark","rawValue":"{red090}"},{"value":"#fb5959","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for error messages","name":"interface.interfaceNegative010","internal__Parent":"Dark","rawValue":"{red050}"},{"value":"#002d0d","type":"color","description":"Background (low contrast in a light theme, and high contrast in a dark theme) for success messages","name":"interface.interfacePositive020","internal__Parent":"Dark","rawValue":"{green090}"},{"value":"#41a05b","type":"color","description":"Background (high contrast in a light theme, and low contrast in a dark theme) for success messages","name":"interface.interfacePositive010","internal__Parent":"Dark","rawValue":"{green050}"},{"value":"#aebfff","type":"color","description":"Brand colour complimentary to interfaceBrand010","name":"interface.interfaceBrand020","internal__Parent":"Dark","rawValue":"{blue030}"},{"value":"#708de9","type":"color","description":"Prominent brand colour applied to backgrounds e.g. a footer, or header","name":"interface.interfaceBrand010","internal__Parent":"Dark","rawValue":"{blue050}"},{"value":"#c6c6c6","type":"color","description":"Component backgrounds of contrasting colours","name":"interface.interface060","internal__Parent":"Dark","rawValue":"{neutral030}"},{"value":"#919191","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface050","internal__Parent":"Dark","rawValue":"{neutral050}"},{"value":"#6a6a6a","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface040","internal__Parent":"Dark","rawValue":"{neutral060}"},{"value":"#525252","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface030","internal__Parent":"Dark","rawValue":"{neutral070}"},{"value":"#3b3b3b","type":"color","description":"Extended scale of component backgrounds","name":"interface.interface020","internal__Parent":"Dark","rawValue":"{neutral080}"},{"value":"#262626","type":"color","description":"Component backgrounds (e.g. card)","name":"interface.interface010","internal__Parent":"Dark","rawValue":"{neutral090}"},{"value":"#111111","type":"color","description":"Page background","name":"interface.interfaceBackground","internal__Parent":"Dark","rawValue":"{neutral100}"},{"value":"#aebfff","type":"color","description":"Active state background and border for selection controls, and input components","name":"interactive.interactiveInput050","internal__Parent":"Dark","rawValue":"{blue030}"},{"value":"#708de9","type":"color","description":"Background & border colours applied to the Selected state of the Switch, the checkbox, & radio components","name":"interactive.interactiveInput040","internal__Parent":"Dark","rawValue":"{blue050}"},{"value":"#03264d","type":"color","description":"Background colour applied to the ‘feedback’ of the checkbox, & radio components","name":"interactive.interactiveInput030","internal__Parent":"Dark","rawValue":"{blue090}"},{"value":"#6a6a6a","type":"color","description":"Background & border colours applied to the unselected state of the switch, the checkbox, & radio components","name":"interactive.interactiveInput020","internal__Parent":"Dark","rawValue":"{neutral060}"},{"value":"#262626","type":"color","description":"Background colour applied to the hover state of the text field, & the select component button, & the list item","name":"interactive.interactiveInput010","internal__Parent":"Dark","rawValue":"{neutral090}"},{"value":"#3768fb","type":"color","description":"Focus tabbing","name":"interactive.interactiveFocus010","internal__Parent":"Dark","rawValue":"{focus010}"},{"value":"#000000e6","type":"color","description":"Inverse focus tabbing","name":"interactive.interactiveFocus020","internal__Parent":"Dark","rawValue":"{blackTint090}"},{"value":"#8883f6","type":"color","description":"Visited state","name":"interactive.interactiveVisited010","internal__Parent":"Dark","rawValue":"{purple050}"},{"value":"#3b3b3b","type":"color","description":"Disabled state","name":"interactive.interactiveDisabled010","internal__Parent":"Dark","rawValue":"{neutral080}"},{"value":"#aebfff","type":"color","description":"","name":"interactive.interactiveLink030","internal__Parent":"Dark","rawValue":"{blue030}"},{"value":"#8ba6f6","type":"color","description":"","name":"interactive.interactiveLink020","internal__Parent":"Dark","rawValue":"{blue040}"},{"value":"#708de9","type":"color","description":"","name":"interactive.interactiveLink010","internal__Parent":"Dark","rawValue":"{blue050}"},{"value":"#000000cc","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse050","internal__Parent":"Dark","rawValue":"{blackTint080}"},{"value":"#000000b3","type":"color","description":"Background colour applied to the hover state of the Solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse040","internal__Parent":"Dark","rawValue":"{blackTint070}"},{"value":"#000000e6","type":"color","description":"Background colour applied to the Base state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveInverse030","internal__Parent":"Dark","rawValue":"{blackTint090}"},{"value":"#00000033","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveInverse020","internal__Parent":"Dark","rawValue":"{blackTint020}"},{"value":"#0000001a","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactiveInverse010","internal__Parent":"Dark","rawValue":"{blackTint010}"},{"value":"#feb3b3","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative050","internal__Parent":"Dark","rawValue":"{red030}"},{"value":"#fe8888","type":"color","description":"Background colour applied to the Hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative040","internal__Parent":"Dark","rawValue":"{red040}"},{"value":"#fb5959","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveNegative030","internal__Parent":"Dark","rawValue":"{red050}"},{"value":"#7d0000","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveNegative020","internal__Parent":"Dark","rawValue":"{red080}"},{"value":"#550000","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactiveNegative010","internal__Parent":"Dark","rawValue":"{red090}"},{"value":"#95caa3","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive050","internal__Parent":"Dark","rawValue":"{green030}"},{"value":"#6db681","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive040","internal__Parent":"Dark","rawValue":"{green040}"},{"value":"#41a05b","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePositive030","internal__Parent":"Dark","rawValue":"{green050}"},{"value":"#004514","type":"color","description":"Background colour applied to the loading state of all button, & the active state of the outlined & minimal button","name":"interactive.interactivePositive020","internal__Parent":"Dark","rawValue":"{green080}"},{"value":"#002d0d","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactivePositive010","internal__Parent":"Dark","rawValue":"{green090}"},{"value":"#c6c6c6","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveSecondary050","internal__Parent":"Dark","rawValue":"{neutral030}"},{"value":"#ababab","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactiveSecondary040","internal__Parent":"Dark","rawValue":"{neutral040}"},{"value":"#919191","type":"color","description":"Background colour applied to the Base state of the solid button, & the border colour of the outlined button ","name":"interactive.interactiveSecondary030","internal__Parent":"Dark","rawValue":"{neutral050}"},{"value":"#3b3b3b","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactiveSecondary020","internal__Parent":"Dark","rawValue":"{neutral080}"},{"value":"#262626","type":"color","description":"Background colour applied to the Hover state of the outlined & minimal button","name":"interactive.interactiveSecondary010","internal__Parent":"Dark","rawValue":"{neutral090}"},{"value":"#aebfff","type":"color","description":"Background colour applied to the active state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary050","internal__Parent":"Dark","rawValue":"{blue030}"},{"value":"#8ba6f6","type":"color","description":"Background colour applied to the hover state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary040","internal__Parent":"Dark","rawValue":"{blue040}"},{"value":"#708de9","type":"color","description":"Background colour applied to the base state of the solid button, & the border colour of the outlined button","name":"interactive.interactivePrimary030","internal__Parent":"Dark","rawValue":"{blue050}"},{"value":"#12387a","type":"color","description":"Background colour applied to the loading state of all buttons, & the active state of the outlined & minimal button","name":"interactive.interactivePrimary020","internal__Parent":"Dark","rawValue":"{blue080}"},{"value":"#03264d","type":"color","description":"Background colour applied to the hover state of the outlined & minimal button","name":"interactive.interactivePrimary010","internal__Parent":"Dark","rawValue":"{blue090}"},{"value":"#ffffff33","type":"color","description":"Creative use case","name":"overlay.overlayTintBase010","internal__Parent":"Dark","rawValue":"{whiteTint020}"},{"value":"#ffffff66","type":"color","description":"Creative use case","name":"overlay.overlayTintBase020","internal__Parent":"Dark","rawValue":"{whiteTint040}"},{"value":"#ffffff99","type":"color","description":"Creative use case","name":"overlay.overlayTintBase030","internal__Parent":"Dark","rawValue":"{whiteTint060}"},{"value":"#ffffffcc","type":"color","description":"Internal overlay component that sits behind the panels (used by modals and drawers)","name":"overlay.overlayTintBase040","internal__Parent":"Dark","rawValue":"{whiteTint080}"},{"value":"#00000033","type":"color","description":"Creative use case","name":"overlay.overlayTintInverse010","internal__Parent":"Dark","rawValue":"{blackTint020}"},{"value":"#00000066","type":"color","description":"Creative use case","name":"overlay.overlayTintInverse020","internal__Parent":"Dark","rawValue":"{blackTint040}"},{"value":"#00000099","type":"color","description":"Creative use case","name":"overlay.overlayTintInverse030","internal__Parent":"Dark","rawValue":"{blackTint060}"},{"value":"#000000cc","type":"color","description":"Creative use case","name":"overlay.overlayTintInverse040","internal__Parent":"Dark","rawValue":"{blackTint080}"},{"value":"linear-gradient(0deg, #11111100 0%, #111111 100%)","type":"color","description":"Base gradient tokens fade elements into the interface background","name":"overlay.overlayGradientBaseVertical","internal__Parent":"Dark","rawValue":"linear-gradient(0deg, rgba({black}, 0) 0%, rgba({black}, 1) 100%)"},{"value":"linear-gradient(-90deg, #11111100 0%, #111111 100%)","type":"color","description":"Base gradient tokens fade elements into the interface background","name":"overlay.overlayGradientBaseHorizontal","internal__Parent":"Dark","rawValue":"linear-gradient(-90deg, rgba({black}, 0) 0%, rgba({black}, 1) 100%)"},{"value":"linear-gradient(0deg, #c6c6c600 0%, #c6c6c6 100%)","type":"color","description":"Inverse gradient tokens fade elements into a light background in a dark theme","name":"overlay.overlayGradientInverseVertical","internal__Parent":"Dark","rawValue":"linear-gradient(0deg, rgba({neutral030}, 0) 0%, rgba({neutral030}, 1) 100%)"},{"value":"linear-gradient(-90deg, #c6c6c600 0%, #c6c6c6 100%)","type":"color","description":"Inverse gradient tokens fade elements into a light background in a dark theme","name":"overlay.overlayGradientInverseHorizontal","internal__Parent":"Dark","rawValue":"linear-gradient(-90deg, rgba({neutral030}, 0) 0%, rgba({neutral030}, 1) 100%)"},{"value":"#ecf1ff","type":"color","name":"blue010","internal__Parent":"Foundations","rawValue":"#ecf1ff"},{"value":"#d5e0fc","type":"color","name":"blue020","internal__Parent":"Foundations","rawValue":"#d5e0fc"},{"value":"#aebfff","type":"color","name":"blue030","internal__Parent":"Foundations","rawValue":"#aebfff"},{"value":"#8ba6f6","type":"color","name":"blue040","internal__Parent":"Foundations","rawValue":"#8ba6f6"},{"value":"#708de9","type":"color","name":"blue050","internal__Parent":"Foundations","rawValue":"#708de9"},{"value":"#3358cc","type":"color","name":"blue060","internal__Parent":"Foundations","rawValue":"#3358cc"},{"value":"#254cac","type":"color","name":"blue070","internal__Parent":"Foundations","rawValue":"#254cac"},{"value":"#12387a","type":"color","name":"blue080","internal__Parent":"Foundations","rawValue":"#12387a"},{"value":"#03264d","type":"color","name":"blue090","internal__Parent":"Foundations","rawValue":"#03264d"},{"value":"#060f2c","type":"color","name":"blue100","internal__Parent":"Foundations","rawValue":"#060f2c"},{"value":"#e5f4ea","type":"color","name":"green010","internal__Parent":"Foundations","rawValue":"#e5f4ea"},{"value":"#c8e4d0","type":"color","name":"green020","internal__Parent":"Foundations","rawValue":"#c8e4d0"},{"value":"#95caa3","type":"color","name":"green030","internal__Parent":"Foundations","rawValue":"#95caa3"},{"value":"#6db681","type":"color","name":"green040","internal__Parent":"Foundations","rawValue":"#6db681"},{"value":"#41a05b","type":"color","name":"green050","internal__Parent":"Foundations","rawValue":"#41a05b"},{"value":"#007b22","type":"color","name":"green060","internal__Parent":"Foundations","rawValue":"#007b22"},{"value":"#00601a","type":"color","name":"green070","internal__Parent":"Foundations","rawValue":"#00601a"},{"value":"#004514","type":"color","name":"green080","internal__Parent":"Foundations","rawValue":"#004514"},{"value":"#002d0d","type":"color","name":"green090","internal__Parent":"Foundations","rawValue":"#002d0d"},{"value":"#001506","type":"color","name":"green100","internal__Parent":"Foundations","rawValue":"#001506"},{"value":"#feecec","type":"color","name":"red010","internal__Parent":"Foundations","rawValue":"#feecec"},{"value":"#fed8d8","type":"color","name":"red020","internal__Parent":"Foundations","rawValue":"#fed8d8"},{"value":"#feb3b3","type":"color","name":"red030","internal__Parent":"Foundations","rawValue":"#feb3b3"},{"value":"#fe8888","type":"color","name":"red040","internal__Parent":"Foundations","rawValue":"#fe8888"},{"value":"#fb5959","type":"color","name":"red050","internal__Parent":"Foundations","rawValue":"#fb5959"},{"value":"#d60000","type":"color","name":"red060","internal__Parent":"Foundations","rawValue":"#d60000"},{"value":"#a90000","type":"color","name":"red070","internal__Parent":"Foundations","rawValue":"#a90000"},{"value":"#7d0000","type":"color","name":"red080","internal__Parent":"Foundations","rawValue":"#7d0000"},{"value":"#550000","type":"color","name":"red090","internal__Parent":"Foundations","rawValue":"#550000"},{"value":"#2d0000","type":"color","name":"red100","internal__Parent":"Foundations","rawValue":"#2d0000"},{"value":"#ffede1","type":"color","name":"amber010","internal__Parent":"Foundations","rawValue":"#ffede1"},{"value":"#fddcc6","type":"color","name":"amber020","internal__Parent":"Foundations","rawValue":"#fddcc6"},{"value":"#feb788","type":"color","name":"amber030","internal__Parent":"Foundations","rawValue":"#feb788"},{"value":"#f79247","type":"color","name":"amber040","internal__Parent":"Foundations","rawValue":"#f79247"},{"value":"#cd6900","type":"color","name":"amber050","internal__Parent":"Foundations","rawValue":"#cd6900"},{"value":"#a75500","type":"color","name":"amber060","internal__Parent":"Foundations","rawValue":"#a75500"},{"value":"#804200","type":"color","name":"amber070","internal__Parent":"Foundations","rawValue":"#804200"},{"value":"#5d2f00","type":"color","name":"amber080","internal__Parent":"Foundations","rawValue":"#5d2f00"},{"value":"#3c1f00","type":"color","name":"amber090","internal__Parent":"Foundations","rawValue":"#3c1f00"},{"value":"#1d0d02","type":"color","name":"amber100","internal__Parent":"Foundations","rawValue":"#1d0d02"},{"value":"#e6f4f6","type":"color","name":"teal010","internal__Parent":"Foundations","rawValue":"#e6f4f6"},{"value":"#c7e7ea","type":"color","name":"teal020","internal__Parent":"Foundations","rawValue":"#c7e7ea"},{"value":"#97d0d6","type":"color","name":"teal030","internal__Parent":"Foundations","rawValue":"#97d0d6"},{"value":"#5eb8c0","type":"color","name":"teal040","internal__Parent":"Foundations","rawValue":"#5eb8c0"},{"value":"#289fab","type":"color","name":"teal050","internal__Parent":"Foundations","rawValue":"#289fab"},{"value":"#017582","type":"color","name":"teal060","internal__Parent":"Foundations","rawValue":"#017582"},{"value":"#005b65","type":"color","name":"teal070","internal__Parent":"Foundations","rawValue":"#005b65"},{"value":"#004249","type":"color","name":"teal080","internal__Parent":"Foundations","rawValue":"#004249"},{"value":"#002b30","type":"color","name":"teal090","internal__Parent":"Foundations","rawValue":"#002b30"},{"value":"#001314","type":"color","name":"teal100","internal__Parent":"Foundations","rawValue":"#001314"},{"value":"#eff0ff","type":"color","name":"purple010","internal__Parent":"Foundations","rawValue":"#eff0ff"},{"value":"#dfe0fe","type":"color","name":"purple020","internal__Parent":"Foundations","rawValue":"#dfe0fe"},{"value":"#c0c2fc","type":"color","name":"purple030","internal__Parent":"Foundations","rawValue":"#c0c2fc"},{"value":"#a3a3fb","type":"color","name":"purple040","internal__Parent":"Foundations","rawValue":"#a3a3fb"},{"value":"#8883f6","type":"color","name":"purple050","internal__Parent":"Foundations","rawValue":"#8883f6"},{"value":"#6454e3","type":"color","name":"purple060","internal__Parent":"Foundations","rawValue":"#6454e3"},{"value":"#4c33cc","type":"color","name":"purple070","internal__Parent":"Foundations","rawValue":"#4c33cc"},{"value":"#37239c","type":"color","name":"purple080","internal__Parent":"Foundations","rawValue":"#37239c"},{"value":"#231668","type":"color","name":"purple090","internal__Parent":"Foundations","rawValue":"#231668"},{"value":"#0f0936","type":"color","name":"purple100","internal__Parent":"Foundations","rawValue":"#0f0936"},{"value":"#f1f1f1","type":"color","name":"neutral010","internal__Parent":"Foundations","rawValue":"#f1f1f1"},{"value":"#e2e2e2","type":"color","name":"neutral020","internal__Parent":"Foundations","rawValue":"#e2e2e2"},{"value":"#c6c6c6","type":"color","name":"neutral030","internal__Parent":"Foundations","rawValue":"#c6c6c6"},{"value":"#ababab","type":"color","name":"neutral040","internal__Parent":"Foundations","rawValue":"#ababab"},{"value":"#919191","type":"color","name":"neutral050","internal__Parent":"Foundations","rawValue":"#919191"},{"value":"#6a6a6a","type":"color","name":"neutral060","internal__Parent":"Foundations","rawValue":"#6a6a6a"},{"value":"#525252","type":"color","name":"neutral070","internal__Parent":"Foundations","rawValue":"#525252"},{"value":"#3b3b3b","type":"color","name":"neutral080","internal__Parent":"Foundations","rawValue":"#3b3b3b"},{"value":"#262626","type":"color","name":"neutral090","internal__Parent":"Foundations","rawValue":"#262626"},{"value":"#111111","type":"color","name":"neutral100","internal__Parent":"Foundations","rawValue":"#111111"},{"value":"#3768fb","type":"color","name":"focus010","internal__Parent":"Foundations","rawValue":"#3768fb"},{"value":"#0000001a","type":"color","name":"blackTint010","internal__Parent":"Foundations","rawValue":"#0000001a"},{"value":"#00000033","type":"color","name":"blackTint020","internal__Parent":"Foundations","rawValue":"#00000033"},{"value":"#0000004d","type":"color","name":"blackTint030","internal__Parent":"Foundations","rawValue":"#0000004d"},{"value":"#00000066","type":"color","name":"blackTint040","internal__Parent":"Foundations","rawValue":"#00000066"},{"value":"#00000080","type":"color","name":"blackTint050","internal__Parent":"Foundations","rawValue":"#00000080"},{"value":"#00000099","type":"color","name":"blackTint060","internal__Parent":"Foundations","rawValue":"#00000099"},{"value":"#000000b3","type":"color","name":"blackTint070","internal__Parent":"Foundations","rawValue":"#000000b3"},{"value":"#000000cc","type":"color","name":"blackTint080","internal__Parent":"Foundations","rawValue":"#000000cc"},{"value":"#000000e6","type":"color","name":"blackTint090","internal__Parent":"Foundations","rawValue":"#000000e6"},{"value":"#111111","type":"color","name":"black","internal__Parent":"Foundations","rawValue":"#111111"},{"value":"#ffffff1a","type":"color","name":"whiteTint010","internal__Parent":"Foundations","rawValue":"#ffffff1a"},{"value":"#ffffff33","type":"color","name":"whiteTint020","internal__Parent":"Foundations","rawValue":"#ffffff33"},{"value":"#ffffff4d","type":"color","name":"whiteTint030","internal__Parent":"Foundations","rawValue":"#ffffff4d"},{"value":"#ffffff66","type":"color","name":"whiteTint040","internal__Parent":"Foundations","rawValue":"#ffffff66"},{"value":"#ffffff80","type":"color","name":"whiteTint050","internal__Parent":"Foundations","rawValue":"#ffffff80"},{"value":"#ffffff99","type":"color","name":"whiteTint060","internal__Parent":"Foundations","rawValue":"#ffffff99"},{"value":"#ffffffb3","type":"color","name":"whiteTint070","internal__Parent":"Foundations","rawValue":"#ffffffb3"},{"value":"#ffffffcc","type":"color","name":"whiteTint080","internal__Parent":"Foundations","rawValue":"#ffffffcc"},{"value":"#ffffffe6","type":"color","name":"whiteTint090","internal__Parent":"Foundations","rawValue":"#ffffffe6"},{"value":"#ffffff","type":"color","name":"white","internal__Parent":"Foundations","rawValue":"#ffffff"},{"value":"#FF4500","type":"color","name":"Reddit","internal__Parent":"Foundations","rawValue":"#FF4500"},{"value":"#25d366","type":"color","name":"Whatsapp","internal__Parent":"Foundations","rawValue":"#25d366"},{"value":"#ff0000","type":"color","name":"Youtube","internal__Parent":"Foundations","rawValue":"#ff0000"},{"value":"#c32aa3","type":"color","name":"Instagram","internal__Parent":"Foundations","rawValue":"#c32aa3"},{"value":"#1877f2","type":"color","name":"Facebook","internal__Parent":"Foundations","rawValue":"#1877f2"},{"value":"#1da1f2","type":"color","name":"Twitter","internal__Parent":"Foundations","rawValue":"#1da1f2"},{"value":"#000000","type":"color","name":"Github","internal__Parent":"Foundations","rawValue":"#000000"},{"value":"#000000","type":"color","name":"Apple","internal__Parent":"Foundations","rawValue":"#000000"},{"value":"#4285f4","type":"color","name":"GoogleBlue","internal__Parent":"Foundations","rawValue":"#4285f4"},{"value":"#db4437","type":"color","name":"GoogleRed","internal__Parent":"Foundations","rawValue":"#db4437"},{"value":"#f4b400","type":"color","name":"GoogleYellow","internal__Parent":"Foundations","rawValue":"#f4b400"},{"value":"#0f9d58","type":"color","name":"GoogleGreen","internal__Parent":"Foundations","rawValue":"#0f9d58"},{"value":"transparent","type":"color","name":"transparent","internal__Parent":"Foundations","rawValue":"transparent"},{"value":0,"type":"opacity","name":"opacity000","internal__Parent":"Foundations","rawValue":"0"},{"value":0.1,"type":"opacity","name":"opacity010","internal__Parent":"Foundations","rawValue":"0.1"},{"value":0.2,"type":"opacity","name":"opacity020","internal__Parent":"Foundations","rawValue":"0.2"},{"value":0.3,"type":"opacity","name":"opacity030","internal__Parent":"Foundations","rawValue":"0.3"},{"value":0.4,"type":"opacity","name":"opacity040","internal__Parent":"Foundations","rawValue":"0.4"},{"value":0.5,"type":"opacity","name":"opacity050","internal__Parent":"Foundations","rawValue":"0.5"},{"value":0.6,"type":"opacity","name":"opacity060","internal__Parent":"Foundations","rawValue":"0.6"},{"value":0.7,"type":"opacity","name":"opacity070","internal__Parent":"Foundations","rawValue":"0.7"},{"value":0.8,"type":"opacity","name":"opacity080","internal__Parent":"Foundations","rawValue":"0.8"},{"value":0.9,"type":"opacity","name":"opacity090","internal__Parent":"Foundations","rawValue":"0.9"},{"value":1,"type":"opacity","name":"opacity100","internal__Parent":"Foundations","rawValue":"1"},{"value":"0px","type":"sizing","name":"sizing000","internal__Parent":"Foundations","rawValue":"0px"},{"value":"4px","type":"sizing","name":"sizing010","internal__Parent":"Foundations","rawValue":"4px"},{"value":"8px","type":"sizing","name":"sizing020","internal__Parent":"Foundations","rawValue":"8px"},{"value":"12px","type":"sizing","name":"sizing030","internal__Parent":"Foundations","rawValue":"12px"},{"value":"16px","type":"sizing","name":"sizing040","internal__Parent":"Foundations","rawValue":"16px"},{"value":"20px","type":"sizing","name":"sizing045","internal__Parent":"Foundations","rawValue":"20px"},{"value":"24px","type":"sizing","name":"sizing050","internal__Parent":"Foundations","rawValue":"24px"},{"value":"32px","type":"sizing","name":"sizing060","internal__Parent":"Foundations","rawValue":"32px"},{"value":"40px","type":"sizing","name":"sizing070","internal__Parent":"Foundations","rawValue":"40px"},{"value":"48px","type":"sizing","name":"sizing080","internal__Parent":"Foundations","rawValue":"48px"},{"value":"64px","type":"sizing","name":"sizing090","internal__Parent":"Foundations","rawValue":"64px"},{"value":"80px","type":"sizing","name":"sizing100","internal__Parent":"Foundations","rawValue":"80px"},{"value":"120px","type":"sizing","name":"sizing110","internal__Parent":"Foundations","rawValue":"120px"},{"value":"160px","type":"sizing","name":"sizing120","internal__Parent":"Foundations","rawValue":"160px"},{"value":"8px","type":"sizing","name":"iconSize005","internal__Parent":"Foundations","rawValue":"{sizing020}"},{"value":"16px","type":"sizing","name":"iconSize010","internal__Parent":"Foundations","rawValue":"{sizing040}"},{"value":"24px","type":"sizing","name":"iconSize020","internal__Parent":"Foundations","rawValue":"{sizing050}"},{"value":"32px","type":"sizing","name":"iconSize030","internal__Parent":"Foundations","rawValue":"{sizing060}"},{"value":"48px","type":"sizing","name":"iconSize040","internal__Parent":"Foundations","rawValue":"{sizing080}"},{"value":"64px","type":"sizing","name":"iconSize050","internal__Parent":"Foundations","rawValue":"{sizing090}"},{"value":"0px","type":"spacing","name":"space000","internal__Parent":"Foundations","rawValue":"{sizing000}"},{"value":"4px","type":"spacing","name":"space010","internal__Parent":"Foundations","rawValue":"{sizing010}"},{"value":"8px","type":"spacing","name":"space020","internal__Parent":"Foundations","rawValue":"{sizing020}"},{"value":"12px","type":"spacing","name":"space030","internal__Parent":"Foundations","rawValue":"{sizing030}"},{"value":"16px","type":"spacing","name":"space040","internal__Parent":"Foundations","rawValue":"{sizing040}"},{"value":"20px","type":"spacing","name":"space045","internal__Parent":"Foundations","rawValue":"{sizing045}"},{"value":"24px","type":"spacing","name":"space050","internal__Parent":"Foundations","rawValue":"{sizing050}"},{"value":"32px","type":"spacing","name":"space060","internal__Parent":"Foundations","rawValue":"{sizing060}"},{"value":"40px","type":"spacing","name":"space070","internal__Parent":"Foundations","rawValue":"{sizing070}"},{"value":"48px","type":"spacing","name":"space080","internal__Parent":"Foundations","rawValue":"{sizing080}"},{"value":"64px","type":"spacing","name":"space090","internal__Parent":"Foundations","rawValue":"{sizing090}"},{"value":"80px","type":"spacing","name":"space100","internal__Parent":"Foundations","rawValue":"{sizing100}"},{"value":"120px","type":"spacing","name":"space110","internal__Parent":"Foundations","rawValue":"{sizing110}"},{"value":"160px","type":"spacing","name":"space120","internal__Parent":"Foundations","rawValue":"{sizing120}"},{"value":"DM Sans, sans-serif","type":"fontFamilies","name":"fontFamily010","internal__Parent":"Foundations","rawValue":"DM Sans, sans-serif"},{"value":"Bitter, serif","type":"fontFamilies","name":"fontFamily020","internal__Parent":"Foundations","rawValue":"Bitter, serif"},{"value":"Poppins, sans-serif","type":"fontFamilies","name":"fontFamily030","internal__Parent":"Foundations","rawValue":"Poppins, sans-serif"},{"value":"12px","type":"fontSizes","name":"fontSize010","internal__Parent":"Foundations","rawValue":"12px"},{"value":"14px","type":"fontSizes","name":"fontSize020","internal__Parent":"Foundations","rawValue":"14px"},{"value":"16px","type":"fontSizes","name":"fontSize030","internal__Parent":"Foundations","rawValue":"16px"},{"value":"18px","type":"fontSizes","name":"fontSize040","internal__Parent":"Foundations","rawValue":"18px"},{"value":"20px","type":"fontSizes","name":"fontSize050","internal__Parent":"Foundations","rawValue":"20px"},{"value":"22px","type":"fontSizes","name":"fontSize060","internal__Parent":"Foundations","rawValue":"22px"},{"value":"24px","type":"fontSizes","name":"fontSize070","internal__Parent":"Foundations","rawValue":"24px"},{"value":"28px","type":"fontSizes","name":"fontSize080","internal__Parent":"Foundations","rawValue":"28px"},{"value":"32px","type":"fontSizes","name":"fontSize090","internal__Parent":"Foundations","rawValue":"32px"},{"value":"36px","type":"fontSizes","name":"fontSize100","internal__Parent":"Foundations","rawValue":"36px"},{"value":"40px","type":"fontSizes","name":"fontSize110","internal__Parent":"Foundations","rawValue":"40px"},{"value":"44px","type":"fontSizes","name":"fontSize120","internal__Parent":"Foundations","rawValue":"44px"},{"value":"48px","type":"fontSizes","name":"fontSize130","internal__Parent":"Foundations","rawValue":"48px"},{"value":"56px","type":"fontSizes","name":"fontSize140","internal__Parent":"Foundations","rawValue":"56px"},{"value":"64px","type":"fontSizes","name":"fontSize150","internal__Parent":"Foundations","rawValue":"64px"},{"value":"80px","type":"fontSizes","name":"fontSize160","internal__Parent":"Foundations","rawValue":"80px"},{"value":"-1%","type":"letterSpacing","name":"letterSpacing010","internal__Parent":"Foundations","rawValue":"-1%"},{"value":"-0.5%","type":"letterSpacing","name":"letterSpacing020","internal__Parent":"Foundations","rawValue":"-0.5%"},{"value":"0%","type":"letterSpacing","name":"letterSpacing030","internal__Parent":"Foundations","rawValue":"0%"},{"value":"0.5%","type":"letterSpacing","name":"letterSpacing040","internal__Parent":"Foundations","rawValue":"0.5%"},{"value":"1%","type":"letterSpacing","name":"letterSpacing050","internal__Parent":"Foundations","rawValue":"1%"},{"value":"100%","type":"lineHeights","name":"fontLineHeight010","internal__Parent":"Foundations","rawValue":"100%"},{"value":"112.5%","type":"lineHeights","name":"fontLineHeight020","internal__Parent":"Foundations","rawValue":"112.5%"},{"value":"125%","type":"lineHeights","name":"fontLineHeight030","internal__Parent":"Foundations","rawValue":"125%"},{"value":"150%","type":"lineHeights","name":"fontLineHeight040","internal__Parent":"Foundations","rawValue":"150%"},{"value":"175%","type":"lineHeights","name":"fontLineHeight050","internal__Parent":"Foundations","rawValue":"175%"},{"value":"200%","type":"lineHeights","name":"fontLineHeight060","internal__Parent":"Foundations","rawValue":"200%"},{"value":"Thin","type":"fontWeights","description":"Thin","name":"weight.100","internal__Parent":"Foundations","rawValue":"Thin"},{"value":"ExtraLight","type":"fontWeights","description":"Extra Light","name":"weight.200","internal__Parent":"Foundations","rawValue":"ExtraLight"},{"value":"Light","type":"fontWeights","description":"Light","name":"weight.300","internal__Parent":"Foundations","rawValue":"Light"},{"value":"Regular","type":"fontWeights","description":"Regular","name":"weight.400","internal__Parent":"Foundations","rawValue":"Regular"},{"value":"Medium","type":"fontWeights","description":"Medium","name":"weight.500","internal__Parent":"Foundations","rawValue":"Medium"},{"value":"SemiBold","type":"fontWeights","description":"Semi Bold","name":"weight.600","internal__Parent":"Foundations","rawValue":"SemiBold"},{"value":"Bold","type":"fontWeights","description":"Bold","name":"weight.700","internal__Parent":"Foundations","rawValue":"Bold"},{"value":"ExtraBold","type":"fontWeights","description":"Extra Bold","name":"weight.800","internal__Parent":"Foundations","rawValue":"ExtraBold"},{"value":"Black","type":"fontWeights","description":"Black","name":"weight.900","internal__Parent":"Foundations","rawValue":"Black"},{"value":"Ultra Condensed","type":"fontWeights","description":"Ultra condensed","name":"stretch.010","internal__Parent":"Foundations","rawValue":"Ultra Condensed"},{"value":"Extra Condensed","type":"fontWeights","description":"Extra condensed","name":"stretch.020","internal__Parent":"Foundations","rawValue":"Extra Condensed"},{"value":"Condensed","type":"fontWeights","description":"Condensed","name":"stretch.030","internal__Parent":"Foundations","rawValue":"Condensed"},{"value":"Semi Condensed","type":"fontWeights","description":"Semi condensed","name":"stretch.040","internal__Parent":"Foundations","rawValue":"Semi Condensed"},{"value":"Normal","type":"fontWeights","description":"Normal","name":"stretch.050","internal__Parent":"Foundations","rawValue":"Normal"},{"value":"Semi Expanded","type":"fontWeights","description":"Semi expanded","name":"stretch.060","internal__Parent":"Foundations","rawValue":"Semi Expanded"},{"value":"Expanded","type":"fontWeights","description":"Expanded","name":"stretch.070","internal__Parent":"Foundations","rawValue":"Expanded"},{"value":"Extra Expanded","type":"fontWeights","description":"Extra expanded","name":"stretch.080","internal__Parent":"Foundations","rawValue":"Extra Expanded"},{"value":"Ultra Expanded","type":"fontWeights","description":"Ultra expanded","name":"stretch.090","internal__Parent":"Foundations","rawValue":"Ultra Expanded"},{"value":"Normal","type":"fontWeights","description":"Normal","name":"style.Normal","internal__Parent":"Foundations","rawValue":"Normal"},{"value":"Italic","type":"fontWeights","description":"Italic","name":"style.Italic","internal__Parent":"Foundations","rawValue":"Italic"},{"value":"Oblique","type":"fontWeights","description":"Oblique","name":"style.Oblique","internal__Parent":"Foundations","rawValue":"Oblique"},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"56px","letterSpacing":"0%"},"type":"typography","description":"Used for large pieces of text content","name":"editorial.editorialDisplay010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize140}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"64px","letterSpacing":"0%"},"type":"typography","description":"Used for large pieces of text content","name":"editorial.editorialDisplay020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize150}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"80px","letterSpacing":"0%"},"type":"typography","description":"Used for large pieces of text content","name":"editorial.editorialDisplay030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize160}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"18px","letterSpacing":"0%"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize040}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"20px","letterSpacing":"0%"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize050}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"24px","letterSpacing":"0%"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize070}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"28px","letterSpacing":"0%"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline040","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize080}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"32px","letterSpacing":"0%"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline050","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize090}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"36px","letterSpacing":"0%"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline060","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize100}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"40px","letterSpacing":"0%"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline070","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize110}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"48px","letterSpacing":"0%"},"type":"typography","description":"Used for headline text content such as for cards and title bars","name":"editorial.editorialHeadline080","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize130}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Regular","lineHeight":"112.5%","fontSize":"16px","letterSpacing":"0%"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Regular","lineHeight":"112.5%","fontSize":"20px","letterSpacing":"0%"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize050}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Regular","lineHeight":"112.5%","fontSize":"24px","letterSpacing":"0%"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize070}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Regular","lineHeight":"112.5%","fontSize":"28px","letterSpacing":"0%"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline040","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize080}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Bitter, serif","fontWeight":"Regular","lineHeight":"112.5%","fontSize":"32px","letterSpacing":"0%"},"type":"typography","description":"Used for sub headline text content such as for cards","name":"editorial.editorialSubheadline050","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily020}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize090}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Regular","lineHeight":"150%","fontSize":"14px","letterSpacing":"0%"},"type":"typography","description":"Used for body text content such as for article text","name":"editorial.editorialParagraph010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Regular","lineHeight":"150%","fontSize":"16px","letterSpacing":"0%"},"type":"typography","description":"Used for body text content such as for article text","name":"editorial.editorialParagraph020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Regular","lineHeight":"150%","fontSize":"18px","letterSpacing":"0%"},"type":"typography","description":"Used for body text content such as for article text","name":"editorial.editorialParagraph030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize040}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Regular","lineHeight":"125%","fontSize":"22px","letterSpacing":"0%"},"type":"typography","description":"Used for quotes in body text content","name":"editorial.editorialQuote010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight030}","fontSize":"{fontSize060}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Regular","lineHeight":"125%","fontSize":"28px","letterSpacing":"0%"},"type":"typography","description":"Used for quotes in body text content","name":"editorial.editorialQuote020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight030}","fontSize":"{fontSize080}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"14px","letterSpacing":"0%"},"type":"typography","description":"Used for captions such as for the image with caption","name":"editorial.editorialCaption010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"12px","letterSpacing":"0%"},"type":"typography","description":"Used for non-interactive identifiers that are often defined by an editor, for example the author label in a card","name":"editorial.editorialLabel010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"14px","letterSpacing":"0%"},"type":"typography","description":"Used for non-interactive identifiers that are often defined by an editor, for example the author label in a card","name":"editorial.editorialLabel020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"16px","letterSpacing":"0%"},"type":"typography","description":"Used for non-interactive identifiers that are often defined by an editor, for example the author label in a card","name":"editorial.editorialLabel030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Bold","lineHeight":"112.5%","fontSize":"16px","letterSpacing":"0%"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Bold","lineHeight":"112.5%","fontSize":"18px","letterSpacing":"0%"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize040}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Bold","lineHeight":"112.5%","fontSize":"20px","letterSpacing":"0%"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize050}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Bold","lineHeight":"112.5%","fontSize":"22px","letterSpacing":"0%"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading040","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize060}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Bold","lineHeight":"112.5%","fontSize":"24px","letterSpacing":"0%"},"type":"typography","description":"Used for heading utility text such as for modals and drawers","name":"utility.utilityHeading050","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.700}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize070}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"14px","letterSpacing":"0%"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"16px","letterSpacing":"0%"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"18px","letterSpacing":"0%"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize040}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"20px","letterSpacing":"0%"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading040","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize050}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"112.5%","fontSize":"22px","letterSpacing":"0%"},"type":"typography","description":"Used for sub heading utility text such as for modals and drawers","name":"utility.utilitySubheading050","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight020}","fontSize":"{fontSize060}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Regular","lineHeight":"150%","fontSize":"12px","letterSpacing":"0%"},"type":"typography","description":"Used for text inputs and banners","name":"utility.utilityBody010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Regular","lineHeight":"150%","fontSize":"14px","letterSpacing":"0%"},"type":"typography","description":"Used for text inputs and banners","name":"utility.utilityBody020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Regular","lineHeight":"150%","fontSize":"16px","letterSpacing":"0%"},"type":"typography","description":"Used for text inputs and banners","name":"utility.utilityBody030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.400}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"12px","letterSpacing":"0%"},"type":"typography","description":"Used for text labels such as for menus and lists","name":"utility.utilityLabel010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"14px","letterSpacing":"0%"},"type":"typography","description":"Used for text labels such as for menus and lists","name":"utility.utilityLabel020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"16px","letterSpacing":"0%"},"type":"typography","description":"Used for text labels such as for menus and lists","name":"utility.utilityLabel030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"12px","letterSpacing":"0%"},"type":"typography","description":"Used for button text and standalone links","name":"utility.utilityButton010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"14px","letterSpacing":"0%"},"type":"typography","description":"Used for button text and standalone links","name":"utility.utilityButton020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"Poppins, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"16px","letterSpacing":"0%"},"type":"typography","description":"Used for button text and standalone links","name":"utility.utilityButton030","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily030}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize030}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"12px","letterSpacing":"0%"},"type":"typography","description":"Used for bylines and date time","name":"utility.utilityMeta010","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize010}","letterSpacing":"{letterSpacing030}"}},{"value":{"fontFamily":"DM Sans, sans-serif","fontWeight":"Medium","lineHeight":"150%","fontSize":"14px","letterSpacing":"0%"},"type":"typography","description":"Used for bylines and date time","name":"utility.utilityMeta020","internal__Parent":"Foundations","rawValue":{"fontFamily":"{fontFamily010}","fontWeight":"{weight.500}","lineHeight":"{fontLineHeight040}","fontSize":"{fontSize020}","letterSpacing":"{letterSpacing030}"}},{"value":"8px","type":"borderRadius","name":"borderRadiusDefault","internal__Parent":"Foundations","rawValue":"{sizing020}"},{"value":"4px","type":"borderRadius","name":"borderRadiusRounded010","internal__Parent":"Foundations","rawValue":"{sizing010}"},{"value":"8px","type":"borderRadius","name":"borderRadiusRounded020","internal__Parent":"Foundations","rawValue":"{sizing020}"},{"value":"12px","type":"borderRadius","name":"borderRadiusRounded030","internal__Parent":"Foundations","rawValue":"{sizing030}"},{"value":"16px","type":"borderRadius","name":"borderRadiusRounded040","internal__Parent":"Foundations","rawValue":"{sizing040}"},{"value":"24px","type":"borderRadius","name":"borderRadiusRounded050","internal__Parent":"Foundations","rawValue":"{sizing050}"},{"value":"0px","type":"borderRadius","name":"borderRadiusSharp","internal__Parent":"Foundations","rawValue":"{sizing000}"},{"value":"50%","type":"borderRadius","name":"borderRadiusCircle","internal__Parent":"Foundations","rawValue":"50%"},{"value":"20rem","type":"borderRadius","name":"borderRadiusPill","internal__Parent":"Foundations","rawValue":"20rem"},{"value":"1px","type":"borderWidth","name":"borderWidthDefault","internal__Parent":"Foundations","rawValue":"{borderWidth010}"},{"value":"0px","type":"borderWidth","name":"borderWidth000","internal__Parent":"Foundations","rawValue":"0px"},{"value":"1px","type":"borderWidth","name":"borderWidth010","internal__Parent":"Foundations","rawValue":"1px"},{"value":"2px","type":"borderWidth","name":"borderWidth020","internal__Parent":"Foundations","rawValue":"2px"},{"value":"4px","type":"borderWidth","name":"borderWidth030","internal__Parent":"Foundations","rawValue":"4px"},{"value":{"x":0,"y":0.5,"blur":2,"spread":0,"color":"#11111114","type":"dropShadow"},"type":"boxShadow","description":"Default states of cards and active states of buttons","name":"shadow010","internal__Parent":"Foundations","rawValue":{"x":"0","y":"0.5","blur":"2","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"}},{"value":{"x":0,"y":2,"blur":4,"spread":0,"color":"#11111114","type":"dropShadow"},"type":"boxShadow","description":"Notification badges","name":"shadow020","internal__Parent":"Foundations","rawValue":{"x":"0","y":"2","blur":"4","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"}},{"value":{"x":0,"y":4,"blur":8,"spread":0,"color":"#11111114","type":"dropShadow"},"type":"boxShadow","description":"Navigation menu bars","name":"shadow030","internal__Parent":"Foundations","rawValue":{"x":"0","y":"4","blur":"8","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"}},{"value":{"x":0,"y":8,"blur":16,"spread":0,"color":"#11111114","type":"dropShadow"},"type":"boxShadow","description":"Hover states of cards and button hover states","name":"shadow040","internal__Parent":"Foundations","rawValue":{"x":"0","y":"8","blur":"16","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"}},{"value":{"x":0,"y":16,"blur":24,"spread":0,"color":"#11111114","type":"dropShadow"},"type":"boxShadow","description":"Pickers and popovers","name":"shadow050","internal__Parent":"Foundations","rawValue":{"x":"0","y":"16","blur":"24","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"}},{"value":{"x":0,"y":20,"blur":32,"spread":0,"color":"#11111114","type":"dropShadow"},"type":"boxShadow","description":"Modals and dialogs","name":"shadow060","internal__Parent":"Foundations","rawValue":{"x":"0","y":"20","blur":"32","spread":"0","color":"rgba({black},0.08)","type":"dropShadow"}},{"value":"https://corsproxy.io/?","type":"other","name":"CORS service","internal__Parent":"Foundations","rawValue":"https://corsproxy.io/?"}]}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************************************!*\
  !*** ./benchmark/tests/applyToDocument.ts ***!
  \********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var figma_api_stub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! figma-api-stub */ "../../node_modules/figma-api-stub/dist/index.js");
/* harmony import */ var _mocks_swapThemeMock_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../mocks/swapThemeMock.json */ "./benchmark/mocks/swapThemeMock.json");
/* harmony import */ var _mocks_flat_file_children_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../mocks/flat-file_children.json */ "./benchmark/mocks/flat-file_children.json");
/* harmony import */ var _plugin_asyncMessageHandlers_swapStyles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/plugin/asyncMessageHandlers/swapStyles */ "./src/plugin/asyncMessageHandlers/swapStyles.ts");
/* harmony import */ var _constants_UpdateMode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/constants/UpdateMode */ "./src/constants/UpdateMode.ts");
// @ts-nocheck





// There's a few typescript issues with the mock...
__webpack_require__.g.figma = (0,figma_api_stub__WEBPACK_IMPORTED_MODULE_0__.createFigma)({
    simulateErrors: true
});
_mocks_flat_file_children_json__WEBPACK_IMPORTED_MODULE_2__.forEach(function(child) {
    child.parent = figma.currentPage;
});
__webpack_require__.g.figma._currentPage.children = _mocks_flat_file_children_json__WEBPACK_IMPORTED_MODULE_2__; // eslint-disable-line no-underscore-dangle
(0,_plugin_asyncMessageHandlers_swapStyles__WEBPACK_IMPORTED_MODULE_3__.swapStyles)(_mocks_swapThemeMock_json__WEBPACK_IMPORTED_MODULE_1__.activeTheme, _mocks_swapThemeMock_json__WEBPACK_IMPORTED_MODULE_1__.themes, _constants_UpdateMode__WEBPACK_IMPORTED_MODULE_4__.UpdateMode.DOCUMENT);

})();

/******/ })()
;
//# sourceMappingURL=applyToDocument.js.map