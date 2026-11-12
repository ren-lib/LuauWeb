import { instances } from './instance-store.js';
import { getUDimValue, applyOpacity } from './instance-utils.js';

function applyCornerRadius(parent) {
    const Corner = parent._uiCorner;
    if (Corner && !Corner._destroyed) {
        const Radius = Corner._cornerRadius;
        const Rect = parent.Element.getBoundingClientRect();
        const MinSize = Math.min(Rect.width, Rect.height);
        const RadiusValue = Math.max(0, Radius.Scale * MinSize + Radius.Offset);
        const RadiusStyle = `${RadiusValue}px`;

        parent.Element.style.borderRadius = RadiusStyle;
        if (parent.ImageElement) {
            parent.ImageElement.style.borderRadius = RadiusStyle;
        }

        if (!parent._cornerResizeObserver && typeof ResizeObserver !== "undefined") {
            parent._cornerResizeObserver = new ResizeObserver(() => {
                applyCornerRadius(parent);
            });
            parent._cornerResizeObserver.observe(parent.Element);
        }
        return;
    }

    parent.Element.style.borderRadius = "";
    if (parent.ImageElement) {
        parent.ImageElement.style.borderRadius = "";
    }
    parent._cornerResizeObserver?.disconnect();
    parent._cornerResizeObserver = null;
}

export function renderDecorations(parent) {
    if (!parent?.Element) {
        return;
    }

    const Stroke = parent._uiStroke;
    const Gradient = parent._uiGradient;
    if (Gradient && !Gradient._destroyed && Gradient._colorSequence?.length) {
        const stops = Gradient._colorSequence.map(point => `${point.Color} ${Math.max(0, Math.min(1, point.Time)) * 100}%`).join(', ');
        parent.Element.style.backgroundImage = `linear-gradient(${90 + (Gradient._rotation || 0)}deg, ${stops})`;
        // Roblox UIGradient.Color modulates the GuiObject's existing background color.
        parent.Element.style.backgroundBlendMode = "multiply";
    } else {
        parent.Element.style.backgroundImage = "";
        parent.Element.style.backgroundBlendMode = "";
    }

    applyCornerRadius(parent);

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
export function getContentElement(parent) {
    return parent.CanvasElement || parent.Element;
}
export function applyListLayout(parent) {
    if (!parent?.Element) {
        return;
    }

    const Layout = parent._uiListLayout;
    const Content = getContentElement(parent);

    if (!Layout || Layout._destroyed) {
        Content.style.display = "";
        Content.style.flexDirection = "";
        Content.style.justifyContent = "";
        Content.style.alignItems = "";
        Content.style.alignContent = "";
        Content.style.flexWrap = "";
        Content.style.gap = "";

        for (const childId of parent._children) {
            applyListLayoutChild(parent, instances.get(childId));
        }

        return;
    }

    const Horizontal = Layout._fillDirection === "Horizontal";

    Content.style.display = "flex";
    Content.style.flexDirection = Horizontal ? "row" : "column";
    Content.style.flexWrap = Layout._wraps ? "wrap" : "nowrap";

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

    Content.style.justifyContent = Justify[MainAlignment] || "flex-start";
    Content.style.alignItems = Align[CrossAlignment] || "flex-start";
    Content.style.alignContent = Align[CrossAlignment] || "flex-start";

    for (const childId of parent._children) {
        applyListLayoutChild(parent, instances.get(childId));
    }

    applyListGap(parent);
    parent.scheduleAutomaticSize();
}

export function applyListLayoutChild(parent, child) {
    if (!parent?.Element || !child?.Element) return;

    const Layout = parent._uiListLayout;
    if (!Layout || Layout._destroyed) {
        child.Element.style.position = "absolute";
        child.Element.style.flexShrink = "";
        child.Element.style.flexGrow = "";
        child.Element.style.minWidth = "";
        child.Element.style.minHeight = "";
        child.applyPosition();
        return;
    }

    child.Element.style.position = "relative";
    child.Element.style.left = "auto";
    child.Element.style.top = "auto";
    child.Element.style.transform = "none";
    child.Element.style.flexShrink = "0";
    child.Element.style.flexGrow = "0";
    child.Element.style.minWidth = "0";
    child.Element.style.minHeight = "0";
    child.Element.style.order = Layout._sortOrder === "LayoutOrder"
        ? child._layoutOrder
        : 0;
}

export function applyListGap(parent) {
    const Layout = parent?._uiListLayout;

    if (!Layout || Layout._destroyed || !parent.Element) {
        return;
    }

    const Horizontal = Layout._fillDirection === "Horizontal";
    const Size = Horizontal
        ? parent.Element.clientWidth
        : parent.Element.clientHeight;

    const Content = getContentElement(parent);
    Content.style.gap = `${getUDimValue(Layout._listPadding, Size)}px`;
}

export function applyUIPadding(parent) {
    if (!parent?.Element) {
        return;
    }

    const Padding = parent._uiPadding;
    const Content = getContentElement(parent);

    if (!Padding || Padding._destroyed) {
        Content.style.padding = "";
        if (parent.ImageElement) {
            parent.ImageElement.style.inset = "0";
            parent.ImageElement.style.width = "100%";
            parent.ImageElement.style.height = "100%";
        }
        parent._paddingObserver?.disconnect();
        parent._paddingObserver = null;
        return;
    }

    const Width = parent.Element.clientWidth;
    const Height = parent.Element.clientHeight;
    const Top = getUDimValue(Padding._paddingTop, Height);
    const Bottom = getUDimValue(Padding._paddingBottom, Height);
    const Left = getUDimValue(Padding._paddingLeft, Width);
    const Right = getUDimValue(Padding._paddingRight, Width);

    const ApplyOnImage = Padding._applyOnImage !== false;

    if (parent.ImageElement && ApplyOnImage) {
        Content.style.padding = "";
        parent.ImageElement.style.top = `${Top}px`;
        parent.ImageElement.style.left = `${Left}px`;
        parent.ImageElement.style.right = "auto";
        parent.ImageElement.style.bottom = "auto";
        parent.ImageElement.style.width = `calc(100% - ${Left + Right}px)`;
        parent.ImageElement.style.height = `calc(100% - ${Top + Bottom}px)`;
    } else {
        Content.style.paddingTop = `${Top}px`;
        Content.style.paddingBottom = `${Bottom}px`;
        Content.style.paddingLeft = `${Left}px`;
        Content.style.paddingRight = `${Right}px`;

        if (parent.ImageElement) {
            parent.ImageElement.style.inset = "0";
            parent.ImageElement.style.width = "100%";
            parent.ImageElement.style.height = "100%";
        }
    }

    if (!parent._paddingObserver && typeof ResizeObserver !== "undefined") {
        parent._paddingObserver = new ResizeObserver(() => {
            applyUIPadding(parent);
            applyListGap(parent);
        });

        parent._paddingObserver.observe(parent.Element);
    }
}

