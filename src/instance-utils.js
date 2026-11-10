export function applyOpacity(color, opacity) {
    opacity = Math.max(0, Math.min(1, opacity));

    if (opacity === 0) {
        return "transparent";
    }

    const Hex = typeof color === "string"
        ? color.match(/^#([0-9a-f]{6})$/i)
        : null;

    if (Hex) {
        const Value = Hex[1];

        const R = parseInt(Value.slice(0, 2), 16);
        const G = parseInt(Value.slice(2, 4), 16);
        const B = parseInt(Value.slice(4, 6), 16);

        return `rgba(${R}, ${G}, ${B}, ${opacity})`;
    }

    const RGB = typeof color === "string"
        ? color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i)
        : null;

    if (RGB) {
        const R = Number(RGB[1]);
        const G = Number(RGB[2]);
        const B = Number(RGB[3]);
        const Alpha = RGB[4] === undefined ? 1 : Number(RGB[4]);

        return `rgba(${R}, ${G}, ${B}, ${Alpha * opacity})`;
    }

    return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
}

export function getColorRGB(color) {
    if (typeof color !== "string") {
        return [255, 255, 255];
    }

    const Hex = color.match(/^#([0-9a-f]{6})$/i);

    if (Hex) {
        const Value = Hex[1];

        return [
            parseInt(Value.slice(0, 2), 16),
            parseInt(Value.slice(2, 4), 16),
            parseInt(Value.slice(4, 6), 16)
        ];
    }

    const RGB = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);

    if (RGB) {
        return [
            Number(RGB[1]),
            Number(RGB[2]),
            Number(RGB[3])
        ];
    }

    return [255, 255, 255];
}

export function getUDimValue(value, size) {
    if (!value) {
        return 0;
    }

    return size * (value.Scale || 0) + (value.Offset || 0);
}
