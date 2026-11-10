export function renderText(instance) {
    if (!instance.Element) return;
    instance.Element.replaceChildren();

    if (!instance._richText || typeof DOMParser === 'undefined') {
        instance.Element.textContent = instance._text;
        return;
    }

    const Parsed = new DOMParser().parseFromString(instance._text, 'text/html');
    const Allowed = new Set(['B', 'I', 'U', 'S', 'STRONG', 'EM', 'BR', 'FONT']);

    const appendNodes = (source, target) => {
        for (const Node of source.childNodes) {
            if (Node.nodeType === Node.TEXT_NODE) {
                target.appendChild(document.createTextNode(Node.nodeValue || ''));
                continue;
            }
            if (Node.nodeType !== Node.ELEMENT_NODE) continue;
            if (!Allowed.has(Node.tagName)) {
                appendNodes(Node, target);
                continue;
            }

            const Safe = document.createElement(Node.tagName.toLowerCase());
            if (Node.tagName === 'FONT') {
                const Color = Node.getAttribute('color');
                if (Color) Safe.style.color = Color;
                const Face = Node.getAttribute('face');
                if (Face && /^[\w ,'-]+$/.test(Face)) Safe.style.fontFamily = Face;
                const Size = Number(Node.getAttribute('size'));
                if (Number.isFinite(Size) && Size > 0) Safe.style.fontSize = `${Math.min(Size, 200)}px`;
            }
            appendNodes(Node, Safe);
            target.appendChild(Safe);
        }
    };

    appendNodes(Parsed.body, instance.Element);
}
