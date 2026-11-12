export type props = {
	link: string,
	image: string,
    bgColor:Color3?,
}

local function SocialButton(props: props)
	local Button = Instance.new(`ImageButton`, {
		Size = UDim2.fromOffset(70, 70),
        BackgroundColor3 = props.bgColor,
        BackgroundTransparency = 0,
        Image = props.image,
	}, {
        Instance.new(`UIPadding`, {
            PaddingRadius = UDim.new(0,15),
        }),
        Instance.new(`UICorner`, {
            CornerRadius = UDim.new(0,10),
        }),
    })

    Button.MouseButton1Click:Connect(function()
        Client.Navigate(props.link)
    end)

    return Button
end

return SocialButton
