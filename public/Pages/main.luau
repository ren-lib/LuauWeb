local PageContainer = require(`../UI/PageContainer`)
local SocialButton = require(`../UI/SocialButton`)

local TweenService = game:GetService(`TweenService`)
local LocalizationService = require(`../LocalizationService`)

return function()
    local CoreUI = Instance.new(`ScreenGui`)
    
    Instance.new(`ImageLabel`, {
        Size = UDim2.fromScale(1, 1),
        ScaleType = Enum.ScaleType.Crop,
        ImageColor3 = Color3.fromRGB(126, 126, 126),
        Image = Content.fromLocal(`Images/main_page_{math.random(1,8)}.png`),
        Parent = CoreUI,
    })
    
    local Pattern = Instance.new(`ImageLabel`, {
        Image = Content.fromLocal(`Images/main_page_pattern.png`), 
        BackgroundTransparency = 1,
        ImageColor3 = Color3.fromRGB(0, 0, 0),
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
        listProps = {
            HorizontalAlignment = Enum.HorizontalAlignment.Left,
            Wraps = true,
            Padding = UDim.new(0,7),
            FillDirection = Enum.FillDirection.Horizontal,
        },
        children = {
            SocialButton({
                image = Content.fromLocal(`Images/roblox_icon.png`),
                bgColor = Color3.fromHex(`335fff`),
                link = `https://www.roblox.com/users/7982667388/profile`,
            }),
            SocialButton({
                image = Content.fromLocal(`Images/roblox_studio_icon.png`),
                bgColor = Color3.fromHex(`335fff`),
                link = `https://devforum.roblox.com/u/renthetruth`,
            })
        },
    })
end