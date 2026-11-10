import { renderDecorations, applyListLayout, applyUIPadding } from './layout.js';
import { renderText } from './rich-text.js';

const FontStyles = {
    Arial: ["Arial, sans-serif", 400],
    ArialBold: ["Arial, sans-serif", 700],
    SourceSans: ['"Source Sans 3", Arial, sans-serif', 400],
    SourceSansBold: ['"Source Sans 3", Arial, sans-serif', 700],
    Montserrat: ['"Montserrat", sans-serif', 400],
    MontserratMedium: ['"Montserrat", sans-serif', 500],
    MontserratSemibold: ['"Montserrat", sans-serif', 600],
    MontserratBold: ['"Montserrat", sans-serif', 700],
    MontserratBlack: ['"Montserrat", sans-serif', 900],
    Code: ["monospace", 400]
};

export function setInstanceProperty(instance, property, value) {
        switch (property) {
            case "Name":
                instance._name = String(value);
                break;

            case "CanvasSize":
    instance._canvasSize = value;
    instance.scheduleAutomaticCanvasSize();
    break;

case "CanvasPosition":
    instance._canvasPosition = {
        X: Number(value.X) || 0,
        Y: Number(value.Y) || 0
    };

    if (instance.ClassName === "ScrollingFrame") {
        instance.Element.scrollLeft = instance._canvasPosition.X;
        instance.Element.scrollTop = instance._canvasPosition.Y;
    }
    break;

case "AutomaticCanvasSize":
    instance._automaticCanvasSize = value;
    instance.scheduleAutomaticCanvasSize();
    break;

case "ScrollingEnabled":
    instance._scrollingEnabled = Boolean(value);
    instance.applyScrollingStyles();
    break;

case "ScrollingDirection":
    instance._scrollingDirection = value;
    instance.applyScrollingStyles();
    break;

case "ScrollBarThickness":
    instance._scrollBarThickness = Math.max(0, Number(value) || 0);
    instance.Element.style.scrollbarWidth =
        instance._scrollBarThickness === 0 ? "none" : "auto";
    instance.Element.style.setProperty("--scrollbar-thickness", `${instance._scrollBarThickness}px`);
    break;
            case "DisplayOrder":
    if (instance.ClassName === "ScreenGui") {
        instance._displayOrder = Number(value) || 0;
        instance.Element.style.zIndex = instance._displayOrder;
    }

    break;
            case "Size":
                instance._size = value;
                instance.applySize();
                break;

            case "Position":
                instance._position = value;
                instance.applyPosition();
                break;

            case "AnchorPoint":
                instance._anchorPoint = value;
                instance.applyPosition();
                break;

            case "AutomaticSize":
                instance._automaticSize = value;
                instance.applySize();
                break;

            case "LayoutOrder":
                instance._layoutOrder = Number(value) || 0;
                instance.Element.style.order = instance._layoutOrder;
                break;

            case "ZIndex": {
                const ZIndex = Number(value);
                instance._zIndex = Number.isFinite(ZIndex) ? Math.trunc(ZIndex) : 1;
                instance.Element.style.zIndex = instance._zIndex;
                break;
            }

            case "Visible":
                instance._visible = Boolean(value);
                if (instance.Element) {
                    instance.Element.hidden = !instance._visible;
                }
                instance._parent?.scheduleAutomaticSize();
                break;

            case "BackgroundColor3":
                instance._backgroundColor3 = value;
                instance.applyBackgroundColor();
                break;

            case "BackgroundTransparency":
    instance._backgroundTransparency = instance.ClassName === "ScreenGui"
        ? 1
        : Math.max(0, Math.min(1, Number(value)));

    instance.applyBackgroundColor();
    break;
            case "Image":
                instance._image = String(value || "");
                instance.applyImage();
                break;

            case "ImageColor3":
                instance._imageColor3 = value;
                instance.applyImage();
                break;

            case "ImageTransparency":
                instance._imageTransparency = Math.max(0, Math.min(1, Number(value)));
                instance.applyImage();
                break;

            case "ScaleType":
                instance._scaleType = value;
                instance.applyImage();
                break;

            case "TextColor3":
                instance._textColor3 = value;
                instance.Element.style.color = value;
                break;

            case "Font": {
                const Font = FontStyles[value] || FontStyles.Arial;
                instance._font = value;

                instance.Element.style.fontFamily = Font[0];
                instance.Element.style.fontWeight = Font[1];
                break;
            }

            case "Text":
                instance._text = String(value);
                renderText(instance);
                instance._parent?.scheduleAutomaticSize();
                break;

            case "RichText":
                instance._richText = Boolean(value);
                renderText(instance);
                instance._parent?.scheduleAutomaticSize();
                break;

            case "TextSize":
                instance._textSize = Number(value);
                instance.Element.style.fontSize = `${value}px`;
                instance._parent?.scheduleAutomaticSize();
                break;
case "TextXAlignment":
    instance._textXAlignment = value;
    instance.Element.style.textAlign = value.toLowerCase();
    break;

case "TextYAlignment":
    instance._textYAlignment = value;
    instance.Element.style.verticalAlign = value.toLowerCase();
    break;
            case "CornerRadius":
    instance._cornerRadius = {
        Scale: Number(value.Scale) || 0,
        Offset: Number(value.Offset) || 0
    };
    instance._parent && renderDecorations(instance._parent);
    break;

            case "Color":
                instance._strokeColor = value;
                instance._parent && renderDecorations(instance._parent);
                break;

            case "Thickness":
                instance._strokeThickness = Math.max(0, Number(value));
                instance._parent && renderDecorations(instance._parent);
                break;

            case "Transparency":
                instance._strokeTransparency = Math.max(0, Math.min(1, Number(value)));
                instance._parent && renderDecorations(instance._parent);
                break;

            case "FillDirection":
                instance._fillDirection = value;
                instance._parent && applyListLayout(instance._parent);
                break;

            case "Padding":
                instance._listPadding = value;
                instance._parent && applyListLayout(instance._parent);
                break;

            case "HorizontalAlignment":
                instance._horizontalAlignment = value;
                instance._parent && applyListLayout(instance._parent);
                break;

            case "VerticalAlignment":
                instance._verticalAlignment = value;
                instance._parent && applyListLayout(instance._parent);
                break;

            case "SortOrder":
                instance._sortOrder = value;
                instance._parent && applyListLayout(instance._parent);
                break;
case "PaddingTop":
    instance._paddingRadius = null;
    instance._paddingTop = value;
    instance._parent && applyUIPadding(instance._parent);
    break;

case "PaddingBottom":
    instance._paddingRadius = null;
    instance._paddingBottom = value;
    instance._parent && applyUIPadding(instance._parent);
    break;

case "PaddingLeft":
    instance._paddingRadius = null;
    instance._paddingLeft = value;
    instance._parent && applyUIPadding(instance._parent);
    break;

case "PaddingRight":
    instance._paddingRadius = null;
    instance._paddingRight = value;
    instance._parent && applyUIPadding(instance._parent);
    break;
    case "PaddingRadius":
    if (instance.ClassName === "UIPadding") {
        instance._paddingRadius = value;
        instance._paddingTop = value;
        instance._paddingBottom = value;
        instance._paddingLeft = value;
        instance._paddingRight = value;
        instance._parent && applyUIPadding(instance._parent);
    }
    break;
    }
}

