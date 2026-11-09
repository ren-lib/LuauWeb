
import { LuauState } from "luau-web";
import {
    createInstance,
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

state.env.set("__InstanceNew", createInstance, true);
state.env.set("__SetProperty", setProperty, true);
state.env.set("__GetProperty", getProperty, true);
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

state.env.set("__ClientScreenWidth", window.innerWidth, true);
state.env.set("__ClientScreenHeight", window.innerHeight, true);
state.env.set("__ClientDevice", IsMobile ? "Mobile" : "PC", true);
state.env.set("__ClientLanguage", (navigator.language || "en-US").split("-")[0], true);

state.env.set("__ClientGet", clientGet, true);
state.env.set("__ClientSet", clientSet, true);

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
            throw new Error(`Failed to load ${Path}: HTTP ${Response.status}`);
        }

        const Source = await Response.text();
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

        function Content.fromNet(URL)
            if type(URL) ~= \`string\` or not URL:match(\`^https?://\`) then
                error(\`Content.fromNet: expected an HTTP or HTTPS URL\`)
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

        Instance.new = function(className)
            local id = __InstanceNew(className)

            local Object = {
                __id = id
            }

            return setmetatable(Object, {
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
                Code = \`Code\`
            },

            FillDirection = {
                Vertical = \`Vertical\`,
                Horizontal = \`Horizontal\`
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

        Client = {
            ScreenSize = {
                X = __ClientScreenWidth,
                Y = __ClientScreenHeight
            },

            Device = __ClientDevice,
            Language = __ClientLanguage
        }

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

        ${source}
    `, "main.luau", true);

    await run();
} catch (error) {
    output.style.display = "block";
    output.textContent += "ERROR: " + error;
    console.error(error);
}
