export type props = {
    listProps:{[string]:any}?,
    containerProps:{[string]:any}?,
    children:{Instance},

    noListChildren:{Instance}?,
    noListProps:{[string]:any}?,

    parentTo:Instance,
    type:string?, -- {`image`, `frame`}, default - frame
}

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

    local Container = Instance.new(props.type == `image` and `ImageLabel` or `Frame`, ContainerProps)
    Instance.new(`UIListLayout`, ListProps).Parent = Container
    for _, Child in ipairs(props.children) do
        Child.Parent = Container
    end

    if props.noListChildren then
       Instance.new(`Frame`, {
            Parent = Container,
        }, props.noListProps or {}, props.noListChildren)
    end

    return Container
end

return Container