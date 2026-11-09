```js
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

try {
    const source = await fetch(`${import.meta.env.BASE_URL}main.luau`).then(response => {
        if (!response.ok) {
            throw new Error("Не удалось загрузить main.luau");
        }

        return response.text();
    });

    const run = state.loadstring(`
        local Instance = {}

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

        local UDim = {
            new = __UDimNew
        }

        local UDim2 = {
            new = __UDim2New,
            fromScale = __UDim2FromScale,
            fromOffset = __UDim2FromOffset
        }

        local Vector2 = {
            new = __Vector2New
        }

        local Color3 = {
            fromRGB = __Color3FromRGB
        }

        local Enum = {
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
                Gotham = \`Gotham\`,
                GothamMedium = \`GothamMedium\`,
                GothamSemibold = \`GothamSemibold\`,
                GothamBold = \`GothamBold\`,
                Code = \`Code\`
            }
        }

        local print = __Print

        ${source}
    `, "main.luau", true);

    await run();
} catch (error) {
    output.style.display = "block";
    output.textContent += "ERROR: " + error;
    console.error(error);
}
```
