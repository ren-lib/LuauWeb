import { instances } from './instance-store.js';
import { applyListLayout, applyUIPadding, renderDecorations } from './layout.js';
import { destroyTweensForInstance } from './tween.js';
export function destroyInstance(id) {
    const instance = instances.get(id);

    if (!instance || instance._destroyed || instance._destroying) {
        return;
    }

    instance._destroying = true;

    for (const childId of [...instance._children]) {
        destroyInstance(childId);
    }

    destroyTweensForInstance(id);
    instance._destroyed = true;
    instance._destroying = false;

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

        if (parent._uiGradient === instance) {
            parent._uiGradient = null;
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
    instance._paddingObserver = null;
    instance._cornerResizeObserver?.disconnect();
    instance._cornerResizeObserver = null;
    instance._canvasResizeObserver?.disconnect();
    instance._canvasResizeObserver = null;
    if (instance._scrollPositionHandler) {
        instance.Element?.removeEventListener("scroll", instance._scrollPositionHandler);
        instance._scrollPositionHandler = null;
    }
    if (instance._wheelScrollHandler) {
        instance.Element?.removeEventListener("wheel", instance._wheelScrollHandler);
        instance._wheelScrollHandler = null;
    }

    if (instance.ClassName === "Sound" && instance.Element) {
        instance.Element.pause();
        instance.Element.removeAttribute("src");
        instance.Element.load();
    }
    instance.ImageElement?.removeAttribute("src");
    instance.ImageTintFilter?.SVG.remove();
    instance.Element?.remove();

    instance._parent = null;
    instance._children.clear();
    instance.CanvasElement = null;
    instance.ImageElement = null;
    instance.ImageTintFilter = null;
    instance.Element = null;
    instances.delete(id);
}
