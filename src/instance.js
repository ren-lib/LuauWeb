
const instances = new Map();
let NextId = 0;
let NextConnectionId = 0;

const FontStyles = {
    Arial: ["Arial, sans-serif", 400],
    ArialBold: ["Arial, sans-serif", 700],
    SourceSans: ['"Source Sans 3", Arial, sans-serif', 400],
    SourceSansBold: ['"Source Sans 3", Arial, sans-serif', 700],
    Montserrat: ['"Montserrat", sans-serif', 400],
    MontserratMedium: ['"Montserrat", sans-serif', 500],
    MontserratSemibold: ['"Montserrat", sans-serif', 600],
    MontserratBold: ['"Montserrat", sans-serif', 700],
    Code: ["monospace", 400]
};

const EventTypes = {
    MouseButton1Click: "click",
    MouseEnter: "mouseenter",
    MouseLeave: "mouseleave"
};

function applyOpacity(color, opacity) {
    opacity = Math.max(0, Math.min(1, opacity));

    if (opacity === 0) {
        return "transparent";
    }

    const Hex = typeof color === "string"
        ? color.match(/^#([0-9a-f]{6})$/i)
        : null;

    if (Hex) {
        const Value = Hex[1];

        const R = parseInt(Value.slice(0, 2), 16);
        const G = parseInt(Value.slice(2, 4), 16);
        const B = parseInt(Value.slice(4, 6), 16);

        return `rgba(${R}, ${G}, ${B}, ${opacity})`;
    }

    const RGB = typeof color === "string"
        ? color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i)
        : null;

    if (RGB) {
        const R = Number(RGB[1]);
        const G = Number(RGB[2]);
        const B = Number(RGB[3]);
        const Alpha = RGB[4] === undefined ? 1 : Number(RGB[4]);

        return `rgba(${R}, ${G}, ${B}, ${Alpha * opacity})`;
    }

    return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
}

function getColorRGB(color) {
    if (typeof color !== "string") {
        return [255, 255, 255];
    }

    const Hex = color.match(/^#([0-9a-f]{6})$/i);

    if (Hex) {
        const Value = Hex[1];

        return [
            parseInt(Value.slice(0, 2), 16),
            parseInt(Value.slice(2, 4), 16),
            parseInt(Value.slice(4, 6), 16)
        ];
    }

    const RGB = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);

    if (RGB) {
        return [
            Number(RGB[1]),
            Number(RGB[2]),
            Number(RGB[3])
        ];
    }

    return [255, 255, 255];
}

function getUDimValue(value, size) {
    if (!value) {
        return 0;
    }

    return size * (value.Scale || 0) + (value.Offset || 0);
}

class WebInstance {
    constructor(className) {
        this.ClassName = className;

        this.Element = [
            "UICorner",
            "UIStroke",
            "UIListLayout",
            "UIPadding"
        ].includes(className)
            ? null
            : className === "ScreenGui"
                ? document.createElement("div")
                : ["TextButton", "ImageButton"].includes(className)
                    ? document.createElement("button")
                    : className === "TextLabel"
                        ? document.createElement("span")
                        : document.createElement("div");

        this.ImageElement = null;
        this.ImageTintFilter = null;
        this.ImageTintFilterId = null;

        if (["ImageLabel", "ImageButton"].includes(className)) {
            this.ImageElement = document.createElement("img");
            this.ImageElement.draggable = false;
            this.ImageElement.style.cssText = `
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            `;

            this.Element.appendChild(this.ImageElement);

            this.ImageTintFilterId = `ImageTint_${++NextId}`;

            const SVG = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );

            SVG.style.position = "absolute";
            SVG.style.width = "0";
            SVG.style.height = "0";
            SVG.style.pointerEvents = "none";

            const Filter = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "filter"
            );

            Filter.setAttribute("id", this.ImageTintFilterId);
            Filter.setAttribute("color-interpolation-filters", "sRGB");

