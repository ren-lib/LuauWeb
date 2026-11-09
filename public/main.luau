local CoreUI = Instance.new(`ScreenGui`)

local Container = Instance.new(`Frame`)
Container.Size = UDim2.fromScale(1, 1)
Container.BackgroundColor3 = Color3.fromRGB(137, 129, 129)
Container.Parent = CoreUI

local TestButton = Instance.new(`TextButton`)
TestButton.AutomaticSize = Enum.AutomaticSize.XY
TestButton.Text = `game`
TestButton.Parent = Container

local TestCorner = Instance.new(`UICorner`)
TestCorner.Parent = TestButton
TestButton.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
TestButton.TextColor3 = Color3.fromRGB(0, 0, 0)
TestCorner.CornerRadius = UDim.new(0,15)
TestButton.MouseButton1Click:Connect(function()
    TestButton:Destroy()
end)