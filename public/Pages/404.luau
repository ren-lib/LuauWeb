local Text = require(`../UI/Text`)
local Button = require(`../UI/TextButton`)
local Container = require(`../UI/Container`)

local LocalizationService = require(`../LocalizationService`)

return function()
	local CoreUI = Instance.new(`ScreenGui`)

	local ErrorImage = Instance.new(`ImageLabel`, {
		ZIndex = -1,
		BackgroundTransparency = 0,
		Image = Content.fromLocal(`Images/404_str.png`),
		Size = UDim2.fromOffset(1147 / 3, 414 / 3),
		Position = UDim2.fromScale(0.5, 0.5),
		AnchorPoint = Vector2.new(0.5, 0.5),
		ImageColor3 = Color3.fromRGB(0, 0, 0),
		ImageTransparency = 0.5,
		Parent = CoreUI,
	})

	task.spawn(function()
		while true do
			ErrorImage.Rotation = math.random(-6, 6)
			task.wait(0.2)
		end
	end)

	Container({
		animate = true,
		parentTo = CoreUI,
		listProps = {
			Padding = UDim.new(0, 6),
		},
		containerProps = {
			BackgroundColor3 = Color3.fromRGB(118, 7, 7),
			BackgroundTransparency = .9,
		},
		children = {
			Text({
				text = LocalizationService.Get(`404_title`),
				textSize = 45,
				font = `MontserratBlack`,
			}),
			Text({
				text = LocalizationService.Get(`404_subtitle`),
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