            const Matrix = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "feColorMatrix"
            );

            Matrix.setAttribute("type", "matrix");

            Filter.appendChild(Matrix);
            SVG.appendChild(Filter);
            document.body.appendChild(SVG);

            this.ImageTintFilter = {
                SVG,
                Filter,
                Matrix
            };
        }

        this._parent = null;
        this._children = new Set();
        this._connections = new Map();
        this._destroyed = false;

        this._text = "";
        this._image = "";
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
        this._automaticSize = "None";
        this._backgroundColor3 = "transparent";
        this._backgroundTransparency = 0;

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

        this._paddingTop = { Scale: 0, Offset: 0 };
        this._paddingBottom = { Scale: 0, Offset: 0 };
        this._paddingLeft = { Scale: 0, Offset: 0 };
        this._paddingRight = { Scale: 0, Offset: 0 };

        if (!this.Element) {
            return;
        }

        this.Element.style.boxSizing = "border-box";

        if (className === "ScreenGui") {
            this.Element.style.width = "100%";
            this.Element.style.height = "100vh";
            this.Element.style.minHeight = "100vh";
            this.Element.style.position = "relative";
            this.Element.style.boxSizing = "border-box";
        }

        if ([
            "Frame",
            "TextLabel",
            "TextButton",
            "ImageLabel",
            "ImageButton"
        ].includes(className)) {
            this.Element.style.position = "absolute";
        }

        if (className === "TextLabel") {
            this.Element.style.display = "block";
            this.Element.style.whiteSpace = "pre-wrap";
            this.Element.style.overflowWrap = "break-word";
        }

        if (["TextButton", "ImageButton"].includes(className)) {
            this.Element.style.cursor = "pointer";
            this.Element.style.border = "0";
            this.Element.style.padding = "0";
            this.Element.style.font = "inherit";
            this.Element.style.backgroundColor = "transparent";
        }
    }

    applySize() {
        if (!this.Element) {
            return;
        }

        const AutoX = this._automaticSize === "X" || this._automaticSize === "XY";
        const AutoY = this._automaticSize === "Y" || this._automaticSize === "XY";

        this.Element.style.width = AutoX
            ? "max-content"
            : this._size.X.Scale === 0
                ? `${this._size.X.Offset}px`
                : `calc(${this._size.X.Scale * 100}% + ${this._size.X.Offset}px)`;

        this.Element.style.height = AutoY
            ? "auto"
            : this._size.Y.Scale === 0
                ? `${this._size.Y.Offset}px`
                : `calc(${this._size.Y.Scale * 100}% + ${this._size.Y.Offset}px)`;

        this.scheduleAutomaticSize();
    }

    applyPosition() {
        if (!this.Element) {
            return;
        }

        this.Element.style.left =
            `calc(${this._position.X.Scale * 100}% + ${this._position.X.Offset}px)`;

        this.Element.style.top =
            `calc(${this._position.Y.Scale * 100}% + ${this._position.Y.Offset}px)`;

        this.Element.style.transform =
            `translate(${-this._anchorPoint.X * 100}%, ${-this._anchorPoint.Y * 100}%)`;
    }

    applyImage() {
        if (!this.ImageElement) {
            return;
        }

        if (this._image) {
            this.ImageElement.src = this._image;
        } else {
            this.ImageElement.removeAttribute("src");
        }

        const ScaleTypes = {
            Stretch: "fill",
            Fit: "contain",
            Crop: "cover",
            Tile: "fill"
        };

        this.ImageElement.style.objectFit =
            ScaleTypes[this._scaleType] || "fill";

        this.ImageElement.style.opacity = 1 - this._imageTransparency;

        if (this.ImageTintFilter) {
            const [R, G, B] = getColorRGB(this._imageColor3);

            const Matrix = [
                R / 255, 0, 0, 0, 0,
                0, G / 255, 0, 0, 0,
                0, 0, B / 255, 0, 0,
                0, 0, 0, 1, 0
            ];

            this.ImageTintFilter.Matrix.setAttribute(
                "values",
                Matrix.join(" ")
            );

            this.ImageElement.style.filter =
                `url(#${this.ImageTintFilterId})`;
        }
    }

    scheduleAutomaticSize() {
        if (
            this.ClassName !== "Frame" ||
            this._automaticSize === "None" ||
            this._destroyed
        ) {
            return;
        }

        if (this._autoSizeScheduled) {
            return;
        }

        this._autoSizeScheduled = true;

        requestAnimationFrame(() => {
            this._autoSizeScheduled = false;
            this.updateAutomaticSize();
        });
    }

    updateAutomaticSize() {
        if (
            this.ClassName !== "Frame" ||
            !this.Element.isConnected ||
            this.Element.hidden
        ) {
            return;
        }

        const AutoX = this._automaticSize === "X" || this._automaticSize === "XY";
        const AutoY = this._automaticSize === "Y" || this._automaticSize === "XY";

        if (!AutoX && !AutoY) {
            return;
        }

        const ParentRect = this.Element.getBoundingClientRect();

        let Width = 0;
        let Height = 0;

        for (const Child of this.Element.children) {
            if (Child.hidden) {
                continue;
            }

            const Rect = Child.getBoundingClientRect();

            Width = Math.max(Width, Rect.right - ParentRect.left);
            Height = Math.max(Height, Rect.bottom - ParentRect.top);
        }

        if (AutoX) {
            this.Element.style.width = `${Math.ceil(Math.max(0, Width))}px`;
        }

        if (AutoY) {
            this.Element.style.height = `${Math.ceil(Math.max(0, Height))}px`;
        }
    }

    applyBackgroundColor() {
        if (!this.Element) {
            return;
        }

        this.Element.style.backgroundColor = applyOpacity(
            this._backgroundColor3,
            1 - this._backgroundTransparency
        );
    }

    setProperty(property, value) {
        switch (property) {
            case "Size":
                this._size = value;
                this.applySize();
                break;

            case "Position":
                this._position = value;
                this.applyPosition();
                break;

            case "AnchorPoint":
                this._anchorPoint = value;
                this.applyPosition();
                break;

            case "AutomaticSize":
                this._automaticSize = value;
                this.applySize();
                break;

            case "LayoutOrder":
                this._layoutOrder = Number(value) || 0;
                this.Element.style.order = this._layoutOrder;
                break;

            case "Visible":
                this.Element.hidden = !value;
                this._parent?.scheduleAutomaticSize();
                break;

            case "BackgroundColor3":
                this._backgroundColor3 = value;
                this.applyBackgroundColor();
                break;

            case "BackgroundTransparency":
                this._backgroundTransparency = Math.max(0, Math.min(1, Number(value)));
                this.applyBackgroundColor();
                break;

            case "Image":
                this._image = String(value || "");
                this.applyImage();
                break;

            case "ImageColor3":
                this._imageColor3 = value;
                this.applyImage();
                break;

            case "ImageTransparency":
                this._imageTransparency = Math.max(0, Math.min(1, Number(value)));
                this.applyImage();
                break;

            case "ScaleType":
                this._scaleType = value;
                this.applyImage();
                break;

            case "TextColor3":
                this.Element.style.color = value;
                break;

            case "Font": {
                const Font = FontStyles[value] || FontStyles.Arial;

                this.Element.style.fontFamily = Font[0];
                this.Element.style.fontWeight = Font[1];
                break;
            }

            case "Text":
                this._text = String(value);
                this.Element.textContent = this._text;
                this._parent?.scheduleAutomaticSize();
                break;

            case "TextSize":
                this.Element.style.fontSize = `${value}px`;
                this._parent?.scheduleAutomaticSize();
                break;

            case "CornerRadius":
                this._cornerRadius = value;
                this._parent && renderDecorations(this._parent);
                break;

            case "Color":
                this._strokeColor = value;
                this._parent && renderDecorations(this._parent);
                break;

            case "Thickness":
                this._strokeThickness = Math.max(0, Number(value));
                this._parent && renderDecorations(this._parent);
                break;

            case "Transparency":
                this._strokeTransparency = Math.max(0, Math.min(1, Number(value)));
                this._parent && renderDecorations(this._parent);
                break;

            case "FillDirection":
                this._fillDirection = value;
                this._parent && applyListLayout(this._parent);
                break;

            case "Padding":
                this._listPadding = value;
                this._parent && applyListLayout(this._parent);
                break;

            case "HorizontalAlignment":
                this._horizontalAlignment = value;
                this._parent && applyListLayout(this._parent);
                break;

            case "VerticalAlignment":
                this._verticalAlignment = value;
                this._parent && applyListLayout(this._parent);
                break;

            case "SortOrder":
                this._sortOrder = value;
                this._parent && applyListLayout(this._parent);
                break;

            case "PaddingTop":
                this._paddingTop = value;
                this._parent && applyUIPadding(this._parent);
                break;

            case "PaddingBottom":
                this._paddingBottom = value;
                this._parent && applyUIPadding(this._parent);
                break;

            case "PaddingLeft":
                this._paddingLeft = value;
                this._parent && applyUIPadding(this._parent);
                break;

            case "PaddingRight":
                this._paddingRight = value;
                this._parent && applyUIPadding(this._parent);
                break;
        }
    }

    getProperty(property) {
        switch (property) {
            case "Text":
                return this._text;

            case "Image":
                return this._image;

            case "ImageColor3":
                return this._imageColor3;

            case "ImageTransparency":
                return this._imageTransparency;

            case "ScaleType":
                return this._scaleType;

            case "ClassName":
                return this.ClassName;

            case "AutomaticSize":
                return this._automaticSize;

            case "Visible":
                return this.Element ? !this.Element.hidden : undefined;

            case "LayoutOrder":
                return this._layoutOrder;

            case "CornerRadius":
                return this._cornerRadius;

            case "Color":
                return this._strokeColor;

            case "Thickness":
                return this._strokeThickness;

            case "Transparency":
                return this._strokeTransparency;

            case "FillDirection":
                return this._fillDirection;

            case "Padding":
                return this.ClassName === "UIListLayout"
                    ? this._listPadding
                    : this._paddingTop;

            case "HorizontalAlignment":
                return this._horizontalAlignment;

            case "VerticalAlignment":
                return this._verticalAlignment;

            case "SortOrder":
                return this._sortOrder;

            case "PaddingTop":
                return this._paddingTop;

            case "PaddingBottom":
                return this._paddingBottom;

            case "PaddingLeft":
                return this._paddingLeft;

            case "PaddingRight":
                return this._paddingRight;
        }

        return undefined;
    }
}

