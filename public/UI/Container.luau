export type props = {
    listProps:{[string]:any}?,
    containerProps:{[string]:any}?,
    children:{Instance}?,

    animate:boolean?, -- default - false
    parentTo:Instance?,
}

local TweenService = game:GetService(`TweenService`)

local function Container(props:props)
    local ContainerProps = {
        BackgroundTransparency = 1,
        Size = UDim2.fromScale(1, 1),
        Parent = props.parentTo
    }
    for PropertyName, Value in pairs(props.containerProps or {}) do
        ContainerProps[PropertyName] = Value
    end

    local ListProps = {
        SortOrder = Enum.SortOrder.LayoutOrder,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        VerticalAlignment = Enum.VerticalAlignment.Center
    }
    for PropertyName, Value in pairs(props.listProps or {}) do
        ListProps[PropertyName] = Value
    end
    table.insert(props.children, Instance.new(`UIListLayout`, ListProps))

    local Container:GuiObject = Instance.new(
        `Frame`, 
        ContainerProps,
        props.children
    )

    if props.animate then
        Container.AnchorPoint = Vector2.new(.5,.5)
        Container.Position = UDim2.new(.5,0,.5,45)
        TweenService:Create(Container, TweenInfo.new(.5, Enum.EasingStyle.Exponential), {Position = UDim2.fromScale(.5, .5)}):Play()
    end

    return Container
end

return Container