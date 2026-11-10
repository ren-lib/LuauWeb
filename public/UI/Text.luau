export type props = {
    textColor:Color3?,
    text:string,
    textSize:number?,
    parentTo:Instance?,
    font:Font?,
    --mode:string?,
}

local function Text(props:props)
    return Instance.new(`TextLabel`, {
        TextColor3 = props.textColor or Color3.fromRGB(255, 255, 255),
        TextXAlignment = Enum.TextXAlignment.Center,
        Font = props.font or `Montserrat`,
        AutomaticSize = props.mode or Enum.AutomaticSize.Y,
        Size = UDim2.fromScale(props.mode == `X` and 0 or 1, props.mode == `Y` and 0 or 1),
        TextSize = props.textSize or 20,
        Text = props.text,
        Parent = props.parentTo
    })
end

return Text