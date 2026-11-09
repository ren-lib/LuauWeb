--[[
Client.ScreenSize	Размер окна браузера
Client.Device	Тип устройства
Client.Language	Язык браузера
Client.Get(Key)	Получение сохранённых данных
Client.Set(Key, Value)	Сохранение данных
]]

local TweenService = game:GetService(`TweenService`)

local LocalizationService = require(`LocalizationService`)
local Text = require(`UI/Text`)

local CoreUI = Instance.new(`ScreenGui`)

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
List.HorizontalAlignment = Enum.HorizontalAlignment.Left
List.VerticalAlignment = Enum.VerticalAlignment.Center
List.Padding = UDim.new(0, 5)
List.Parent = ContentFrame

local Padding = Instance.new(`UIPadding`)
Padding.PaddingBottom = UDim.new(0,15)
Padding.PaddingLeft = UDim.new(0,15)
Padding.PaddingRight = UDim.new(0,15)
Padding.PaddingTop = UDim.new(0,15)
Padding.Parent = ContentFrame

local Icon = Instance.new(`ImageLabel`)
Icon.BackgroundTransparency = 1
Icon.Image = Content.fromLocal(`Images/roblox_studio_icon.svg`)
Icon.Size = UDim2.fromOffset(150, 150)
Icon.Parent = ContentFrame

local WelcomeTitle = Text({
    text = LocalizationService.Get(`welcome`),
    textSize = Client.Device == `Mobile` and 50/2 or 50,
    parentTo = ContentFrame,
    font = `MontserratBold`
})
local Subtitle = Text({
        textSize = Client.Device == `Mobile` and 20/1.5 or 20,
    text = LocalizationService.Get(`welcomeSubtitle`),
    parentTo = ContentFrame,
})
local debrisSubtitle1 = Text({
        textSize = Client.Device == `Mobile` and 15/1.5 or 15,
    text = LocalizationService.Get(`debris1`),
    parentTo = ContentFrame,
})
local debrisSubtitle2 = Text({
        textSize = Client.Device == `Mobile` and 15/1.5 or 15,
    text = LocalizationService.Get(`debris2`),
    parentTo = ContentFrame,
})



local Tween = TweenService:Create(
    BackgroundImage,
    TweenInfo.new(15, Enum.EasingStyle.Exponential, Enum.EasingDirection.InOut, -1, true),
    {
        ImageColor3 = Color3.fromRGB(23, 23, 23)
    }
)

Tween:Play()