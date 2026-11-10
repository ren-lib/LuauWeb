
import { instances } from "./instance-store.js";
import { applyOpacity, getColorRGB, getUDimValue } from "./instance-utils.js";
export { instances };
let NextId = 0;




import { renderDecorations, getContentElement, applyListLayout, applyListGap, applyUIPadding } from "./layout.js";
import { setInstanceProperty, getInstanceProperty } from "./instance-properties.js";
import { applySize, applyPosition, scheduleAutomaticCanvasSize, updateAutomaticCanvasSize, applyImage, scheduleAutomaticSize, updateAutomaticSize, applyBackgroundColor, applyScrollingStyles, observeScrollingFrameSize } from "./instance-renderer.js";
import { setParent } from "./instance-tree.js";
import { destroyInstance } from "./instance-lifecycle.js";
import { connectEvent, disconnectEvent } from "./instance-events.js";
import { getInstancePropertySpec } from "./instance-api.js";
import { createInstanceDOM } from "./instance-dom.js";
export { destroyInstance, connectEvent, disconnectEvent };

;







class WebInstance {
    constructor(className) {
        this.ClassName = className;
        this._name = className;

        const DOM = createInstanceDOM(className, () => ++NextId);
        this.Element = DOM.Element;
        this.CanvasElement = DOM.CanvasElement;
        this.ImageElement = DOM.ImageElement;
        this.ImageTintFilter = DOM.ImageTintFilter;
        this.ImageTintFilterId = DOM.ImageTintFilterId;
        this._canvasSize = { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 0 } };
        this._canvasPosition = { X: 0, Y: 0 };
        this._automaticCanvasSize = "None";
        this._scrollingEnabled = true;
        this._scrollingDirection = "XY";
        this._scrollBarThickness = 12;

        this._parent = null;
        this._visible = true;
        this._children = new Set();
        this._connections = new Map();
        this._destroyed = false;

        this._text = "";
        this._richText = className === "TextLabel";
        this._textColor3 = "rgb(0, 0, 0)";
        this._textSize = 14;
        this._font = "Arial";
        this._textXAlignment = "Left";
        this._textYAlignment = "Center";
        this._image = "";
        this._soundId = "";
        this._volume = 1;
        this._playbackSpeed = 1;
        this._imageTransparency = 0;
        this._imageColor3 = "rgb(255, 255, 255)";
        this._scaleType = "Stretch";

        this._size = {
            X: { Scale: 0, Offset: 0 },
            Y: { Scale: 0, Offset: 0 }
        };

        this._position = {
            X: { Scale: 0, Offset: 0 },
            Y: { Scale: 0, Offset: 0 }
        };

        this._anchorPoint = {
            X: 0,
            Y: 0
        };

        this._layoutOrder = 0;
        this._zIndex = 1;
this._displayOrder = 0;
this._automaticSize = "None";
this._backgroundColor3 = "transparent";
this._backgroundTransparency = className === "ScreenGui" ? 1 : 0;

        this._cornerRadius = {
            Scale: 0,
            Offset: 8
        };

        this._strokeColor = "rgb(255, 255, 255)";
        this._strokeThickness = 1;
        this._strokeTransparency = 0;

        this._uiCorner = null;
        this._uiStroke = null;
        this._uiListLayout = null;
        this._uiPadding = null;
        this._paddingObserver = null;

        this._fillDirection = "Vertical";
        this._listPadding = { Scale: 0, Offset: 0 };
        this._horizontalAlignment = "Left";
        this._verticalAlignment = "Top";
        this._sortOrder = "LayoutOrder";

       this._paddingRadius = { Scale: 0, Offset: 0 };
this._paddingTop = { Scale: 0, Offset: 0 };
this._paddingBottom = { Scale: 0, Offset: 0 };
this._paddingLeft = { Scale: 0, Offset: 0 };
this._paddingRight = { Scale: 0, Offset: 0 };

        if (!this.Element) {
            return;
        }

        this.Element.style.boxSizing = "border-box";
        this.Element.style.zIndex = this._zIndex;

       if (className === "ScreenGui") {
    this.Element.style.width = "100%";
    this.Element.style.height = "100%";
    this.Element.style.position = "fixed";
    this.Element.style.inset = "0";
    this.Element.style.zIndex = "0";
    this.Element.style.backgroundColor = "transparent";
    this.Element.style.pointerEvents = "none";
    this.Element.style.boxSizing = "border-box";
}

        if ([
    "Frame",
    "ScrollingFrame",
    "TextLabel",
    "TextButton",
    "ImageLabel",
    "ImageButton"
].includes(className)) {
    this.Element.style.position = "absolute";
}

        if (["TextLabel", "TextButton"].includes(className)) {
            this.Element.style.color = this._textColor3;
            this.Element.style.fontSize = `${this._textSize}px`;
            this.Element.style.textAlign = this._textXAlignment.toLowerCase();
            this.Element.style.verticalAlign = this._textYAlignment.toLowerCase();
        }

        if (className === "TextLabel") {
            this.Element.style.display = "block";
            this.Element.style.whiteSpace = "pre-wrap";
            this.Element.style.overflowWrap = "break-word";
        }

