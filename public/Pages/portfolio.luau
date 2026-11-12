local PageContainer = require(`../UI/PageContainer`)
local Text = require(`../UI/Text`)
local GameButton = require(`../UI/GameButton`)

local LocalizationService = require(`../LocalizationService`)

return function()
    local CoreUI = Instance.new(`ScreenGui`)

    local bg = Instance.new(`ImageLabel`, {
        Image = Content.fromLocal(`Images/portfolio_bg.png`), 
        ScaleType = Enum.ScaleType.Crop,
        Size = UDim2.fromScale(1, 1),
        Parent = CoreUI,
    })
    local gameBg = Instance.new(`ImageLabel`, {
        ImageTransparency = 1,
        ImageColor3 = Color3.fromRGB(100,100,100),
        ScaleType = Enum.ScaleType.Crop,
        Size = UDim2.fromScale(1, 1),
        Parent = CoreUI,
    })

    PageContainer({
        parentTo = CoreUI,
        title = LocalizationService.Get(`portfolio_title`),
        listProps = {
            HorizontalAlignment = Enum.HorizontalAlignment.Left,
            Padding = UDim.new(0,2),
        },
        children = {
            Text({
				props = { TextXAlignment = Enum.TextXAlignment.Left },
				text = LocalizationService.Get(`portfolio_active_dev`),
				textSize = 35,
				font = `MontserratBlack`,
			}),
            Text({
				props = { TextXAlignment = Enum.TextXAlignment.Left },
				text = LocalizationService.Get(`portfolio_active_dev_subtitle`),
				textSize = 20,
			}),
            GameButton({
                currentBackground = bg,
                gameBackground = gameBg,

                title = LocalizationService.Get(`efc`),
                titleProps = {
                    Font = `OswaldBold`
                },
                subTitle = LocalizationService.Get(`efc_desc`),
                subTitleProps = {
                    Font = `Oswald`
                },
                link = `portfolio/caxapok`,
                image = Content.fromLocal(`Images/caxapok_button_bg.png`),
            })
        },
    })
end