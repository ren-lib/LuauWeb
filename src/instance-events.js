const EventTypes = { MouseButton1Click: 'click', MouseEnter: 'mouseenter', MouseLeave: 'mouseleave' };
let NextConnectionId = 0;

import { instances } from './instance-store.js';

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

    instance.Element.style.pointerEvents = "auto";
    const connectionId = ++NextConnectionId;

    const handler = () => {
        if (instance._destroyed) {
            return;
        }

        try {
            const Result = callback();
            if (Result && typeof Result.then === "function") {
                Promise.resolve(Result).catch(error => {
                    console.error(`Error in ${eventName}:`, error);
                });
            }
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
