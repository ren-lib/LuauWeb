local Text = require(`../UI/Text`)
local Button = require(`../UI/TextButton`)
local Container = require(`../UI/Container`)

local LocalizationService = require(`../LocalizationService`)


return function()
    local CoreUI = Instance.new(`ScreenGui`)

    local CoreFrame = Container({
        parentTo = CoreUI,
        type = `image`,
        containerProps = {
            Image = Content.fromLocal(`Images/bg.jpg`), 
            ImageColor3 = Color3.fromRGB(100,100,100),
            ScaleType = Enum.ScaleType.Crop,
        },
        children = {
            Text({
                text = LocalizationService.Get(`welcome_title`),
                textSize = Client.Device == `PC` and 40 or 25,
                font = `MontserratBlack`,
            }),
            Text({
                text = LocalizationService.Get(`welcome_subtitle`),
                textSize = Client.Device == `PC` and 30 or 20,
            }),
        },
    })

    if not table.find(LocalizationService.SupportedLanguages, Client.Get(`PinnedLanguage`) or Client.Language) then
        Text({
            text = LocalizationService.Get(`language_not_supported`),
        })
    end

end