function renderDecorations(parent) {
    if (!parent?.Element) {
        return;
    }

    const Corner = parent._uiCorner;
    const Stroke = parent._uiStroke;

    if (Corner && !Corner._destroyed) {
        const Radius = Corner._cornerRadius;

        parent.Element.style.borderRadius =
            `calc(${Radius.Scale * 100}% + ${Radius.Offset}px)`;
    } else {
        parent.Element.style.borderRadius = "";
    }

    if (Stroke && !Stroke._destroyed && Stroke._strokeThickness > 0) {
        parent.Element.style.outline =
            `${Stroke._strokeThickness}px solid ${applyOpacity(
                Stroke._strokeColor,
                1 - Stroke._strokeTransparency
            )}`;

        parent.Element.style.outlineOffset = "0px";
    } else {
        parent.Element.style.outline = "";
        parent.Element.style.outlineOffset = "";
    }
}

function applyListLayout(parent) {
    if (!parent?.Element) {
        return;
    }

    const Layout = parent._uiListLayout;

    if (!Layout || Layout._destroyed) {
        parent.Element.style.display = "";
        parent.Element.style.flexDirection = "";
        parent.Element.style.justifyContent = "";
        parent.Element.style.alignItems = "";
        parent.Element.style.gap = "";

        for (const childId of parent._children) {
            const Child = instances.get(childId);

            if (!Child?.Element) {
                continue;
            }

            Child.Element.style.position = "absolute";
            Child.Element.style.flexShrink = "";
            Child.Element.style.flexGrow = "";
            Child.Element.style.minWidth = "";
            Child.Element.style.minHeight = "";
            Child.applyPosition();
        }

        return;
    }

    const Horizontal = Layout._fillDirection === "Horizontal";

    parent.Element.style.display = "flex";
    parent.Element.style.flexDirection = Horizontal ? "row" : "column";

    const MainAlignment = Horizontal
        ? Layout._horizontalAlignment
        : Layout._verticalAlignment;

    const CrossAlignment = Horizontal
        ? Layout._verticalAlignment
        : Layout._horizontalAlignment;

    const Justify = {
        Left: "flex-start",
        Right: "flex-end",
        Center: "center",
        Top: "flex-start",
        Bottom: "flex-end"
    };

    const Align = {
        Left: "flex-start",
        Right: "flex-end",
        Center: "center",
        Top: "flex-start",
        Bottom: "flex-end"
    };

    parent.Element.style.justifyContent = Justify[MainAlignment] || "flex-start";
    parent.Element.style.alignItems = Align[CrossAlignment] || "flex-start";

    for (const childId of parent._children) {
        const Child = instances.get(childId);

        if (!Child?.Element) {
            continue;
        }

        Child.Element.style.position = "relative";
        Child.Element.style.left = "auto";
        Child.Element.style.top = "auto";
        Child.Element.style.transform = "none";
        Child.Element.style.flexShrink = "0";
        Child.Element.style.flexGrow = "0";
        Child.Element.style.minWidth = "0";
        Child.Element.style.minHeight = "0";
        Child.Element.style.order = Layout._sortOrder === "LayoutOrder"
            ? Child._layoutOrder
            : 0;
    }

    applyListGap(parent);
    parent.scheduleAutomaticSize();
}

