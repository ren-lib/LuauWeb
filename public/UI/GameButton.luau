export type props = {
	title: string,
	titleProps: { [string]: any }?,

	subTitle: string,
	subTitleProps: { [string]: any }?,

	link: string,
	image: string,
    gameBackground:ImageLabel,
}

local TweenService = game:GetService(`TweenService`)

local Text = require(`Text`)

local function GameButton(props: props)
	local titleProps = {
        Font = `MontserratBlack`,
        TextSize = 25,
        TextXAlignment = Enum.TextXAlignment.Left,
    }
	local subTitleProps = {
        TextSize = 15,
        TextXAlignment = Enum.TextXAlignment.Left,
    }

    for PropertyName, Value in pairs(props.titleProps or {}) do
        titleProps[PropertyName] = Value
    end
    for PropertyName, Value in pairs(props.subTitleProps or {}) do
        titleProps[PropertyName] = Value
    end

	local GameButton = Instance.new(`TextButton`, {
        BackgroundTransparency = .3,
        BackgroundColor3 = Color3.fromRGB(0,0,0),
		Size = UDim2.fromScale(1, 0),
		AutomaticSize = `Y`,
	}, {
		Instance.new(`UIListLayout`, {
			HorizontalAlignment = Enum.HorizontalAlignment.Left,
			FillDirection = Enum.FillDirection.Vertical,
		}),
		Instance.new(`UICorner`),
		Instance.new(`UIPadding`, {
			PaddingRadius = UDim.new(0,8),
			ApplyOnImage = false,
		}),
		Text({
			text = props.title,
			props = titleProps,
		}),
		Text({
			text = props.subTitle,
			props = subTitleProps,
		}),
	})

    local GameBackgroundVisibleTween = TweenService:Create(
        props.gameBackground,
        TweenInfo.new(.15),
        {
            ImageTransparency = 0
        }
    )
    local GameBackgroundHideTween = TweenService:Create(
        props.gameBackground,
        TweenInfo.new(.1),
        {
            ImageTransparency = 1
        }
    )

    GameButton.MouseEnter:Connect(function()
        props.gameBackground.Image = props.image
        GameBackgroundHideTween:Cancel()
        GameBackgroundVisibleTween:Play()
    end)
    GameButton.MouseLeave:Connect(function()
        GameBackgroundVisibleTween:Cancel()
        GameBackgroundHideTween:Play()
    end)

	GameButton.MouseButton1Click:Connect(function()
		Client.Navigate(props.link)
	end)

	return GameButton
end

return GameButton
