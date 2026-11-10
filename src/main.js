
import { LuauState } from "luau-web";
import {
    createInstance,
    instances,
    setProperty,
    getProperty,
    destroyInstance,
    connectEvent,
    disconnectEvent,
    udimNew,
    udim2New,
    udim2FromScale,
    udim2FromOffset,
    vector2New,
    color3FromRGB
} from "./instance.js";
import {
    createTween,
    playTween,
    pauseTween,
    cancelTween,
    destroyTween,
    getTweenState,
    connectTweenEvent,
    disconnectTweenEvent
} from "./tween.js";

const app = document.querySelector("#app");
app.innerHTML = "";

app.style.cssText = `
    position: relative;
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    text-align: left;
`;

document.body.style.margin = "0";

const output = document.createElement("pre");
output.style.cssText = `
    display: none;
    position: fixed;
    left: 8px;
    bottom: 8px;
    z-index: 2147483647;
    max-width: calc(100vw - 32px);
    max-height: 30vh;
    overflow: auto;
    margin: 0;
    padding: 8px;
    color: #ffffff;
    background: rgba(20, 20, 25, 0.9);
    border-radius: 6px;
    white-space: pre-wrap;
    font: 12px/1.4 monospace;
    pointer-events: none;
`;

app.appendChild(output);

const state = await LuauState.createAsync({});
state.env.set('__PagePath', window.location.pathname, true);

state.env.set('__Navigate', (Url) => {
    window.location.href = Url;
}, true);
state.env.set("__TaskWait", async (Seconds = 0) => {
    const Start = performance.now();

    await new Promise(resolve => {
        setTimeout(resolve, Math.max(0, Seconds) * 1000);
    });

    return (performance.now() - Start) / 1000;
}, true);

state.env.set("__InstanceNew", createInstance, true);
state.env.set("__SetProperty", setProperty, true);
state.env.set("__GetProperty", getProperty, true);
state.env.set("__SoundAction", (id, action) => {
    const instance = instances.get(id);
    if (!instance || instance._destroyed || instance.ClassName !== "Sound") {
        throw new Error("Sound method can only be used on a Sound instance");
    }
    if (action === "Play") return instance.Element.play();
    else if (action === "Pause") instance.Element.pause();
    else if (action === "Stop") {
        instance.Element.pause();
        instance.Element.currentTime = 0;
    }
}, true);
state.env.set("__Destroy", destroyInstance, true);

state.env.set("__ConnectEvent", connectEvent, true);
state.env.set("__DisconnectEvent", disconnectEvent, true);

state.env.set("__UDimNew", udimNew, true);
state.env.set("__UDim2New", udim2New, true);
state.env.set("__UDim2FromScale", udim2FromScale, true);
state.env.set("__UDim2FromOffset", udim2FromOffset, true);

state.env.set("__Vector2New", vector2New, true);
state.env.set("__Color3FromRGB", color3FromRGB, true);

state.env.set("__Print", (...Values) => console.log(...Values), true);
state.env.set("__AssetBaseUrl", import.meta.env.BASE_URL, true);
function isLuauTable(value) {
    return (
        typeof value.get === "function" &&
        typeof value.set === "function" &&
        typeof value[Symbol.iterator] === "function"
    );
}