function applyListGap(parent) {
    const Layout = parent?._uiListLayout;

    if (!Layout || Layout._destroyed || !parent.Element) {
        return;
    }

    const Horizontal = Layout._fillDirection === "Horizontal";
    const Size = Horizontal
        ? parent.Element.clientWidth
        : parent.Element.clientHeight;

    parent.Element.style.gap = `${getUDimValue(Layout._listPadding, Size)}px`;
}

function applyUIPadding(parent) {
    if (!parent?.Element) {
        return;
    }

    const Padding = parent._uiPadding;

    if (!Padding || Padding._destroyed) {
        parent.Element.style.padding = "";
        parent._paddingObserver?.disconnect();
        parent._paddingObserver = null;
        return;
    }

    const Width = parent.Element.clientWidth;
    const Height = parent.Element.clientHeight;

    parent.Element.style.paddingTop =
        `${getUDimValue(Padding._paddingTop, Height)}px`;

    parent.Element.style.paddingBottom =
        `${getUDimValue(Padding._paddingBottom, Height)}px`;

    parent.Element.style.paddingLeft =
        `${getUDimValue(Padding._paddingLeft, Width)}px`;

    parent.Element.style.paddingRight =
        `${getUDimValue(Padding._paddingRight, Width)}px`;

    if (!parent._paddingObserver && typeof ResizeObserver !== "undefined") {
        parent._paddingObserver = new ResizeObserver(() => {
            applyUIPadding(parent);
            applyListGap(parent);
        });

        parent._paddingObserver.observe(parent.Element);
    }
}

