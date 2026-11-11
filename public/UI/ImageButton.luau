export type props = {
    imageSize:UDim2?,
    image:string,
    parentTo:Instance?,
    bgColor:Color3?,
    onClick:(button:GuiButton)->(),
}

local TweenService = game:GetService(`TweenService`)

local function Button(props:props)
    local Button = Instance.new(`ImageButton`, {
        Image = props.image,
        BackgroundColor3 = props.bgColor or Color3.fromHex(`333333`),
        BackgroundTransparency = 1,
        Size = props.imageSize or UDim2.fromOffset(45, 45),
        ScaleType = Enum.ScaleType.Fit,
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

    Button.MouseButton1Click:Connect(function()
        props.onClick(Button)
    end)

    local EnterTween = TweenService:Create(
        Button, 
        TweenInfo.new(
            .25, 
            Enum.EasingStyle.Cubic,
            Enum.EasingDirection.Out
        ), 
        {
            BackgroundTransparency = .7,
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
