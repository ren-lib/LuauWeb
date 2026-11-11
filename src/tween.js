import { getTweenProperty, setProperty } from "./instance.js";

const Tweens = new Map();
const TweensByInstance = new Map();
let NextTweenId = 0;
let NextTweenConnectionId = 0;

function cloneValue(value) {
    if (Array.isArray(value)) {
        return value.map(cloneValue);
    }

    if (value && typeof value === "object") {
        const Result = Object.create(null);

        for (const [Key, Item] of Object.entries(value)) {
            Result[Key] = cloneValue(Item);
        }

        return Result;
    }

    return value;
}

function parseColor(value) {
    if (typeof value !== "string") {
        return null;
    }

    if (value.toLowerCase() === "transparent") {
        return [0, 0, 0];
    }

    const Hex = value.match(/^#([0-9a-f]{6})$/i);

    if (Hex) {
        return [
            parseInt(Hex[1].slice(0, 2), 16),
            parseInt(Hex[1].slice(2, 4), 16),
            parseInt(Hex[1].slice(4, 6), 16)
        ];
    }

    const RGB = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);

    if (RGB) {
        return [Number(RGB[1]), Number(RGB[2]), Number(RGB[3])];
    }

    return null;
}

function interpolateValue(Start, Goal, Alpha) {
    if (typeof Start === "number" && typeof Goal === "number") {
        return Start + (Goal - Start) * Alpha;
    }

    if (typeof Start === "string" && typeof Goal === "string") {
        if (Start === Goal) {
            return Goal;
        }

        const StartColor = parseColor(Start);
        const GoalColor = parseColor(Goal);

        if (StartColor && GoalColor) {
            const [R, G, B] = StartColor.map((Value, Index) =>
                Math.round(Value + (GoalColor[Index] - Value) * Alpha)
            );

            return `rgb(${R}, ${G}, ${B})`;
        }

        throw new Error("Tween: string properties can only tween between colors");
    }

    if (
        Start && Goal &&
        typeof Start === "object" &&
        typeof Goal === "object" &&
        !Array.isArray(Start) &&
        !Array.isArray(Goal)
    ) {
        const StartKeys = Object.keys(Start);
        const GoalKeys = Object.keys(Goal);

        if (
            StartKeys.length !== GoalKeys.length ||
            GoalKeys.some(Key => !Object.prototype.hasOwnProperty.call(Start, Key))
        ) {
            throw new Error("Tween: incompatible property values");
        }

        const Result = Object.create(null);

        for (const Key of StartKeys) {
            Result[Key] = interpolateValue(Start[Key], Goal[Key], Alpha);
        }

        return Result;
    }

    throw new Error("Tween: unsupported property value type");
}

function interpolateProperty(property, Start, Goal, Alpha) {
    if (property === "Font") {
        if (typeof Start !== "string" || typeof Goal !== "string") {
            throw new Error("Tween: Font values must be font names");
        }

        // Font is a discrete style, so switch it at the midpoint of the tween.
        return Alpha < 0.5 ? Start : Goal;
    }

    return interpolateValue(Start, Goal, Alpha);
}

function easeIn(style, Value) {
    switch (style) {
        case "Linear":
            return Value;
        case "Sine":
            return 1 - Math.cos((Value * Math.PI) / 2);
        case "Back": {
            const C1 = 1.70158;
            const C3 = C1 + 1;
            return C3 * Value ** 3 - C1 * Value ** 2;
        }
        case "Quad":
            return Value ** 2;
        case "Cubic":
            return Value ** 3;
        case "Quart":
            return Value ** 4;
        case "Quint":
            return Value ** 5;
        case "Exponential":
            return Value === 0 ? 0 : 2 ** (10 * Value - 10);
        case "Circular":
            return 1 - Math.sqrt(1 - Value ** 2);
        case "Elastic":
            if (Value === 0 || Value === 1) {
                return Value;
            }

            return -(2 ** (10 * Value - 10)) *
                Math.sin((Value * 10 - 10.75) * (2 * Math.PI / 3));
        case "Bounce":
            return 1 - easeOutBounce(1 - Value);
        default:
            return Value ** 2;
    }
}

function easeOutBounce(Value) {
    const N1 = 7.5625;
    const D1 = 2.75;

    if (Value < 1 / D1) {
        return N1 * Value ** 2;
    }

    if (Value < 2 / D1) {
        Value -= 1.5 / D1;
        return N1 * Value ** 2 + 0.75;
    }

    if (Value < 2.5 / D1) {
        Value -= 2.25 / D1;
        return N1 * Value ** 2 + 0.9375;
    }

    Value -= 2.625 / D1;
    return N1 * Value ** 2 + 0.984375;
}

