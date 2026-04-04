import { Logger } from "tslog";
import { parsePlist, type SpriteFrame } from "./plist";

const log = new Logger({ name: "Sprites" });

let spriteFrames: Map<string, SpriteFrame> | null = null;
let sheetImage: HTMLImageElement | null = null;
const cache = new Map<string, string>();

async function loadSheet(): Promise<{
	frames: Map<string, SpriteFrame>;
	img: HTMLImageElement;
}> {
	if (spriteFrames && sheetImage)
		return { frames: spriteFrames, img: sheetImage };

	const plistRes = await fetch("/assets/GJ_GameSheet03-hd.plist");
	const plistXml = await plistRes.text();

	spriteFrames = parsePlist(plistXml);
	log.info(`Parsed spritesheet: ${spriteFrames.size} frames`);

	sheetImage = await new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = "/assets/GJ_GameSheet03-hd.png";
	});

	return { frames: spriteFrames, img: sheetImage };
}

export async function extractSpriteUrl(spriteName: string): Promise<string> {
	const cached = cache.get(spriteName);
	if (cached) return cached;

	const { frames, img } = await loadSheet();
	const frame = frames.get(spriteName);
	if (!frame) {
		log.warn(`Sprite not found: ${spriteName}`);
		return "";
	}

	const canvas = document.createElement("canvas");
	canvas.width = frame.sourceW;
	canvas.height = frame.sourceH;

	const ctx = canvas.getContext("2d");
	if (!ctx) return "";

	if (frame.rotated) {
		ctx.translate(frame.sourceW / 2, frame.sourceH / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.drawImage(
			img,
			frame.x,
			frame.y,
			frame.h,
			frame.w,
			-frame.sourceH / 2 + frame.offsetY,
			-frame.sourceW / 2 - frame.offsetX,
			frame.h,
			frame.w,
		);
	} else {
		const dx = (frame.sourceW - frame.w) / 2 + frame.offsetX;
		const dy = (frame.sourceH - frame.h) / 2 - frame.offsetY;
		ctx.drawImage(
			img,
			frame.x,
			frame.y,
			frame.w,
			frame.h,
			dx,
			dy,
			frame.w,
			frame.h,
		);
	}

	const url = canvas.toDataURL("image/png");
	cache.set(spriteName, url);

	return url;
}
