export type props = {
    imageSize:number?,
    textSize:number?,
    text:string,
    image:string,
    font:string?,
    parentTo:Instance?,
    bgColor:Color3?,
    textColor:Color3?,
    onClick:()->(),
}

local TweenService = game:GetService(`TweenService`)

local EnterInfo = TweenInfo.new(.25, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out)
local LeaveInfo = TweenInfo.new(.15, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out)

local function Button(props:props)
    local Button = Instance.new(`TextButton`, {
        AutomaticSize = Enum.AutomaticSize.XY,
        BackgroundColor3 = props.bgColor or Color3.fromHex(`333333`),
        BackgroundTransparency = 1,
        Parent = props.parentTo
    }, {
        Instance.new(`UIPadding`, {
            ApplyOnImage = true,
            PaddingLeft = UDim.new(0, 10),
            PaddingRight = UDim.new(0, 10),
            PaddingTop = UDim.new(0, 5),
            PaddingBottom = UDim.new(0, 5),
        }),
        Instance.new(`UIListLayout`, {
            SortOrder = Enum.SortOrder.LayoutOrder,
            Padding = UDim.new(0,3),
            FillDirection = Enum.FillDirection.Horizontal,
        }),
        Instance.new(`UICorner`, {
            CornerRadius = UDim.new(0,7)
        }),
    })

    local ButtonText = Instance.new(`TextLabel`, {
        LayoutOrder = 2,
        AutomaticSize = Enum.AutomaticSize.XY,
        Text = props.text,
        Font = props.font or `ManropeSemibold`,
        TextColor3 = props.textColor or Color3.fromRGB(255, 255, 255),
        TextSize = props.textSize or 20,
        Parent = Button,
    })
    local ButtonImage = Instance.new(`ImageLabel`, {
        LayoutOrder = 1,
        Image = props.image,
        BackgroundTransparency = 1,
        Size = props.imageSize or UDim2.fromOffset(45, 45),
        ScaleType = Enum.ScaleType.Fit,
        Parent = Button,
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

    local EnterTween = TweenService:Create(ButtonText, EnterInfo, {TextSpacing = 3, Font = props.font or `ManropeBlack`})
    local EnterTweenBg = TweenService:Create(Button, EnterInfo, {BackgroundTransparency = .7})
    local LeaveTween = TweenService:Create(ButtonText, LeaveInfo, {TextSpacing = 0, Font = props.font or `ManropeSemibold`})
    local LeaveTweenBg = TweenService:Create(Button, LeaveInfo, {BackgroundTransparency = 1})

    Button.MouseEnter:Connect(function()
        LeaveTween:Cancel()
        LeaveTweenBg:Cancel()
        EnterTween:Play()
        EnterTweenBg:Play()
    end)
    Button.MouseLeave:Connect(function()
        EnterTween:Cancel()
        EnterTweenBg:Cancel()
        LeaveTween:Play()
        LeaveTweenBg:Play()
    end)

    return Button
end

return Button
