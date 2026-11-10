import { instances } from './instance-store.js';
import { applyListLayout, applyUIPadding, renderDecorations } from './layout.js';
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
    instance._canvasResizeObserver?.disconnect();
    if (instance._scrollPositionHandler) {
        instance.Element?.removeEventListener("scroll", instance._scrollPositionHandler);
        instance._scrollPositionHandler = null;
    }
    if (instance._wheelScrollHandler) {
        instance.Element?.removeEventListener("wheel", instance._wheelScrollHandler);
        instance._wheelScrollHandler = null;
    }
    instance.ImageTintFilter?.SVG.remove();
    instance.Element?.remove();
    instances.delete(id);
}