        if (className === "ScrollingFrame") {
            this.applyScrollingStyles();
        }

        if (["TextButton", "ImageButton"].includes(className)) {
    this.Element.style.cursor = "pointer";
    this.Element.style.border = "0";
    this.Element.style.padding = "0";
    this.Element.style.font = "inherit";
    this.Element.style.backgroundColor = "transparent";
    this.Element.style.pointerEvents = "auto";
}
    }
    applySize(...args) { return applySize(this, ...args); }
    applyPosition(...args) { return applyPosition(this, ...args); }
    scheduleAutomaticCanvasSize(...args) { return scheduleAutomaticCanvasSize(this, ...args); }
    updateAutomaticCanvasSize(...args) { return updateAutomaticCanvasSize(this, ...args); }
    applyImage(...args) { return applyImage(this, ...args); }
    scheduleAutomaticSize(...args) { return scheduleAutomaticSize(this, ...args); }
    updateAutomaticSize(...args) { return updateAutomaticSize(this, ...args); }
    applyBackgroundColor(...args) { return applyBackgroundColor(this, ...args); }
    applyScrollingStyles(...args) { return applyScrollingStyles(this, ...args); }
    observeScrollingFrameSize(...args) { return observeScrollingFrameSize(this, ...args); }

    setProperty(property, value) {
        setInstanceProperty(this, property, value);
    }

    getProperty(property) {
        return getInstanceProperty(this, property);
    }
}




export function createInstance(className) {
    const id = ++NextId;
    const instance = new WebInstance(className);

    instances.set(id, instance);

    if (className === "ScreenGui") {
        const app = document.querySelector("#app");

        if (!app) {
            throw new Error("Element #app does not exist");
        }

        app.appendChild(instance.Element);
    }

    instance.observeScrollingFrameSize();
    instance.scheduleAutomaticCanvasSize();
    return id;
}


export function setProperty(id, property, value) {
    const instance = instances.get(id);

    if (!instance || instance._destroyed) {
        throw new Error(`Instance ${id} does not exist`);
    }
    

    const PropertySpec = getInstancePropertySpec(property);
    if (PropertySpec?.readOnly) {
        throw new Error(`${property} is read-only`);
    }
    if (PropertySpec && !PropertySpec.classNames.includes(instance.ClassName)) {
        throw new Error(`${property} is not supported by ${instance.ClassName}`);
    }

    if (property === "Parent") {
        setParent(id, value);
        return;
    }

    if ([
        "UICorner",
        "UIStroke",
        "UIListLayout",
        "UIPadding"
    ].includes(instance.ClassName)) {
        instance.setProperty(property, value);
        return;
    }

    if (!instance.Element) {
        return;
    }

    instance.setProperty(property, value);
    instance._parent?.scheduleAutomaticSize();
}

export function getProperty(id, property) {
    const instance = instances.get(id);

    if (!instance || instance._destroyed) {
        throw new Error(`Instance ${id} does not exist`);
    }

    const PropertySpec = getInstancePropertySpec(property);
    if (PropertySpec && !PropertySpec.classNames.includes(instance.ClassName)) {
        throw new Error(`${property} is not supported by ${instance.ClassName}`);
    }

    return instance.getProperty(property);
}







export function udimNew(scale, offset) {
    return {
        Scale: scale,
        Offset: offset
    };
}

export function udim2New(xScale, xOffset, yScale, yOffset) {
    return {
        X: { Scale: xScale, Offset: xOffset },
        Y: { Scale: yScale, Offset: yOffset }
    };
}

export function udim2FromScale(xScale, yScale) {
    return udim2New(xScale, 0, yScale, 0);
}

export function udim2FromOffset(xOffset, yOffset) {
    return udim2New(0, xOffset, 0, yOffset);
}

export function vector2New(x, y) {
    return {
        X: x,
        Y: y
    };
}

export function color3FromRGB(r, g, b) {
    const normalize = value => {
        value = Number(value);

        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.max(0, Math.min(255, Math.floor(value)));
    };

    return `rgb(${normalize(r)}, ${normalize(g)}, ${normalize(b)})`;
}

export function getTweenProperty(id, property) {
    const instance = instances.get(id);

    if (!instance || instance._destroyed) {
        throw new Error(`Instance ${id} does not exist`);
    }

    const Properties = {
        Size: "_size",
        Position: "_position",
        AnchorPoint: "_anchorPoint",
        BackgroundColor3: "_backgroundColor3",
        BackgroundTransparency: "_backgroundTransparency"
    };

    if (Object.prototype.hasOwnProperty.call(Properties, property)) {
        return instance[Properties[property]];
    }

    if (property === "TextColor3") {
        return instance.Element
            ? getComputedStyle(instance.Element).color
            : undefined;
    }

    if (property === "TextSize") {
        return instance.Element
            ? Number.parseFloat(getComputedStyle(instance.Element).fontSize)
            : undefined;
    }

    const PropertySpec = getInstancePropertySpec(property);
    if (PropertySpec && !PropertySpec.classNames.includes(instance.ClassName)) {
        throw new Error(`${property} is not supported by ${instance.ClassName}`);
    }

    return instance.getProperty(property);
}
