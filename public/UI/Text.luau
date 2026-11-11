export type props = {
    textColor:Color3?,
    text:string,
    textSize:number?,
    parentTo:Instance?,
    font:Font?,
    props:{}?,
}

local function Text(props:props)
    local Properties = {
        TextColor3 = props.textColor or Color3.fromRGB(255, 255, 255),
        TextXAlignment = Enum.TextXAlignment.Center,
        Font = props.font or `Manrope`,
        AutomaticSize = Enum.AutomaticSize.Y,
        Size = UDim2.fromScale(1,0),
        TextSize = props.textSize or 20,
        Text = props.text,
        Parent = props.parentTo
    }

    for PropertyName, Value in pairs(props.props or {}) do
        Properties[PropertyName] = Value
    end


    return Instance.new(`TextLabel`, Properties)
end

return Text