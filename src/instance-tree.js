import { instances } from './instance-store.js';
import { renderDecorations, getContentElement, applyListLayout, applyListLayoutChild, applyUIPadding } from './layout.js';

export function setParent(id, value) {
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

    const oldParent = instance._parent;

    if (oldParent) {
        oldParent._children.delete(id);

        if (oldParent._uiCorner === instance) {
            oldParent._uiCorner = null;
        }

        if (oldParent._uiStroke === instance) {
            oldParent._uiStroke = null;
        }
        if (oldParent._uiGradient === instance) oldParent._uiGradient = null;

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

        parent._children.add(id);

        if (instance.ClassName === "UICorner") {
            parent._uiCorner = instance;
            renderDecorations(parent);
        } else if (instance.ClassName === "UIStroke") {
            parent._uiStroke = instance;
            renderDecorations(parent);
        } else if (instance.ClassName === "UIGradient") {
            parent._uiGradient = instance;
            renderDecorations(parent);
        } else if (instance.ClassName === "UIListLayout") {
            parent._uiListLayout = instance;
            applyListLayout(parent);
        } else if (instance.ClassName === "UIPadding") {
            parent._uiPadding = instance;
            applyUIPadding(parent);
        } else {
            getContentElement(parent).appendChild(instance.Element);

            if (parent._uiListLayout) {
                applyListLayoutChild(parent, instance);
            }
        }

        parent.scheduleAutomaticSize();
    } else {
        instance.Element?.remove();
    }
}