export function getInstanceProperty(instance, property) {
        switch (property) {
            case "Name":
                return instance._name;

            case "CanvasSize":
    return instance._canvasSize;

case "CanvasPosition":
    if (instance.ClassName === "ScrollingFrame") {
        return {
            X: instance.Element.scrollLeft,
            Y: instance.Element.scrollTop
        };
    }
    return instance._canvasPosition;

case "AutomaticCanvasSize":
    return instance._automaticCanvasSize;

case "ScrollingEnabled":
    return instance._scrollingEnabled;

case "ScrollingDirection":
    return instance._scrollingDirection;

case "ScrollBarThickness":
    return instance._scrollBarThickness;
            case "PaddingRadius":
                return instance._paddingRadius;
            case "DisplayOrder":
                return instance._displayOrder;
            case "Text":
                return instance._text;

            case "RichText":
                return instance._richText;

            case "TextColor3":
                return instance._textColor3;

            case "TextSize":
                return instance._textSize;

            case "Font":
                return instance._font;

            case "TextXAlignment":
                return instance._textXAlignment;

            case "TextYAlignment":
                return instance._textYAlignment;

            case "Image":
                return instance._image;

            case "ImageColor3":
                return instance._imageColor3;

            case "ImageTransparency":
                return instance._imageTransparency;

            case "ScaleType":
                return instance._scaleType;

            case "ClassName":
                return instance.ClassName;

            case "AutomaticSize":
                return instance._automaticSize;

            case "Visible":
                return instance._visible;

            case "LayoutOrder":
                return instance._layoutOrder;

            case "ZIndex":
                return instance._zIndex;

            case "CornerRadius":
                return instance._cornerRadius;

            case "Color":
                return instance._strokeColor;

            case "Thickness":
                return instance._strokeThickness;

            case "Transparency":
                return instance._strokeTransparency;

            case "FillDirection":
                return instance._fillDirection;

            case "Padding":
                return instance.ClassName === "UIListLayout"
                    ? instance._listPadding
                    : instance._paddingTop;

            case "HorizontalAlignment":
                return instance._horizontalAlignment;

            case "VerticalAlignment":
                return instance._verticalAlignment;

            case "SortOrder":
                return instance._sortOrder;

            case "PaddingTop":
                return instance._paddingTop;

            case "PaddingBottom":
                return instance._paddingBottom;

            case "PaddingLeft":
                return instance._paddingLeft;

            case "PaddingRight":
                return instance._paddingRight;
        }

        return undefined;
}