function serializeClientValue(value, seen = new WeakSet()) {
    if (
        value === null ||
        ["string", "number", "boolean"].includes(typeof value)
    ) {
        return value;
    }

    if (typeof value !== "object") {
        throw new Error("Client.Set: unsupported value type");
    }

    if (seen.has(value)) {
        throw new Error("Client.Set: circular tables are not supported");
    }

    if (!isLuauTable(value)) {
        throw new Error("Client.Set: expected a Luau table or primitive value");
    }

    seen.add(value);

    const Entries = [...value];
    const IsArray = Entries.length > 0 &&
        Entries.every(([Key]) => Number.isInteger(Key) && Key >= 1) &&
        Math.max(...Entries.map(([Key]) => Key)) === Entries.length;

    let Result;

    if (IsArray) {
        Result = [];

        for (const [Key, Item] of Entries) {
            Result[Key - 1] = serializeClientValue(Item, seen);
        }
    } else {
        Result = Object.create(null);

        for (const [Key, Item] of Entries) {
            if (typeof Key !== "string" && typeof Key !== "number") {
                throw new Error("Client.Set: table keys must be strings or numbers");
            }

            Result[Key] = serializeClientValue(Item, seen);
        }
    }

    seen.delete(value);
    return Result;
}
function serializeTweenValue(value, seen = new WeakSet()) {
    if (
        value === null ||
        ["string", "number", "boolean"].includes(typeof value)
    ) {
        return value;
    }

    if (typeof value !== "object") {
        throw new Error("Tween: unsupported value type");
    }

    if (seen.has(value)) {
        throw new Error("Tween: circular tables are not supported");
    }

    seen.add(value);

    let Result;

    if (Array.isArray(value)) {
        Result = value.map(Item => serializeTweenValue(Item, seen));
    } else if (isLuauTable(value)) {
        const Entries = [...value];
        const IsArray = Entries.length > 0 &&
            Entries.every(([Key]) => Number.isInteger(Key) && Key >= 1) &&
            Math.max(...Entries.map(([Key]) => Key)) === Entries.length;

        Result = IsArray ? [] : Object.create(null);

        for (const [Key, Item] of Entries) {
            if (typeof Key !== "string" && typeof Key !== "number") {
                throw new Error("Tween: table keys must be strings or numbers");
            }

            Result[IsArray ? Key - 1 : Key] = serializeTweenValue(Item, seen);
        }
    } else {
        Result = Object.create(null);

        for (const [Key, Item] of Object.entries(value)) {
            Result[Key] = serializeTweenValue(Item, seen);
        }
    }

    seen.delete(value);
    return Result;
}
function clientSet(key, value) {
    if (typeof key !== "string") {
        throw new Error("Client.Set: Key must be a string");
    }

    if (value === undefined || value === null) {
        localStorage.removeItem(`LuauWeb:${key}`);
        return true;
    }

    const Data = serializeClientValue(value);
    localStorage.setItem(`LuauWeb:${key}`, JSON.stringify(Data));

    return true;
}

function clientGet(key) {
    if (typeof key !== "string") {
        throw new Error("Client.Get: Key must be a string");
    }

    const Data = localStorage.getItem(`LuauWeb:${key}`);

    if (Data === null) {
        return undefined;
    }

    return JSON.parse(Data);
}

const IsMobile = navigator.userAgentData?.mobile ??
    (
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );

let ClientCursorX = 0;
let ClientCursorY = 0;
window.addEventListener("pointermove", event => {
    ClientCursorX = event.clientX;
    ClientCursorY = event.clientY;
}, { passive: true });
state.env.set("__GetClientScreenWidth", () => window.innerWidth, true);
state.env.set("__GetClientScreenHeight", () => window.innerHeight, true);
state.env.set("__GetClientCursorX", () => ClientCursorX, true);
state.env.set("__GetClientCursorY", () => ClientCursorY, true);
state.env.set("__ClientDevice", IsMobile ? "Mobile" : "PC", true);
state.env.set("__ClientLanguage", (navigator.language || "en-US").split("-")[0], true);

state.env.set("__ClientGet", clientGet, true);
state.env.set("__ClientSet", clientSet, true);

state.env.set("__TweenCreate", (instanceId, info, goals) => {
    return createTween(
        instanceId,
        serializeTweenValue(info),
        serializeTweenValue(goals)
    );
}, true);

state.env.set("__TweenPlay", playTween, true);
state.env.set("__TweenPause", pauseTween, true);
state.env.set("__TweenCancel", cancelTween, true);
state.env.set("__TweenDestroy", destroyTween, true);
state.env.set("__TweenGetState", getTweenState, true);

state.env.set("__TweenConnectEvent", connectTweenEvent, true);
state.env.set("__TweenDisconnectEvent", disconnectTweenEvent, true);

let CurrentModulePath = "main.luau";

const ModuleCache = new Map();

