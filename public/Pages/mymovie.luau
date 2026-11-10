local TextButton = require(`../UI/TextButton`)

return function()
    local CoreUI = Instance.new(`ScreenGui`)
                local Sound = Instance.new(`Sound`)

    local test = TextButton({
        parentTo = CoreUI,
        text = `play my movie game!`,
        onClick = function()
    Sound.SoundId = Content.fromLocal(`Audio/my_movie.m4a`)
    Sound:Play()
        end,
    })
    test.Position = UDim2.fromScale(.5, .5)
    test.AnchorPoint = Vector2.new(.5,.5)
end