function setParent(id, value) {
    const instance = instances.get(id);

    if (!instance) {
        throw new Error(`Instance ${id} does not exist`);
    }

    const parent = value == null ? null : instances.get(value);

    if (value != null && !parent) {
        throw new Error(`Parent ${value} does not exist`);
    }

    if (parent && !parent.Element) {
        throw new Error(`${parent.ClassName} cannot be used as a Parent`);
    }

    for (let current = parent; current; current = current._parent) {
        if (current === instance) {
            throw new Error("Cannot create a circular Parent relationship");
        }
    }

    const oldParent = instance._parent;

    if (oldParent) {
        oldParent._children.delete(id);

        if (oldParent._uiCorner === instance) {
            oldParent._uiCorner = null;
        }

        if (oldParent._uiStroke === instance) {
            oldParent._uiStroke = null;
        }

        if (oldParent._uiListLayout === instance) {
            oldParent._uiListLayout = null;
            applyListLayout(oldParent);
        }

        if (oldParent._uiPadding === instance) {
            oldParent._uiPadding = null;
            applyUIPadding(oldParent);
        }

        renderDecorations(oldParent);
        oldParent.scheduleAutomaticSize();
    }

    instance._parent = parent;

    if (parent) {
        if (
            instance.ClassName === "UIListLayout" &&
            parent._uiListLayout &&
            parent._uiListLayout !== instance
        ) {
            throw new Error("A parent can only have one UIListLayout");
        }

        if (
            instance.ClassName === "UIPadding" &&
            parent._uiPadding &&
            parent._uiPadding !== instance
        ) {
            throw new Error("A parent can only have one UIPadding");
        }

        parent._children.add(id);

        if (instance.ClassName === "UICorner") {
            parent._uiCorner = instance;
            renderDecorations(parent);
        } else if (instance.ClassName === "UIStroke") {
            parent._uiStroke = instance;
            renderDecorations(parent);
        } else if (instance.ClassName === "UIListLayout") {
            parent._uiListLayout = instance;
            applyListLayout(parent);
        } else if (instance.ClassName === "UIPadding") {
            parent._uiPadding = instance;
            applyUIPadding(parent);
        } else {
            parent.Element.appendChild(instance.Element);

            if (parent._uiListLayout) {
                applyListLayout(parent);
            }
        }

        parent.scheduleAutomaticSize();
    } else {
        instance.Element?.remove();
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

    return id;
}

export function setProperty(id, property, value) {
    const instance = instances.get(id);

    if (!instance || instance._destroyed) {
        throw new Error(`Instance ${id} does not exist`);
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

    return instance.getProperty(property);
}

export function destroyInstance(id) {
    const instance = instances.get(id);

    if (!instance || instance._destroyed) {
        return;
    }

    for (const childId of [...instance._children]) {
        destroyInstance(childId);
    }

    instance._destroyed = true;

    for (const [connectionId, connection] of instance._connections) {
        instance.Element?.removeEventListener(
            connection.eventName,
            connection.handler
        );
    }

    instance._connections.clear();

    const parent = instance._parent;

    if (parent) {
        parent._children.delete(id);

        if (parent._uiCorner === instance) {
            parent._uiCorner = null;
        }

        if (parent._uiStroke === instance) {
            parent._uiStroke = null;
        }

        if (parent._uiListLayout === instance) {
            parent._uiListLayout = null;
            applyListLayout(parent);
        }

        if (parent._uiPadding === instance) {
            parent._uiPadding = null;
            applyUIPadding(parent);
        }

        renderDecorations(parent);
        parent.scheduleAutomaticSize();
    }

    instance._paddingObserver?.disconnect();
    instance.ImageTintFilter?.SVG.remove();
    instance.Element?.remove();
    instances.delete(id);
}

export function connectEvent(id, eventName, callback) {
    const instance = instances.get(id);

    if (!instance || instance._destroyed) {
        throw new Error(`Instance ${id} does not exist`);
    }

    const domEvent = EventTypes[eventName];

    if (!domEvent) {
        throw new Error(`Unknown event: ${eventName}`);
    }

    if (!instance.Element) {
        throw new Error(`${instance.ClassName} does not support events`);
    }

    if (typeof callback !== "function") {
        throw new Error("Event callback must be a function");
    }

    const connectionId = ++NextConnectionId;

    const handler = async () => {
        if (instance._destroyed) {
            return;
        }

        try {
            await callback();
        } catch (error) {
            console.error(`Error in ${eventName}:`, error);
        }
    };

    instance.Element.addEventListener(domEvent, handler);

    instance._connections.set(connectionId, {
        eventName: domEvent,
        handler
    });

    return connectionId;
}

export function disconnectEvent(id, connectionId) {
    const instance = instances.get(id);

    if (!instance) {
        return;
    }

    const connection = instance._connections.get(connectionId);

    if (!connection) {
        return;
    }

    instance.Element?.removeEventListener(
        connection.eventName,
        connection.handler
    );

    instance._connections.delete(connectionId);
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
