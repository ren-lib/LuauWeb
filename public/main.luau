local CoreUI = Instance.new(`ScreenGui`)
local LocalizationService = require(`LocalizationService`)
local Text = require(`UI/Text`)

local BackgroundImage = Instance.new(`ImageLabel`)
BackgroundImage.ScaleType = Enum.ScaleType.Crop
BackgroundImage.Size = UDim2.fromScale(1,1)
BackgroundImage.Image = Content.fromLocal(`Images/bg.jpg`)
BackgroundImage.ImageColor3 = Color3.fromRGB(100,100,100)
BackgroundImage.Parent = CoreUI

local ContentFrame = Instance.new(`Frame`)
ContentFrame.Size = UDim2.fromScale(1, 1)
ContentFrame.Parent = CoreUI

local List = Instance.new(`UIListLayout`)
List.SortOrder = Enum.SortOrder.LayoutOrder
List.HorizontalAlignment = Enum.HorizontalAlignment.Center
List.VerticalAlignment = Enum.VerticalAlignment.Center
List.Padding = UDim.new(0, 5)
List.Parent = ContentFrame

local WelcomeTitle = Text({
    text = LocalizationService.Get(`welcome`),
    textSize = 50,
    parentTo = ContentFrame,
    font = `MontserratBold`
})
local Subtitle = Text({
    text = LocalizationService.Get(`welcomeSubtitle`),
    parentTo = ContentFrame,
})
