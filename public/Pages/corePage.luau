--[[
corePage отображается на всех страницах
]]

local TextButton = require(`../UI/TextButton`)
local Text = require(`../UI/Text`)

local LocalizationService = require(`../LocalizationService`)

return function()
	local CoreUI = Instance.new(`ScreenGui`)
	CoreUI.DisplayOrder = 1000

	local CurrentDropDownMenu: GuiObject?
	local DropDowns = {
		Language = Instance.new(`Frame`, {
			Name = `Language`,
			ZIndex = 2,
			Position = UDim2.fromOffset(35, 35),
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
				PaddingRadius = UDim.new(0, 6),
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
	local function OnDropDownUpdate(Name:string)
		if CurrentDropDownMenu then
			CurrentDropDownMenu.Visible = false

			if CurrentDropDownMenu.Name == Name then
				CurrentDropDownMenu = nil
				return
			end
			CurrentDropDownMenu = nil
		end
        CloseTopDownButton.Visible = true
		CurrentDropDownMenu = DropDowns.Language
        DropDowns[Name].Position = UDim2.fromOffset(Client.CursorPosition.X, Client.CursorPosition.Y)
		DropDowns[Name].Visible = true
	end

	-- язык
	for _, Language in pairs(LocalizationService.SupportedLanguages) do
		TextButton({
			parentTo = DropDowns.Language,
			text = LocalizationService.Get(Language),
			onClick = function()
				Client.Set(`PinnedLanguage`, Language)
				Client.Navigate(Client.PagePath)
			end,
		})
	end

	-- главный Topbar
	local Topbar = Instance.new(`ScrollingFrame`, {
		ZIndex = 1,
		AutomaticCanvasSize = `X`,
		BackgroundTransparency = 0.6,
		BackgroundColor3 = Color3.fromRGB(0, 0, 0),
		Size = UDim2.new(1, 0, 0, 70),
		Parent = CoreUI,
	}, {
		Instance.new(`UIListLayout`, {
			Padding = UDim.new(0, 6),
			FillDirection = Enum.FillDirection.Horizontal,
		}),
		Instance.new(`UIPadding`, {
			PaddingRadius = UDim.new(0, 15),
		}),
        TextButton({
            text = LocalizationService.Get(`main`),
            onClick = function()
                Client.Navigate(`/`)
            end,
        }),
		TextButton({
			text = LocalizationService.Get(`blog_button`),
			onClick = function()
				Client.Navigate(`blog`)
			end,
		}),
        TextButton({
			text = LocalizationService.Get(`language`),
			onClick = function()
				OnDropDownUpdate(`Language`)
			end,
		}),
	})
end
