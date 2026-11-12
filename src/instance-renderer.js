import { instances } from './instance-store.js';
import { getUDimValue, applyOpacity, getColorRGB } from './instance-utils.js';

export function applySize(instance) {
        if (!instance.Element) {
            return;
        }

        const AutoX = instance._automaticSize === "X" || instance._automaticSize === "XY";
        const AutoY = instance._automaticSize === "Y" || instance._automaticSize === "XY";

        instance.Element.style.width = AutoX
            ? "max-content"
            : instance._size.X.Scale === 0
                ? `${instance._size.X.Offset}px`
                : `calc(${instance._size.X.Scale * 100}% + ${instance._size.X.Offset}px)`;

        instance.Element.style.height = AutoY
            ? "auto"
            : instance._size.Y.Scale === 0
                ? `${instance._size.Y.Offset}px`
                : `calc(${instance._size.Y.Scale * 100}% + ${instance._size.Y.Offset}px)`;

        instance.scheduleAutomaticSize();
    
}

export function applyPosition(instance) {
        if (!instance.Element) {
            return;
        }

        instance.Element.style.left =
            `calc(${instance._position.X.Scale * 100}% + ${instance._position.X.Offset}px)`;

        instance.Element.style.top =
            `calc(${instance._position.Y.Scale * 100}% + ${instance._position.Y.Offset}px)`;

        instance.Element.style.translate =
            `${-instance._anchorPoint.X * 100}% ${-instance._anchorPoint.Y * 100}%`;
    
}

export function scheduleAutomaticCanvasSize(instance) {
    if (
        instance.ClassName !== "ScrollingFrame" ||
        instance._destroyed ||
        instance._canvasSizeScheduled
    ) {
        return;
    }

    instance._canvasSizeScheduled = true;

    requestAnimationFrame(() => {
        instance._canvasSizeScheduled = false;
        instance.updateAutomaticCanvasSize();
    });

}

export function updateAutomaticCanvasSize(instance) {
    if (
        instance.ClassName !== "ScrollingFrame" ||
        !instance.Element?.isConnected ||
        !instance.CanvasElement
    ) {
        return;
    }

    const AutoX = instance._automaticCanvasSize === "X" ||
        instance._automaticCanvasSize === "XY";

    const AutoY = instance._automaticCanvasSize === "Y" ||
        instance._automaticCanvasSize === "XY";

    const ViewWidth = instance.Element.clientWidth;
    const ViewHeight = instance.Element.clientHeight;

    let Width = getUDimValue(instance._canvasSize.X, ViewWidth);
    let Height = getUDimValue(instance._canvasSize.Y, ViewHeight);

    instance.CanvasElement.style.width = `${Math.ceil(Math.max(ViewWidth, Width))}px`;
    instance.CanvasElement.style.height = `${Math.ceil(Math.max(ViewHeight, Height))}px`;

    let ContentRight = 0;
    let ContentBottom = 0;
    const CanvasRect = instance.CanvasElement.getBoundingClientRect();

    for (const childId of instance._children) {
        const Child = instances.get(childId);

        if (!Child?.Element || Child.Element.hidden) {
            continue;
        }

        const Rect = Child.Element.getBoundingClientRect();

        ContentRight = Math.max(ContentRight, Rect.right - CanvasRect.left);
        ContentBottom = Math.max(ContentBottom, Rect.bottom - CanvasRect.top);
    }

    const Padding = instance._uiPadding;
    const RightPadding = Padding ? getUDimValue(Padding._paddingRight, ViewWidth) : 0;
    const BottomPadding = Padding ? getUDimValue(Padding._paddingBottom, ViewHeight) : 0;

    if (AutoX) Width = Math.max(Width, ContentRight + RightPadding);
    if (AutoY) Height = Math.max(Height, ContentBottom + BottomPadding);

    instance.CanvasElement.style.width = `${Math.ceil(Math.max(ViewWidth, Width))}px`;
    instance.CanvasElement.style.height = `${Math.ceil(Math.max(ViewHeight, Height))}px`;

}

export function applyImage(instance) {
        if (!instance.ImageElement) {
            return;
        }

        const CurrentSource = instance.ImageElement.getAttribute("src") || "";
        if (instance._image) {
            if (CurrentSource !== instance._image) {
                instance.ImageElement.src = instance._image;
            }
        } else if (CurrentSource) {
            instance.ImageElement.removeAttribute("src");
        }

        const ScaleTypes = {
            Stretch: "fill",
            Fit: "contain",
            Crop: "cover",
            Tile: "fill"
        };

        instance.ImageElement.style.objectFit =
            ScaleTypes[instance._scaleType] || "fill";

        instance.ImageElement.style.opacity = 1 - instance._imageTransparency;

        if (instance.ImageTintFilter) {
            const [R, G, B] = getColorRGB(instance._imageColor3);

            const Matrix = [
                R / 255, 0, 0, 0, 0,
                0, G / 255, 0, 0, 0,
                0, 0, B / 255, 0, 0,
                0, 0, 0, 1, 0
            ];

            instance.ImageTintFilter.Matrix.setAttribute(
                "values",
                Matrix.join(" ")
            );

            instance.ImageElement.style.filter =
                `url(#${instance.ImageTintFilterId})`;
        }
    
}

