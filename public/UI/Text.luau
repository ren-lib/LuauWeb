export type props = {
    textColor:Color3?,
    text:string,
    textSize:number?,
    parentTo:Instance,
    font:Font?,
}

local function Text(props:props)
    local Component = Instance.new(`TextLabel`)
    Component.TextColor3 = props.textColor or Color3.fromRGB(255,255,255)
    Component.Parent = props.parentTo
    Component.Font = props.font or `Montserrat`
    Component.AutomaticSize = Enum.AutomaticSize.Y
    Component.Size = UDim2.fromScale(1, 0)
    Component.TextSize = props.textSize or 20
    Component.Text = props.text

    return Component
end

return Text