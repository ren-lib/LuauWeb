import { instances } from './instance-store.js';
import { getUDimValue, applyOpacity } from './instance-utils.js';

export function renderDecorations(parent) {
    if (!parent?.Element) {
        return;
    }

    const Corner = parent._uiCorner;
    const Stroke = parent._uiStroke;

    if (Corner && !Corner._destroyed) {
        const Radius = Corner._cornerRadius;
        const Rect = parent.Element.getBoundingClientRect();
        const MinSize = Math.min(Rect.width, Rect.height);
        const RadiusValue = Math.max(
            0,
            Radius.Scale * MinSize + Radius.Offset
        );

        parent.Element.style.borderRadius = `${RadiusValue}px`;
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
        Content.style.gap = "";

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

    Content.style.display = "flex";
    Content.style.flexDirection = Horizontal ? "row" : "column";

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
        parent._paddingObserver?.disconnect();
        parent._paddingObserver = null;
        return;
    }

    const Width = parent.Element.clientWidth;
    const Height = parent.Element.clientHeight;

    Content.style.paddingTop =
        `${getUDimValue(Padding._paddingTop, Height)}px`;

    Content.style.paddingBottom =
        `${getUDimValue(Padding._paddingBottom, Height)}px`;

    Content.style.paddingLeft =
        `${getUDimValue(Padding._paddingLeft, Width)}px`;

    Content.style.paddingRight =
        `${getUDimValue(Padding._paddingRight, Width)}px`;

    if (!parent._paddingObserver && typeof ResizeObserver !== "undefined") {
        parent._paddingObserver = new ResizeObserver(() => {
            applyUIPadding(parent);
            applyListGap(parent);
        });

        parent._paddingObserver.observe(parent.Element);
    }
}

