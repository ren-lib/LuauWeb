--[[
corePage отображается на всех страницах
]]

local TextButton = require(`../UI/TextButton`)
local Text = require(`../UI/Text`)
local ImageButton = require(`../UI/ImageButton`)
local SharedButton = require(`../UI/SharedButton`)
local Container = require(`../UI/Container`)

local LocalizationService = require(`../LocalizationService`)

return function()
	local CoreUI = Instance.new(`ScreenGui`)
	CoreUI.DisplayOrder = 1000

	local CurrentDropDownMenu: GuiObject?
	local DropDowns = {
		Language = Instance.new(`Frame`, {
			Name = `Language`,
			ZIndex = 2,
			AnchorPoint = Vector2.new(1,0),
			Position = UDim2.fromScale(1, 0),
			Visible = false,
			Parent = CoreUI,
			BackgroundTransparency = 0.5,
			BackgroundColor3 = Color3.fromRGB(0, 0, 0),
		}, {
			Instance.new(`UICorner`, { CornerRadius = UDim.new(0, 10) }),
			Instance.new(`UIListLayout`, {
				Padding = UDim.new(0, 3),
			}),
			Instance.new(`UIPadding`, {
				PaddingRadius = UDim.new(0, 8),
			}),
		}),
	}

	local CloseTopDownButton = Instance.new(`TextButton`, {
		Visible = false,
		Size = UDim2.fromScale(1, 1),
		Parent = CoreUI,
	})
	CloseTopDownButton.MouseButton1Click:Connect(function()
		if CurrentDropDownMenu then
			CurrentDropDownMenu.Visible = false
			CurrentDropDownMenu = nil
		end
		CloseTopDownButton.Visible = false
	end)

	-- вызывается когда открывается какой либо DropDown из DropDowns
	local function OnDropDownUpdate(name:string, button:GuiButton)
		CloseTopDownButton.Visible = CurrentDropDownMenu == nil
		if CurrentDropDownMenu then
			CurrentDropDownMenu.Visible = false

			if CurrentDropDownMenu.Name == name then
				CurrentDropDownMenu = nil
				return
			end
			CurrentDropDownMenu = nil
		end
		CurrentDropDownMenu = DropDowns.Language
        DropDowns[name].Position = UDim2.new(Client.CursorPosition.X.Scale,0,0,Client.CursorPosition.Y.Offset)
		DropDowns[name].Visible = true
	end

	-- язык
	Text({
		textSize = 10,
		text = LocalizationService.Get(`supported_languages`),
		parentTo = DropDowns.Language,
	})
	for _, Language in pairs(LocalizationService.SupportedLanguages) do
		SharedButton({
			parentTo = DropDowns.Language,
			text = LocalizationService.Get(Language),
			imageSize = UDim2.fromOffset(45, 25),
			image = Content.fromLocal(`Images/lang_{Language}.png`),
			onClick = function()
				Client.Set(`PinnedLanguage`, Language)
				Client.Navigate(Client.PagePath)
			end,
		})
	end
	Text({
		textSize = 10,
		text = LocalizationService.Get(`not_full_supported_languages`),
		parentTo = DropDowns.Language,
	})
	for _, Language in pairs(LocalizationService.NotFullSupportedLanguages) do
		TextButton({
			parentTo = DropDowns.Language,
			text = LocalizationService.Get(Language),
			onClick = function()
				Client.Set(`PinnedLanguage`, Language)
				Client.Navigate(Client.PagePath)
			end,
		})
	end

	--LeftBar
	Instance.new(`Frame`, {
		ZIndex = 1,
		BackgroundTransparency = 0,
		BackgroundColor3 = Color3.fromHex(`191919`),
		Size = UDim2.new(1, 0, 0, 50),
		Parent = CoreUI,
	}, {
		-- leftbar
		Container({
			animate = false,
			listProps = {
				HorizontalAlignment = Enum.HorizontalAlignment.Left,
				FillDirection = Enum.FillDirection.Horizontal,
			},
			children = {
				TextButton({
            		text = LocalizationService.Get(`main`),
					bgColor = Color3.fromRGB(171, 171, 171),
            		onClick = function()
                		Client.Navigate(`/`)
            		end,
        		}),
				TextButton({
					text = LocalizationService.Get(`blog_button`),
					bgColor = Color3.fromRGB(46, 158, 186),
					onClick = function()
						Client.Navigate(`blog`)
					end,
				}),
				TextButton({
					text = LocalizationService.Get(`about_website_button`),
					bgColor = Color3.fromRGB(46, 186, 69),
					onClick = function()
						Client.Navigate(`about`)
					end,
				}),
			},
		}),
		Container({
			animate = false,
			listProps = {
				HorizontalAlignment = Enum.HorizontalAlignment.Right,
				FillDirection = Enum.FillDirection.Horizontal,
			},
			children = {
				ImageButton({
					image = Content.fromLocal(`Images/language.png`),
					onClick = function(button:GuiButton)
						OnDropDownUpdate(`Language`, button)
					end,
				}),
			},
		}),
	})
end
