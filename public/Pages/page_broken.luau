local Text = require(`../UI/Text`)
local Button = require(`../UI/TextButton`)
local Container = require(`../UI/Container`)

local LocalizationService = require(`../LocalizationService`)

return function(errorMessage:string)
	local CoreUI = Instance.new(`ScreenGui`)

	Container({
		type = `image`,
		parentTo = CoreUI,
		listProps = {
			Padding = UDim.new(0, 6),
		},
		containerProps = {
			Image = Content.fromLocal(`Images/404_bg.png`),
			ScaleType = Enum.ScaleType.Crop,
			BackgroundColor3 = Color3.fromRGB(0, 0, 0),
			BackgroundTransparency = 0,
		},
        noListProps = {
            ZIndex = -1,
        },
		noListChildren = {
			Instance.new(`ImageLabel`, {
				ZIndex = 2,
				BackgroundTransparency = 0,
				Image = Content.fromLocal(`Images/404_str.png`),
				Size = UDim2.fromOffset(1147 / 3, 414 / 3),
				Position = UDim2.new(1,15,1,15),
				AnchorPoint = Vector2.new(1, 1),
                ImageColor3 = Color3.fromRGB(0,0,0),
				ImageTransparency = 0.5,
				Parent = CoreUI,
			}),
		},
		children = {
			Text({
				text = `Page {Client.PagePath} was broken`,
				font = `MontserratBlack`,
				textSize = 35,
			}),
			Text({
				text = `Message from main.luau: <i>{errorMessage or `empty message!!!`}</i>`,
				textSize = 20,
			}),
			Button({
				text = LocalizationService.Get(`404_backToMainPage`),
				onClick = function()
					Client.Navigate(`/`)
				end,
			}),
		},
	})
end
