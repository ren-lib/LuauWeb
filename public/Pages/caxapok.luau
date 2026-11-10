local CustomButton = require(`../UI/CaxapokButton`)

return function()
    local CoreUI = Instance.new(`ScreenGui`)

    local Button
    
    Button = CustomButton({
        textSize = 35,
        text = `тестапленка`,
        parentTo = CoreUI,
        onClick = function()
            Button.TextSize += 15
        end,
    })
    Button.Position = UDim2.fromScale(.5, .5)
    Button.AnchorPoint = Vector2.new(.5,.5)
end