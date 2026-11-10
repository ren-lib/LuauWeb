local Text = require(`../UI/Text`)
local Container = require(`../UI/Container`)

local LocalizationService = require(`../LocalizationService`)

return function()
    local CoreUI = Instance.new(`ScreenGui`)

    Container({
        type = `image`,
        parentTo = CoreUI,
        containerProps = {
            Image = Content.fromLocal(`Images/blog_bg.png`),
            ScaleType = Enum.ScaleType.Crop,
        },
        children = {
            Text({
				text = LocalizationService.Get(`blog_title`),
				font = `MontserratBlack`,
				textSize = 35,
			}),
			Text({
				text = LocalizationService.Get(`blog_subtitle`),
				textSize = 20,
			}),
        }
    })
end