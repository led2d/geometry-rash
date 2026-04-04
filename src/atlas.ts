import { Logger } from "tslog";
import { parsePlist, type SpriteFrame } from "./plist";

const log = new Logger({ name: "Atlas" });

const ATLAS_CACHE = "gd-expanded-atlas";
const PADDING = 2;

// Only the sprites from 1-7 to test are included to test right now
const MERGED_SPRITES: Record<string, string[]> = {
	"GJ_GameSheet-hd": [
		"bump_01_001.png",
		"bump_03_001.png",
		"gravbump_01_001.png",
		"ring_01_001.png",
		"square_b_01_001.png",
		"square_b_04_001.png",
		"square_b_06_001.png",
		"blockOutline_02_001.png",
		"d_ball_05_001.png",
		"d_chain_02_001.png",
		"square_c_05_001.png",
	],
	"GJ_GameSheet02-hd": [
		"portal_01_front_001.png",
		"portal_01_back_001.png",
		"portal_02_front_001.png",
		"portal_02_back_001.png",
		"secretCoin_01_001.png",
	],
};

interface PhaserFrame {
	filename: string;
	rotated: boolean;
	trimmed: boolean;
	sourceSize: { w: number; h: number };
	spriteSourceSize: { x: number; y: number; w: number; h: number };
	frame: { x: number; y: number; w: number; h: number };
}

interface PhaserTexture {
	image: string;
	format: string;
	size: { w: number; h: number };
	scale: number;
	frames: PhaserFrame[];
}

interface PhaserAtlas {
	textures: PhaserTexture[];
	meta: Record<string, string>;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

async function loadSteamSheet(
	name: string,
): Promise<{ frames: Map<string, SpriteFrame>; img: HTMLImageElement }> {
	const [plistXml, img] = await Promise.all([
		fetch(`/assets/steam/${name}.plist`).then((resp) => resp.text()),
		loadImage(`/assets/steam/${name}.png`),
	]);

	return { frames: parsePlist(plistXml), img };
}

function extractSpriteToCanvas(
	sheetImg: HTMLImageElement,
	frame: SpriteFrame,
): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = frame.sourceW;
	canvas.height = frame.sourceH;

	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

	if (frame.rotated) {
		ctx.translate(frame.sourceW / 2, frame.sourceH / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.drawImage(
			sheetImg,
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
			sheetImg,
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

	return canvas;
}

export async function createExpandedAtlas(): Promise<void> {
	const cache = await caches.open(ATLAS_CACHE);
	const existing = await cache.match("/assets/GJ_WebSheet.json");
	if (existing) {
		log.info("Expanded atlas already cached");

		return;
	}

	log.info("Building expanded atlas...");

	const sheetNames = Object.keys(MERGED_SPRITES);

	const [originalAtlas, originalImg, ...steamSheetResults] = await Promise.all([
		fetch("/assets/GJ_WebSheet.json").then((resp) =>
			resp.json(),
		) as Promise<PhaserAtlas>,
		loadImage("/assets/GJ_WebSheet.png"),
		...sheetNames.map((name) => loadSteamSheet(name)),
	]);

	const steamSheets = new Map(
		sheetNames.map((name, idx) => [name, steamSheetResults[idx]]),
	);

	const tex = originalAtlas.textures[0];
	const originalW = tex.size.w;
	const originalH = tex.size.h;

	const spritesToAdd: {
		name: string;
		frame: SpriteFrame;
		sheetName: string;
	}[] = [];

	for (const [sheetName, spriteNames] of Object.entries(MERGED_SPRITES)) {
		const sheet = steamSheets.get(sheetName);
		if (!sheet) continue;

		for (const spriteName of spriteNames) {
			const frame = sheet.frames.get(spriteName);
			if (!frame) {
				log.warn(`Sprite ${spriteName} not found in ${sheetName}`);

				continue;
			}

			spritesToAdd.push({ name: spriteName, frame, sheetName });
		}
	}

	spritesToAdd.sort((left, right) => right.frame.sourceH - left.frame.sourceH);

	let cursorX = 0;
	let cursorY = originalH + PADDING;
	let rowHeight = 0;
	const placements: {
		sprite: (typeof spritesToAdd)[0];
		destX: number;
		destY: number;
	}[] = [];

	for (const sprite of spritesToAdd) {
		const spriteW = sprite.frame.sourceW;
		const spriteH = sprite.frame.sourceH;

		if (cursorX + spriteW + PADDING > originalW) {
			cursorY += rowHeight + PADDING;
			cursorX = 0;
			rowHeight = 0;
		}

		placements.push({ sprite, destX: cursorX, destY: cursorY });
		cursorX += spriteW + PADDING;
		rowHeight = Math.max(rowHeight, spriteH);
	}

	const expandedH = cursorY + rowHeight + PADDING;

	const canvas = document.createElement("canvas");
	canvas.width = originalW;
	canvas.height = expandedH;

	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

	ctx.drawImage(originalImg, 0, 0);

	const newFrames: PhaserFrame[] = [];

	for (const { sprite, destX, destY } of placements) {
		const sheet = steamSheets.get(sprite.sheetName) as {
			frames: Map<string, SpriteFrame>;
			img: HTMLImageElement;
		};
		const extracted = extractSpriteToCanvas(sheet.img, sprite.frame);

		ctx.drawImage(extracted, destX, destY);

		newFrames.push({
			filename: sprite.name,
			rotated: false,
			trimmed: false,
			sourceSize: {
				w: sprite.frame.sourceW,
				h: sprite.frame.sourceH,
			},
			spriteSourceSize: {
				x: 0,
				y: 0,
				w: sprite.frame.sourceW,
				h: sprite.frame.sourceH,
			},
			frame: {
				x: destX,
				y: destY,
				w: sprite.frame.sourceW,
				h: sprite.frame.sourceH,
			},
		});
	}

	const expandedAtlas: PhaserAtlas = {
		...originalAtlas,
		textures: [
			{
				...tex,
				size: { w: originalW, h: expandedH },
				frames: [...tex.frames, ...newFrames],
			},
		],
	};

	const expandedJson = JSON.stringify(expandedAtlas);

	const pngBlob = await new Promise<Blob>((resolve) => {
		canvas.toBlob((blob) => resolve(blob as Blob), "image/png");
	});

	await Promise.all([
		cache.put(
			new Request("/assets/GJ_WebSheet.json"),
			new Response(expandedJson, {
				headers: { "Content-Type": "application/json" },
			}),
		),
		cache.put(
			new Request("/assets/GJ_WebSheet.png"),
			new Response(pngBlob, {
				headers: { "Content-Type": "image/png" },
			}),
		),
	]);

	log.info(
		`Expanded atlas: ${newFrames.length} sprites added, ${originalW}x${expandedH}px`,
	);
}
