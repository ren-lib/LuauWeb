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
        BackgroundColor3 = props.bgColor or Color3.fromRGB(255, 255, 255),
        TextColor3 = props.textColor or Color3.fromRGB(0, 0, 0),
        TextSize = props.textSize or 20,
        Font = props.font or `Montserrat`,
        Parent = props.parentTo
    })

    Button.MouseButton1Click:Connect(props.onClick)

    local Corner = Instance.new(`UICorner`, {
        CornerRadius = UDim.new(0,8),
        Parent = Button
    })
    local Padding = Instance.new(`UIPadding`, {
        PaddingLeft = UDim.new(0, 10),
        PaddingRight = UDim.new(0, 10),
        PaddingTop = UDim.new(0, 5),
        PaddingBottom = UDim.new(0, 5),
        Parent = Button
    })

    local EnterTween = TweenService:Create(
        Corner, 
        TweenInfo.new(
            .15, 
            Enum.EasingStyle.Sine,
            Enum.EasingDirection.Out
        ), 
        {
            CornerRadius = UDim.new(.5,0)
        }
    )
    local LeaveTween = TweenService:Create(
        Corner, 
        TweenInfo.new(
            .07, 
            Enum.EasingStyle.Sine,
            Enum.EasingDirection.Out
        ), 
        {
            CornerRadius = UDim.new(0,8)
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