export type props = {
    text:string,
    textSize:number?,
    parentTo:Instance?,
    onClick:()->(),
}

local function CaxapokButton(props:props)
    local Button = Instance.new(`TextButton`, {
        Text = props.text,
        Parent = props.parentTo,
        TextSize = props.textSize or 20,
        BackgroundColor3 = Color3.fromRGB(195, 63, 63),
        Font = `Oswald`,
    }, {
        Instance.new(`UIGradient`, {
            Rotation = 90,
            Color = ColorSequence.new({
                ColorSequenceKeypoint.new(0, Color3.fromHex("#ffffff")),
                ColorSequenceKeypoint.new(.75, Color3.fromHex(`#a7a7a7`)),
                ColorSequenceKeypoint.new(1, Color3.fromHex(`#a7a7a7`)),
            })
        }),
        Instance.new(`UIStroke`, {
            Color = Color3.fromRGB(33, 19, 19),
            Thickness = 4,
        }),
        Instance.new(`UIPadding`, {
            PaddingLeft = UDim.new(0,4),
            PaddingRight = UDim.new(0,4),
            PaddingTop = UDim.new(0,2),
            PaddingBottom = UDim.new(0,2),
        }),
        Instance.new(`UICorner`, {
            CornerRadius = UDim.new(.25,0),
        })
    })
    
    Button.MouseButton1Click:Connect(props.onClick)

    return Button
end

return CaxapokButton
