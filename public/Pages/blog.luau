local PageContainer = require(`../UI/PageContainer`)
local Text = require(`../UI/Text`)

local BlogPosts = require(`../BlogPosts`)
local LocalizationService = require(`../LocalizationService`)

return function()
    local CoreUI = Instance.new(`ScreenGui`)

    Instance.new(`ImageLabel`, {
        Image = Content.fromLocal(`Images/blog_bg.png`), 
        ScaleType = Enum.ScaleType.Crop,
        Size = UDim2.fromScale(1, 1),
        Parent = CoreUI,
    })

    local PostButtons = {
        Instance.new(`UIListLayout`, {
            HorizontalAlignment = Enum.HorizontalAlignment.Left,
            Padding = UDim.new(0,8),
        }),
    }

    for _, PostData in pairs(BlogPosts) do
        local PostButton = Instance.new(`TextButton`, {
            BackgroundTransparency = .5,
            BackgroundColor3 = Color3.fromRGB(0,0,0),
            Size = UDim2.fromScale(1, 0),
            AutomaticSize = `Y`,
        }, {
            Instance.new(`UIListLayout`),
            Instance.new(`UICorner`),
            Instance.new(`UIPadding`, {PaddingRadius = UDim.new(0,6)}),
            Text({
                font = `MontserratBlack`,
                textSize = 25,
                text = PostData.title,
                props = { TextXAlignment = Enum.TextXAlignment.Left },
            }),
            Text({
                textSize = 15,
                text = PostData.subTitle,
                props = { TextXAlignment = Enum.TextXAlignment.Left },
            }),
        })
        
        PostButton.MouseButton1Click:Connect(function()
            Client.Navigate(`blog/{PostData.value}`)
        end)

        table.insert(PostButtons, PostButton)
    end

    PageContainer({
        parentTo = CoreUI,
        title = LocalizationService.Get(`blog_title`),
        subTitle = LocalizationService.Get(`blog_subtitle`),
        listProps = {
            HorizontalAlignment = Enum.HorizontalAlignment.Left,
            Padding = UDim.new(0,7),
        },
        children = {
            Instance.new(`ScrollingFrame`, {
                AutomaticCanvasSize = `Y`,
                Size = Client.Device == `PC` and UDim2.new(0,450,.5,0) or UDim2.fromScale(1, .5),
            }, PostButtons)
        },
    })
end