export type props = {
    textSize:number?,
    text:string,
    font:string?,
    parentTo:Instance?,
    bgColor:Color3?,
    textColor:Color3?,
    onClick:()->(),
}

local TweenService = game:GetService(`TweenService`)

local function Button(props:props)
    local Button = Instance.new(`TextButton`, {
        AutomaticSize = Enum.AutomaticSize.XY,
        Text = props.text,
        BackgroundColor3 = props.bgColor or Color3.fromHex(`333333`),
        BackgroundTransparency = 1,
        TextColor3 = props.textColor or Color3.fromRGB(255, 255, 255),
        TextSize = props.textSize or 20,
        Font = props.font or `ManropeSemibold`,
        Parent = props.parentTo
    }, {
        Instance.new(`UIPadding`, {
            PaddingLeft = UDim.new(0, 10),
            PaddingRight = UDim.new(0, 10),
            PaddingTop = UDim.new(0, 5),
            PaddingBottom = UDim.new(0, 5),
        }),
        Instance.new(`UICorner`, {
            CornerRadius = UDim.new(0,7)
        }),
    })

    Button.MouseButton1Click:Connect(props.onClick)

    local EnterTween = TweenService:Create(
        Button, 
        TweenInfo.new(
            .25, 
            Enum.EasingStyle.Cubic,
            Enum.EasingDirection.Out
        ), 
        {
            BackgroundTransparency = .7,
            TextSpacing = 3,
            Font = props.font or `ManropeBlack`,
        }
    )
    local LeaveTween = TweenService:Create(
        Button, 
        TweenInfo.new(
            .15, 
            Enum.EasingStyle.Cubic,
            Enum.EasingDirection.Out
        ), 
        {
            BackgroundTransparency = 1,
            TextSpacing = 0,
            Font = props.font or `ManropeSemibold`,
        }
    )

    Button.MouseEnter:Connect(function()
        LeaveTween:Cancel()
        EnterTween:Play()
    end)
    Button.MouseLeave:Connect(function()
        EnterTween:Cancel()
        LeaveTween:Play()
    end)

    return Button
end

return Button