function resolveModulePath(modulePath) {
    if (typeof modulePath !== "string" || !modulePath.trim()) {
        throw new Error("require: module path must be a non-empty string");
    }

    if (/[?#:]/.test(modulePath) || modulePath.includes("\\")) {
        throw new Error("require: invalid module path");
    }

    const IsAbsolute = modulePath.startsWith("/");
    const Parts = IsAbsolute
        ? []
        : CurrentModulePath.split("/").slice(0, -1);

    for (const Part of modulePath.split("/")) {
        if (!Part || Part === ".") {
            continue;
        }

        if (Part === "..") {
            if (Parts.length === 0) {
                throw new Error("require: module path is outside public");
            }

            Parts.pop();
            continue;
        }

        Parts.push(Part);
    }

    let Path = Parts.join("/");

    if (!Path) {
        throw new Error("require: invalid module path");
    }

    if (!Path.endsWith(".luau")) {
        Path += ".luau";
    }

    return Path;
}

async function clientRequire(modulePath) {
    const Path = resolveModulePath(modulePath);

    if (ModuleCache.has(Path)) {
        const Cached = ModuleCache.get(Path);

        if (Cached.loading) {
            throw new Error(`require: circular dependency detected: ${Path}`);
        }

        return Cached.value;
    }

    const Entry = {
        loading: true,
        value: undefined
    };

    ModuleCache.set(Path, Entry);

    const PreviousModulePath = CurrentModulePath;
    CurrentModulePath = Path;

    try {
        const Url = `${import.meta.env.BASE_URL}${Path
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`;

        const Response = await fetch(Url);

        if (!Response.ok) {
            if (Response.status === 404) {
                throw new Error(`ModuleNotExists: ${Path}`);
            }
            throw new Error(`ModuleLoadFailed: ${Path} (HTTP ${Response.status})`);
        }

        const Source = await Response.text();
        const ContentType = Response.headers.get("content-type") || "";
        const LooksLikeHtml = /^\uFEFF?\s*(?:<!doctype\s+html|<html\b)/i.test(Source);
        if (ContentType.includes("text/html") || LooksLikeHtml) {
            throw new Error(`ModuleNotExists: ${Path}`);
        }

        const RunModule = state.loadstring(Source, Path, true);

        const Results = await RunModule();
        const Value = Results?.[0];

        Entry.value = Value;
        Entry.loading = false;

        return Value;
    } catch (error) {
        ModuleCache.delete(Path);

        throw new Error(`require("${Path}") failed: ${error.message}`);
    } finally {
        CurrentModulePath = PreviousModulePath;
    }
}

state.env.set("__Require", clientRequire, true);

try {
    const source = await fetch(`${import.meta.env.BASE_URL}main.luau`).then(response => {
        if (!response.ok) {
            throw new Error("Не удалось загрузить main.luau");
        }

        return response.text();
    });

    const run = state.loadstring(`
                Content = {}

        function Content.fromWeb(URL)
            if type(URL) ~= \`string\` or not URL:match(\`^https?://\`) then
                error(\`Content.fromWeb: expected an HTTP or HTTPS URL\`)
            end

            return URL
        end

        function Content.fromLocal(Path)
            if type(Path) ~= \`string\` or Path == \`\` then
                error(\`Content.fromLocal: expected a file path\`)
            end

            if Path:find(\`\\\\\`, 1, true) then
                error(\`Content.fromLocal: invalid file path\`)
            end

            for Part in Path:gmatch(\`[^/]+\`) do
                if Part == \`..\` then
                    error(\`Content.fromLocal: path cannot go outside public\`)
                end
            end

            return __AssetBaseUrl .. Path:gsub(\`^/+\`, \`\`)
        end
        
        Instance = {}

        local EventNames = {
            MouseButton1Click = true,
            MouseEnter = true,
            MouseLeave = true
        }

        local Signals = {}

        local function GetSignal(id, eventName)
            Signals[id] = Signals[id] or {}

            if Signals[id][eventName] then
                return Signals[id][eventName]
            end

            local Signal = {}

            function Signal:Connect(callback)
                if type(callback) ~= "function" then
                    error("Connect expects a function")
                end

                local ConnectionId = __ConnectEvent(id, eventName, callback)

                local Connection = {
                    Connected = true
                }

                function Connection:Disconnect()
                    if not self.Connected then
                        return
                    end

                    __DisconnectEvent(id, ConnectionId)
                    self.Connected = false
                end

                return Connection
            end

            Signals[id][eventName] = Signal

            return Signal
        end

        Instance.new = function(className, props, children)
    if type(className) ~= "string" then
        error("Instance.new: className must be a string")
    end

    if props ~= nil and type(props) ~= "table" then
        error("Instance.new: props must be a table")
    end

    if children ~= nil and type(children) ~= "table" then
        error("Instance.new: children must be a table")
    end

    local id = __InstanceNew(className)

    local Object = {
        __id = id
    }

    Object.Play = function(self)
        __SoundAction(id, "Play")
    end
    Object.Stop = function(self)
        __SoundAction(id, "Stop")
    end
    Object.Pause = function(self)
        __SoundAction(id, "Pause")
    end

    setmetatable(Object, {
        __index = function(self, property)
            if property == "__id" then
                return id
            end

            if property == "Destroy" then
                return function()
                    __Destroy(id)
                    Signals[id] = nil
                end
            end

            if EventNames[property] then
                return GetSignal(id, property)
            end

            return __GetProperty(id, property)
        end,

        __newindex = function(self, property, value)
            if property == "Parent" and type(value) == "table" then
                value = value.__id
            end

            __SetProperty(id, property, value)
        end
    })

    if props then
        for property, value in pairs(props) do
            Object[property] = value
        end
    end

    if children then
        for _, child in ipairs(children) do
            if type(child) ~= "table" or type(child.__id) ~= "number" then
                error("Instance.new: children must contain Instances")
            end

            child.Parent = Object
        end
    end

    return Object
end

        UDim = {
            new = __UDimNew
        }

        UDim2 = {
            new = __UDim2New,
            fromScale = __UDim2FromScale,
            fromOffset = __UDim2FromOffset
        }

        Vector2 = {
            new = __Vector2New
        }

        Color3 = {
            fromRGB = __Color3FromRGB
        }

            Enum = {
            EasingStyle = {
    Linear = "Linear",
    Sine = "Sine",
    Back = "Back",
    Quad = "Quad",
    Cubic = "Cubic",
    Quart = "Quart",
    Quint = "Quint",
    Bounce = "Bounce",
    Elastic = "Elastic",
    Exponential = "Exponential",
    Circular = "Circular"
},

EasingDirection = {
    In = "In",
    Out = "Out",
    InOut = "InOut"
},

PlaybackState = {
    Begin = "Begin",
    Delayed = "Delayed",
    Playing = "Playing",
    Paused = "Paused",
    Completed = "Completed",
    Cancelled = "Cancelled"
},
            ScaleType = {
    Stretch = \`Stretch\`,
    Fit = \`Fit\`,
    Crop = \`Crop\`,
    Tile = \`Tile\`
},
            AutomaticSize = {
                None = \`None\`,
                X = \`X\`,
                Y = \`Y\`,
                XY = \`XY\`
            },

            Font = {
                Arial = \`Arial\`,
                ArialBold = \`ArialBold\`,
                SourceSans = \`SourceSans\`,
                SourceSansBold = \`SourceSansBold\`,
                Montserrat = \`Montserrat\`,
                MontserratMedium = \`MontserratMedium\`,
                MontserratSemibold = \`MontserratSemibold\`,
                MontserratBold = \`MontserratBold\`,
                MontserratBlack = \`MontserratBlack\`,
                Code = \`Code\`
            },

            FillDirection = {
                Vertical = \`Vertical\`,
                Horizontal = \`Horizontal\`
            },

            ScrollingDirection = {
                X = \`X\`,
                Y = \`Y\`,
                XY = \`XY\`
            },

            TextXAlignment = {
                Left = \`Left\`,
                Center = \`Center\`,
                Right = \`Right\`
            },
            HorizontalAlignment = {
                Left = \`Left\`,
                Center = \`Center\`,
                Right = \`Right\`
            },

            VerticalAlignment = {
                Top = \`Top\`,
                Center = \`Center\`,
                Bottom = \`Bottom\`
            },

            SortOrder = {
                LayoutOrder = \`LayoutOrder\`
            }
        }

                TweenInfo = {}

        function TweenInfo.new(Time, EasingStyle, EasingDirection, RepeatCount, Reverses, DelayTime)
            return {
                Time = Time == nil and 1 or Time,
                EasingStyle = EasingStyle or Enum.EasingStyle.Quad,
                EasingDirection = EasingDirection or Enum.EasingDirection.Out,
                RepeatCount = RepeatCount or 0,
                Reverses = Reverses or false,
                DelayTime = DelayTime or 0
            }
        end

        local TweenSignals = {}

        local function GetTweenSignal(id, eventName)
            TweenSignals[id] = TweenSignals[id] or {}

            if TweenSignals[id][eventName] then
                return TweenSignals[id][eventName]
            end

            local Signal = {}

            function Signal:Connect(callback)
                if type(callback) ~= "function" then
                    error("Connect expects a function")
                end

                local ConnectionId = __TweenConnectEvent(id, eventName, callback)

                local Connection = {
                    Connected = true
                }

                function Connection:Disconnect()
                    if not self.Connected then
                        return
                    end

                    __TweenDisconnectEvent(id, ConnectionId)
                    self.Connected = false
                end

                return Connection
            end

            TweenSignals[id][eventName] = Signal

            return Signal
        end

        local TweenService = {}

        function TweenService:Create(instance, tweenInfo, propertyTable)
            if type(instance) ~= "table" or type(instance.__id) ~= "number" then
                error("TweenService:Create expects an Instance")
            end

            if type(tweenInfo) ~= "table" then
                error("TweenService:Create expects TweenInfo")
            end

            if type(propertyTable) ~= "table" then
                error("TweenService:Create expects a property table")
            end

            local id = __TweenCreate(instance.__id, tweenInfo, propertyTable)

            local Tween = {
                __id = id
            }

            function Tween:Play()
                __TweenPlay(self.__id)
            end

            function Tween:Pause()
                __TweenPause(self.__id)
            end

            function Tween:Cancel()
                __TweenCancel(self.__id)
            end

            function Tween:Destroy()
                __TweenDestroy(self.__id)
                TweenSignals[self.__id] = nil
            end

            return setmetatable(Tween, {
                __index = function(self, property)
                    if property == "PlaybackState" then
                        return __TweenGetState(self.__id)
                    end

                    if property == "Completed" or property == "Changed" then
                        return GetTweenSignal(self.__id, property)
                    end
                end
            })
        end

        game = {}

        function game:GetService(serviceName)
            if serviceName == "TweenService" then
                return TweenService
            end

            error("Unknown service: " .. tostring(serviceName))
        end

        Client = setmetatable({
            Device = __ClientDevice,
            Language = __ClientLanguage
        }, {
            __index = function(_, Property)
                if Property == "ScreenSize" then
                    return Vector2.new(__GetClientScreenWidth(), __GetClientScreenHeight())
                elseif Property == "CursorPosition" then
                    return Vector2.new(__GetClientCursorX(), __GetClientCursorY())
                end
            end
        })
            Client.PagePath = __PagePath

function Client.Navigate(Url)
    __Navigate(Url)
end

        function Client.Get(Key)
            return __ClientGet(Key)
        end

        function Client.Set(Key, Value)
            return __ClientSet(Key, Value)
        end

        function require(ModulePath)
            return __Require(ModulePath)
        end

        print = __Print
       
        task = {}

function task.wait(Seconds)
    return __TaskWait(Seconds or 0)
end

        ${source}
    `, "main.luau", true);

    await run();
} catch (error) {
    output.style.display = "block";
    output.textContent += "ERROR: " + error;
    console.error(error);
}