function ease(style, direction, Value) {
    Value = Math.max(0, Math.min(1, Value));

    if (style === "Bounce" && direction === "Out") {
        return easeOutBounce(Value);
    }

    if (direction === "In") {
        return easeIn(style, Value);
    }

    if (direction === "Out") {
        return 1 - easeIn(style, 1 - Value);
    }

    return Value < 0.5
        ? easeIn(style, Value * 2) / 2
        : 1 - easeIn(style, (1 - Value) * 2) / 2;
}

function fireEvent(tween, eventName, ...Values) {
    for (const Connection of tween.connections.values()) {
        if (Connection.eventName !== eventName) {
            continue;
        }

        try {
            Promise.resolve(Connection.callback(...Values)).catch(error => {
                console.error(`Tween ${eventName} callback error:`, error);
            });
        } catch (error) {
            console.error(`Tween ${eventName} callback error:`, error);
        }
    }
}

function setPlaybackState(tween, state) {
    if (tween.playbackState === state) {
        return;
    }

    tween.playbackState = state;
    fireEvent(tween, "Changed", state);

    if (state === "Completed" || state === "Cancelled") {
        fireEvent(tween, "Completed", state);
    }
}

function stopFrame(tween) {
    if (tween.frame !== null) {
        cancelAnimationFrame(tween.frame);
        tween.frame = null;
    }
}

function applyTweenValue(tween, property, value) {
    setProperty(tween.instanceId, property, value);
}

function applyProgress(tween, progress) {
    try {
        const Alpha = ease(
            tween.info.EasingStyle,
            tween.info.EasingDirection,
            progress
        );

        for (const [Property, Goal] of Object.entries(tween.goals)) {
            const Value = interpolateProperty(Property, tween.startValues[Property], Goal, Alpha);
            applyTweenValue(tween, Property, Value);
        }

        return true;
    } catch (error) {
        stopFrame(tween);
        tween.frame = null;
        setPlaybackState(tween, "Cancelled");
        console.error("Tween error:", error);
        return false;
    }
}

function advanceTween(tween, now) {
    if (
        tween.playbackState !== "Playing" &&
        tween.playbackState !== "Delayed"
    ) {
        return;
    }

    const Elapsed = Math.max(0, now - tween.startTime);
    const Delay = tween.info.DelayTime * 1000;
    const Duration = tween.info.Time * 1000;

    if (Elapsed < Delay) {
        tween.frame = requestAnimationFrame(Time => advanceTween(tween, Time));
        return;
    }

    if (tween.playbackState === "Delayed") {
        setPlaybackState(tween, "Playing");
    }

    const ActiveElapsed = Elapsed - Delay;

    if (Duration === 0) {
        if (!applyProgress(tween, tween.info.Reverses ? 0 : 1)) {
            return;
        }

        tween.frame = null;
        setPlaybackState(tween, "Completed");
        return;
    }

    const CycleDuration = Duration * (tween.info.Reverses ? 2 : 1);
    const TotalCycles = tween.info.RepeatCount < 0
        ? Infinity
        : tween.info.RepeatCount + 1;
    const TotalDuration = CycleDuration * TotalCycles;

    if (ActiveElapsed >= TotalDuration) {
        if (!applyProgress(tween, tween.info.Reverses ? 0 : 1)) {
            return;
        }

        tween.frame = null;
        setPlaybackState(tween, "Completed");
        return;
    }

    const Cycle = Math.floor(ActiveElapsed / CycleDuration);
    const CycleElapsed = ActiveElapsed - Cycle * CycleDuration;

    let Progress;

    if (tween.info.Reverses && CycleElapsed > Duration) {
        Progress = 1 - (CycleElapsed - Duration) / Duration;
    } else {
        Progress = Math.min(1, CycleElapsed / Duration);
    }

    if (!applyProgress(tween, Progress)) {
        return;
    }

    tween.frame = requestAnimationFrame(Time => advanceTween(tween, Time));
}

