import "./instance-visibility.css";
export function createInstanceDOM(className, nextFilterId) {
    const view = { ClassName: className };
        view.Element = [
            "UICorner",
            "UIStroke",
            "UIListLayout",
            "UIPadding"
        ].includes(className)
            ? null
            : className === "Sound"
                ? document.createElement("audio")
                : className === "ScreenGui"
                ? document.createElement("div")
                : ["TextButton", "ImageButton"].includes(className)
                    ? document.createElement("button")
                    : className === "TextLabel"
                        ? document.createElement("span")
                        : document.createElement("div");

        view.CanvasElement = null;
        view._canvasSize = {
            X: { Scale: 0, Offset: 0 },
            Y: { Scale: 0, Offset: 0 }
        };
        view._canvasPosition = { X: 0, Y: 0 };
        view._automaticCanvasSize = "None";
        view._scrollingEnabled = true;
        view._scrollingDirection = "XY";
        view._scrollBarThickness = 12;

        if (className === "ScrollingFrame") {
    view.CanvasElement = document.createElement("div");

    view.Element.style.position = "absolute";
    view.Element.style.pointerEvents = "auto";
    view.Element.style.overflow = "auto";
    view.Element.style.overscrollBehavior = "contain";

    view.CanvasElement.style.position = "relative";
    view.CanvasElement.style.boxSizing = "border-box";
    view.CanvasElement.style.minWidth = "100%";
    view.CanvasElement.style.minHeight = "100%";

    view.Element.appendChild(view.CanvasElement);
}   
        view.ImageElement = null;
        view.ImageTintFilter = null;
        view.ImageTintFilterId = null;

        if (["ImageLabel", "ImageButton"].includes(className)) {
            view.ImageElement = document.createElement("img");
            view.ImageElement.draggable = false;
            view.ImageElement.style.cssText = `
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            `;

            view.Element.appendChild(view.ImageElement);

            view.ImageTintFilterId = `ImageTint_${nextFilterId()}`;

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

            Filter.setAttribute("id", view.ImageTintFilterId);
            Filter.setAttribute("color-interpolation-filters", "sRGB");

            const Matrix = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "feColorMatrix"
            );

            Matrix.setAttribute("type", "matrix");

            Filter.appendChild(Matrix);
            SVG.appendChild(Filter);
            document.body.appendChild(SVG);

            view.ImageTintFilter = {
                SVG,
                Filter,
                Matrix
            };
        }

    if (className === "Sound") {
        view.Element.preload = "auto";
    }

    return {
        Element: view.Element,
        CanvasElement: view.CanvasElement,
        ImageElement: view.ImageElement,
        ImageTintFilter: view.ImageTintFilter,
        ImageTintFilterId: view.ImageTintFilterId
    };
}
