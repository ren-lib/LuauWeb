const Gui = ['ScreenGui']
const Visual = ['Frame', 'ScrollingFrame', 'TextLabel', 'TextButton', 'ImageLabel', 'ImageButton']
const Text = ['TextLabel', 'TextButton']
const Image = ['ImageLabel', 'ImageButton']
const Decor = ['UICorner', 'UIStroke', 'UIListLayout', 'UIPadding']

// Contract catalog for the currently implemented Luau-facing properties.
// classNames is explicit so editor tooling and validation can share the same API.
export const INSTANCE_PROPERTY_SPECS = Object.freeze({
    ClassName: { type: 'string', classNames: [...Gui, ...Visual, ...Decor], readOnly: true },
    Name: { type: 'string', default: 'ClassName', classNames: [...Gui, ...Visual, ...Decor] },
    Parent: { type: 'Instance?', classNames: [...Gui, ...Visual, ...Decor] },
    Visible: { type: 'boolean', default: true, classNames: Visual },
    Size: { type: 'UDim2', default: { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 0 } }, classNames: Visual },
    Position: { type: 'UDim2', default: { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 0 } }, classNames: Visual },
    AnchorPoint: { type: 'Vector2', default: { X: 0, Y: 0 }, classNames: Visual },
    AutomaticSize: { type: 'Enum.AutomaticSize', default: 'None', classNames: Visual },
    LayoutOrder: { type: 'number', default: 0, classNames: Visual },
    ZIndex: { type: 'number', default: 1, classNames: Visual },
    DisplayOrder: { type: 'number', default: 0, classNames: Gui },
    BackgroundColor3: { type: 'Color3', default: 'transparent', classNames: [...Gui, ...Visual] },
    BackgroundTransparency: { type: 'number', default: 0, classNames: [...Gui, ...Visual] },
    Text: { type: 'string', default: '', classNames: Text },
    RichText: { type: 'boolean', default: true, classNames: ['TextLabel'] },
    TextColor3: { type: 'Color3', classNames: Text },
    TextSize: { type: 'number', classNames: Text },
    TextXAlignment: { type: 'Enum.TextXAlignment', classNames: Text },
    TextYAlignment: { type: 'Enum.TextYAlignment', classNames: Text },
    Font: { type: 'Enum.Font', default: 'Arial', classNames: Text },
    Image: { type: 'string', default: '', classNames: Image },
    ImageColor3: { type: 'Color3', default: 'rgb(255, 255, 255)', classNames: Image },
    ImageTransparency: { type: 'number', default: 0, classNames: Image },
    ScaleType: { type: 'Enum.ScaleType', default: 'Stretch', classNames: Image },
    CanvasSize: { type: 'UDim2', classNames: ['ScrollingFrame'] },
    CanvasPosition: { type: 'Vector2', default: { X: 0, Y: 0 }, classNames: ['ScrollingFrame'] },
    AutomaticCanvasSize: { type: 'Enum.AutomaticSize', default: 'None', classNames: ['ScrollingFrame'] },
    ScrollingEnabled: { type: 'boolean', default: true, classNames: ['ScrollingFrame'] },
    ScrollingDirection: { type: 'Enum.ScrollingDirection', default: 'XY', classNames: ['ScrollingFrame'] },
    ScrollBarThickness: { type: 'number', default: 12, classNames: ['ScrollingFrame'] },
    CornerRadius: { type: 'UDim', default: { Scale: 0, Offset: 8 }, classNames: ['UICorner'] },
    Color: { type: 'Color3', default: 'rgb(255, 255, 255)', classNames: ['UIStroke'] },
    Thickness: { type: 'number', default: 1, classNames: ['UIStroke'] },
    Transparency: { type: 'number', default: 0, classNames: ['UIStroke'] },
    FillDirection: { type: 'Enum.FillDirection', default: 'Vertical', classNames: ['UIListLayout'] },
    Padding: { type: 'UDim', default: { Scale: 0, Offset: 0 }, classNames: ['UIListLayout', 'UIPadding'] },
    PaddingRadius: { type: 'UDim', default: { Scale: 0, Offset: 0 }, classNames: ['UIPadding'] },
    PaddingTop: { type: 'UDim', default: { Scale: 0, Offset: 0 }, classNames: ['UIPadding'] },
    PaddingBottom: { type: 'UDim', default: { Scale: 0, Offset: 0 }, classNames: ['UIPadding'] },
    PaddingLeft: { type: 'UDim', default: { Scale: 0, Offset: 0 }, classNames: ['UIPadding'] },
    PaddingRight: { type: 'UDim', default: { Scale: 0, Offset: 0 }, classNames: ['UIPadding'] },
    HorizontalAlignment: { type: 'Enum.HorizontalAlignment', default: 'Left', classNames: ['UIListLayout'] },
    VerticalAlignment: { type: 'Enum.VerticalAlignment', default: 'Top', classNames: ['UIListLayout'] },
    SortOrder: { type: 'Enum.SortOrder', default: 'LayoutOrder', classNames: ['UIListLayout'] }
})

export function getInstancePropertySpec(property) {
    return INSTANCE_PROPERTY_SPECS[property]
}

export function isInstancePropertySupported(className, property) {
    return INSTANCE_PROPERTY_SPECS[property]?.classNames.includes(className) ?? false
}

