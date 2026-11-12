local PageContainer = require(`../../UI/PageContainer`)

return function()
    local CoreUI = Instance.new(`ScreenGui`)

    PageContainer({
        parentTo = CoreUI,
        title = `Привет!`,
        subTitle = `это тест блога. пока что тут нету ценной информации, но скоро она появится... обещаю🦄`,
        listProps = {
            HorizontalAlignment = Enum.HorizontalAlignment.Left,
        },
        children = {
            Instance.new(`ImageLabel`, {
                LayoutOrder = -100,
                Size = UDim2.fromOffset(150, 150),
                Image = Content.fromLocal(`Images/roblox_studio_icon.png`)
            })
        }
    })
end