export function createTween(instanceId, info, goals) {
    if (!Number.isInteger(instanceId)) {
        throw new Error("TweenService: invalid Instance");
    }

    if (!info || typeof info !== "object") {
        throw new Error("TweenService: expected TweenInfo");
    }

    if (!goals || typeof goals !== "object" || Array.isArray(goals)) {
        throw new Error("TweenService: expected a property table");
    }

    const Properties = Object.entries(goals);

    if (Properties.length === 0) {
        throw new Error("TweenService: property table cannot be empty");
    }

    const Time = Number(info.Time ?? 1);
    const DelayTime = Number(info.DelayTime ?? 0);
    const RepeatCount = Math.trunc(Number(info.RepeatCount ?? 0));

    if (!Number.isFinite(Time) || Time < 0) {
        throw new Error("TweenInfo.Time must be a non-negative number");
    }

    if (!Number.isFinite(DelayTime) || DelayTime < 0) {
        throw new Error("TweenInfo.DelayTime must be a non-negative number");
    }

    if (!Number.isFinite(RepeatCount) || RepeatCount < -1) {
        throw new Error("TweenInfo.RepeatCount must be -1 or greater");
    }

    for (const [Property, Goal] of Properties) {
        const Start = getTweenProperty(instanceId, Property);

        if (Start === undefined) {
            throw new Error(`TweenService: unsupported property ${Property}`);
        }

        interpolateProperty(Property, cloneValue(Start), cloneValue(Goal), 0);
    }

    const id = ++NextTweenId;

    Tweens.set(id, {
        id,
        instanceId,
        info: {
            Time,
            EasingStyle: info.EasingStyle || "Quad",
            EasingDirection: info.EasingDirection || "Out",
            RepeatCount,
            Reverses: Boolean(info.Reverses),
            DelayTime
        },
        goals: cloneValue(goals),
        startValues: null,
        playbackState: "Begin",
        startTime: 0,
        elapsed: 0,
        frame: null,
        connections: new Map()
    });

    let InstanceTweens = TweensByInstance.get(instanceId);
    if (!InstanceTweens) {
        InstanceTweens = new Set();
        TweensByInstance.set(instanceId, InstanceTweens);
    }
    InstanceTweens.add(id);

    return id;
}

export function playTween(id) {
    const tween = Tweens.get(id);

    if (!tween) {
        throw new Error(`Tween ${id} does not exist`);
    }

    if (
        tween.playbackState === "Playing" ||
        tween.playbackState === "Delayed"
    ) {
        return;
    }

    if (tween.playbackState === "Paused") {
        tween.startTime = performance.now() - tween.elapsed;
        setPlaybackState(tween, tween.info.DelayTime * 1000 > tween.elapsed
            ? "Delayed"
            : "Playing");
        tween.frame = requestAnimationFrame(Time => advanceTween(tween, Time));
        return;
    }

    tween.startValues = Object.create(null);

    for (const Property of Object.keys(tween.goals)) {
        tween.startValues[Property] = cloneValue(
            getTweenProperty(tween.instanceId, Property)
        );
    }

    tween.elapsed = 0;
    tween.startTime = performance.now();

    setPlaybackState(tween, tween.info.DelayTime > 0 ? "Delayed" : "Playing");
    advanceTween(tween, tween.startTime);
}

export function pauseTween(id) {
    const tween = Tweens.get(id);

    if (!tween) {
        throw new Error(`Tween ${id} does not exist`);
    }

    if (
        tween.playbackState !== "Playing" &&
        tween.playbackState !== "Delayed"
    ) {
        return;
    }

    tween.elapsed = Math.max(0, performance.now() - tween.startTime);
    stopFrame(tween);
    setPlaybackState(tween, "Paused");
}

export function cancelTween(id) {
    const tween = Tweens.get(id);

    if (!tween) {
        throw new Error(`Tween ${id} does not exist`);
    }

    if (tween.playbackState === "Completed" || tween.playbackState === "Cancelled") {
        return;
    }

    stopFrame(tween);
    tween.elapsed = 0;
    setPlaybackState(tween, "Cancelled");
}

export function destroyTween(id) {
    const tween = Tweens.get(id);

    if (!tween) {
        return;
    }

    if (
        tween.playbackState !== "Completed" &&
        tween.playbackState !== "Cancelled"
    ) {
        cancelTween(id);
    }

    tween.connections.clear();
    Tweens.delete(id);

    const InstanceTweens = TweensByInstance.get(tween.instanceId);
    InstanceTweens?.delete(id);
    if (InstanceTweens?.size === 0) {
        TweensByInstance.delete(tween.instanceId);
    }
}

export function destroyTweensForInstance(instanceId) {
    const InstanceTweens = TweensByInstance.get(instanceId);
    if (!InstanceTweens) return;

    for (const tweenId of [...InstanceTweens]) {
        destroyTween(tweenId);
    }
}

export function getTweenState(id) {
    const tween = Tweens.get(id);

    if (!tween) {
        throw new Error(`Tween ${id} does not exist`);
    }

    return tween.playbackState;
}

export function connectTweenEvent(id, eventName, callback) {
    const tween = Tweens.get(id);

    if (!tween) {
        throw new Error(`Tween ${id} does not exist`);
    }

    if (!["Completed", "Changed"].includes(eventName)) {
        throw new Error(`Unknown Tween event: ${eventName}`);
    }

    if (typeof callback !== "function") {
        throw new Error("Tween event callback must be a function");
    }

    const connectionId = ++NextTweenConnectionId;

    tween.connections.set(connectionId, {
        eventName,
        callback
    });

    return connectionId;
}

export function disconnectTweenEvent(id, connectionId) {
    Tweens.get(id)?.connections.delete(connectionId);
}
