local Text = require(`../UI/Text`)
local PageContainer = require(`../UI/PageContainer`)

local TweenService = game:GetService(`TweenService`)
local LocalizationService = require(`../LocalizationService`)

return function()
    local CoreUI = Instance.new(`ScreenGui`)

    local Pattern = Instance.new(`ImageLabel`, {
        Image = Content.fromLocal(`Images/main_page_pattern.png`), 
        ImageColor3 = Color3.fromRGB(100,100,100),
        ScaleType = Enum.ScaleType.Crop,
        Size = UDim2.new(1,250,1,250),
        AnchorPoint = Vector2.new(0,.5),
        Position = UDim2.new(0,0,.5,0),
        Parent = CoreUI,
    })

    local PatternTween = TweenService:Create(
        Pattern, 
        TweenInfo.new(15, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1, true), 
        {
            AnchorPoint = Vector2.new(1,.5),
            Position = UDim2.fromScale(1, .5),
        }
    )

    PatternTween:Play()

    PageContainer({
        parentTo = CoreUI,
        title = LocalizationService.Get(`welcome_title`),
        subTitle = LocalizationService.Get(`welcome_subtitle`),
    })
end