export function scheduleAutomaticSize(instance) {
    if (instance._destroyed) {
        return;
    }

    instance.scheduleAutomaticCanvasSize();

    if (
        instance.ClassName !== "Frame" ||
        instance._automaticSize === "None"
    ) {
        return;
    }

        if (instance._autoSizeScheduled) {
            return;
        }

        instance._autoSizeScheduled = true;

        requestAnimationFrame(() => {
            instance._autoSizeScheduled = false;
            instance.updateAutomaticSize();
        });
    
}

export function updateAutomaticSize(instance) {
        if (
            instance.ClassName !== "Frame" ||
            !instance.Element.isConnected ||
            instance.Element.hidden
        ) {
            return;
        }

        const AutoX = instance._automaticSize === "X" || instance._automaticSize === "XY";
        const AutoY = instance._automaticSize === "Y" || instance._automaticSize === "XY";

        if (!AutoX && !AutoY) {
            return;
        }

        const ParentRect = instance.Element.getBoundingClientRect();

        let Width = 0;
        let Height = 0;

        for (const Child of instance.Element.children) {
            if (Child.hidden) {
                continue;
            }

            const Rect = Child.getBoundingClientRect();

            Width = Math.max(Width, Rect.right - ParentRect.left);
            Height = Math.max(Height, Rect.bottom - ParentRect.top);
        }

        const Padding = instance._uiPadding;
        const LeftPadding = Padding
            ? getUDimValue(Padding._paddingLeft, ParentRect.width)
            : 0;
        const RightPadding = Padding
            ? getUDimValue(Padding._paddingRight, ParentRect.width)
            : 0;
        const TopPadding = Padding
            ? getUDimValue(Padding._paddingTop, ParentRect.height)
            : 0;
        const BottomPadding = Padding
            ? getUDimValue(Padding._paddingBottom, ParentRect.height)
            : 0;

        Width = Math.max(Width + RightPadding, LeftPadding + RightPadding);
        Height = Math.max(Height + BottomPadding, TopPadding + BottomPadding);

        if (AutoX) {
            instance.Element.style.width = `${Math.ceil(Math.max(0, Width))}px`;
        }

        if (AutoY) {
            instance.Element.style.height = `${Math.ceil(Math.max(0, Height))}px`;
        }
    
}

export function applyBackgroundColor(instance) {
        if (!instance.Element) {
            return;
        }

        instance.Element.style.backgroundColor = applyOpacity(
            instance._backgroundColor3,
            1 - instance._backgroundTransparency
        );
    
}

export function applyScrollingStyles(instance) {
        if (!instance.Element) return;
        instance.Element.style.overflowX = instance._scrollingEnabled &&
            (instance._scrollingDirection === "X" || instance._scrollingDirection === "XY")
            ? "auto" : "hidden";
        instance.Element.style.overflowY = instance._scrollingEnabled &&
            (instance._scrollingDirection === "Y" || instance._scrollingDirection === "XY")
            ? "auto" : "hidden";
    
}

export function observeScrollingFrameSize(instance) {
    if (instance.ClassName !== "ScrollingFrame") return;

    instance._scrollPositionHandler = () => {
        instance._canvasPosition = {
            X: instance.Element.scrollLeft,
            Y: instance.Element.scrollTop
        };
    };
    instance.Element.addEventListener("scroll", instance._scrollPositionHandler, { passive: true });
    instance._wheelScrollHandler = event => {
        const CanScrollX = instance.Element.scrollWidth > instance.Element.clientWidth;
        const CanScrollY = instance.Element.scrollHeight > instance.Element.clientHeight;
        if (CanScrollX && !CanScrollY && event.deltaY !== 0) {
            instance.Element.scrollLeft += event.deltaY;
            event.preventDefault();
        }
    };
    instance.Element.addEventListener("wheel", instance._wheelScrollHandler, { passive: false });

    if (typeof ResizeObserver !== "undefined") {
        instance._canvasResizeObserver = new ResizeObserver(() => {
            instance.scheduleAutomaticCanvasSize();
        });
        instance._canvasResizeObserver.observe(instance.Element);
    }
}
