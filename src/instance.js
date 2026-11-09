
const instances = new Map();
let NextId = 0;
let NextConnectionId = 0;

const FontStyles = {
    Arial: ["Arial, sans-serif", 400],
    ArialBold: ["Arial, sans-serif", 700],
    SourceSans: ['"Source Sans 3", Arial, sans-serif', 400],
    SourceSansBold: ['"Source Sans 3", Arial, sans-serif', 700],
    Gotham: ["Arial, sans-serif", 400],
    GothamMedium: ["Arial, sans-serif", 500],
    GothamSemibold: ["Arial, sans-serif", 600],
    GothamBold: ["Arial, sans-serif", 700],
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

class WebInstance {
    constructor(className) {
        this.ClassName = className;

        this.Element = ["UICorner", "UIStroke"].includes(className)
            ? null
            : className === "ScreenGui"
                ? document.createElement("div")
                : className === "TextButton"
                    ? document.createElement("button")
                    : className === "TextLabel"
                        ? document.createElement("span")
                        : document.createElement("div");

        this._parent = null;
        this._children = new Set();
        this._connections = new Map();
        this._destroyed = false;

        this._text = "";
        this._size = {
            X: { Scale: 0, Offset: 0 },
            Y: { Scale: 0, Offset: 0 }
        };

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

        if (!this.Element) {
            return;
        }

        this.Element.style.boxSizing = "border-box";

        if (className === "ScreenGui") {
            this.Element.style.width = "100%";
            this.Element.style.minHeight = "100vh";
            this.Element.style.position = "relative";
        }

        if (["Frame", "TextLabel", "TextButton"].includes(className)) {
            this.Element.style.position = "absolute";
        }

        if (className === "TextLabel") {
            this.Element.style.display = "block";
            this.Element.style.whiteSpace = "pre-wrap";
            this.Element.style.overflowWrap = "break-word";
        }

        if (className === "TextButton") {
            this.Element.style.cursor = "pointer";
            this.Element.style.border = "0";
            this.Element.style.padding = "0";
            this.Element.style.font = "inherit";
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
            : `calc(${this._size.X.Scale * 100}% + ${this._size.X.Offset}px)`;

        this.Element.style.height = AutoY
            ? "auto"
            : `calc(${this._size.Y.Scale * 100}% + ${this._size.Y.Offset}px)`;

        this.scheduleAutomaticSize();
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
                this.Element.style.left = `calc(${value.X.Scale * 100}% + ${value.X.Offset}px)`;
                this.Element.style.top = `calc(${value.Y.Scale * 100}% + ${value.Y.Offset}px)`;
                break;

            case "AnchorPoint":
                this.Element.style.transform = `translate(${-value.X * 100}%, ${-value.Y * 100}%)`;
                break;

            case "AutomaticSize":
                this._automaticSize = value;
                this.applySize();
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
        }
    }

    getProperty(property) {
        switch (property) {
            case "Text":
                return this._text;

            case "ClassName":
                return this.ClassName;

            case "AutomaticSize":
                return this._automaticSize;

            case "Visible":
                return this.Element ? !this.Element.hidden : undefined;

            case "CornerRadius":
                return this._cornerRadius;

            case "Color":
                return this._strokeColor;

            case "Thickness":
                return this._strokeThickness;

            case "Transparency":
                return this._strokeTransparency;
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

        renderDecorations(oldParent);
        oldParent.scheduleAutomaticSize();
    }

    instance._parent = parent;

    if (parent) {
        parent._children.add(id);

        if (instance.ClassName === "UICorner") {
            parent._uiCorner = instance;
            renderDecorations(parent);
        } else if (instance.ClassName === "UIStroke") {
            parent._uiStroke = instance;
            renderDecorations(parent);
        } else {
            parent.Element.appendChild(instance.Element);
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

    if (["UICorner", "UIStroke"].includes(instance.ClassName)) {
        if (property === "CornerRadius" && instance.ClassName !== "UICorner") {
            throw new Error("CornerRadius is only available on UICorner");
        }

        if (
            ["Color", "Thickness", "Transparency"].includes(property) &&
            instance.ClassName !== "UIStroke"
        ) {
            throw new Error(`${property} is only available on UIStroke`);
        }

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

        renderDecorations(parent);
        parent.scheduleAutomaticSize();
    }

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
