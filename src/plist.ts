export interface SpriteFrame {
	name: string;
	x: number;
	y: number;
	w: number;
	h: number;
	rotated: boolean;
	offsetX: number;
	offsetY: number;
	sourceW: number;
	sourceH: number;
}

function parsePoint(s: string): [number, number] {
	const m = s.match(/{(-?[\d.]+),\s*(-?[\d.]+)}/);

	return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0];
}

function parseRect(s: string): [number, number, number, number] {
	const m = s.match(
		/{{(-?[\d.]+),\s*(-?[\d.]+)},\s*{(-?[\d.]+),\s*(-?[\d.]+)}}/,
	);

	return m
		? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])]
		: [0, 0, 0, 0];
}

function getChildText(dict: Element, key: string): string | null {
	const keys = dict.querySelectorAll(":scope > key");
	for (const k of keys)
		if (k.textContent === key) {
			const next = k.nextElementSibling;

			return next?.textContent ?? null;
		}
	return null;
}

function getChildBool(dict: Element, key: string): boolean {
	const keys = dict.querySelectorAll(":scope > key");
	for (const k of keys)
		if (k.textContent === key) return k.nextElementSibling?.tagName === "true";

	return false;
}

function getChildDict(dict: Element, key: string): Element | null {
	const keys = dict.querySelectorAll(":scope > key");
	for (const k of keys)
		if (k.textContent === key) {
			const next = k.nextElementSibling;

			return next?.tagName === "dict" ? next : null;
		}

	return null;
}

export function parsePlist(xml: string): Map<string, SpriteFrame> {
	const parser = new DOMParser();

	const doc = parser.parseFromString(xml, "text/xml");
	const root = doc.querySelector("plist > dict");
	if (!root) return new Map();
	const framesDict = getChildDict(root, "frames");
	if (!framesDict) return new Map();

	const result = new Map<string, SpriteFrame>();
	const keys = framesDict.querySelectorAll(":scope > key");

	for (const k of keys) {
		const name = k.textContent;
		if (!name) continue;
		const dict = k.nextElementSibling as Element;
		if (dict?.tagName !== "dict") continue;

		const [tx, ty, tw, th] = parseRect(
			getChildText(dict, "textureRect") || "{{0,0},{0,0}}",
		);
		const [ox, oy] = parsePoint(getChildText(dict, "spriteOffset") || "{0,0}");
		const [sw, sh] = parsePoint(
			getChildText(dict, "spriteSourceSize") || "{0,0}",
		);
		const rotated = getChildBool(dict, "textureRotated");

		result.set(name, {
			name,
			x: tx,
			y: ty,
			w: rotated ? th : tw,
			h: rotated ? tw : th,
			rotated,
			offsetX: ox,
			offsetY: oy,
			sourceW: sw,
			sourceH: sh,
		});
	}

	return result;
}
