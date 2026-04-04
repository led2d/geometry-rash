import pako from "pako";

const SUPPORTED_IDS = new Set([
	1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23,
	24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 36, 39, 40, 41, 50, 54, 61, 62, 65,
	67, 68, 73, 83, 103, 104, 105, 110, 140, 142, 195, 196, 221, 392, 899, 901,
	1006,
]);

const TRIGGER_IDS = new Set([
	22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 104, 105, 221, 899, 901, 1006,
]);
const PORTAL_IDS = new Set([10, 11, 12, 13]);
const DECO_GLOW_IDS = new Set([18, 19, 20, 21, 41]);
const BACKGROUND_IDS = new Set([73]);

const LEGACY_COLOR_MAP: Record<string, string> = {
	kS29: "1000",
	kS30: "1001",
	kS31: "1002",
	kS32: "1004",
	kS33: "1",
	kS34: "2",
	kS35: "3",
	kS36: "4",
	kS37: "1003",
};

const DEFAULT_HEADER_KEYS: Record<string, string> = {
	kA13: "0",
	kA15: "0",
	kA16: "0",
	kA14: "",
	kA6: "0",
	kA7: "0",
	kA25: "0",
	kA17: "0",
	kA18: "0",
	kS39: "0",
	kA2: "0",
	kA3: "0",
	kA8: "0",
	kA4: "0",
	kA9: "0",
	kA10: "0",
	kA22: "0",
	kA23: "0",
	kA24: "0",
	kA27: "0",
	kA40: "0",
	kA48: "0",
	kA41: "0",
	kA42: "0",
	kA28: "0",
	kA29: "0",
	kA31: "0",
	kA32: "0",
	kA36: "0",
	kA43: "0",
	kA44: "0",
	kA45: "0",
	kA46: "0",
	kA47: "0",
	kA33: "0",
	kA34: "0",
	kA35: "0",
	kA37: "0",
	kA38: "0",
	kA39: "0",
	kA19: "0",
	kA26: "0",
	kA20: "0",
	kA21: "0",
	kA49: "0",
	kA50: "0",
	kA51: "0",
	kA52: "0",
	kA53: "",
	kA54: "0",
	kA11: "0",
};

const DEFAULT_EXTRA_CHANNELS: Record<string, Record<string, string>> = {
	"1009": {
		"1": "0",
		"2": "102",
		"3": "255",
		"4": "-1",
		"11": "255",
		"12": "255",
		"13": "255",
		"5": "1",
		"7": "1",
		"15": "1",
		"18": "0",
		"8": "1",
	},
	"1013": {
		"1": "40",
		"2": "125",
		"3": "255",
		"4": "-1",
		"11": "255",
		"12": "255",
		"13": "255",
		"7": "1",
		"15": "1",
		"18": "0",
		"8": "1",
	},
	"1014": {
		"1": "40",
		"2": "125",
		"3": "255",
		"4": "-1",
		"11": "255",
		"12": "255",
		"13": "255",
		"7": "1",
		"15": "1",
		"18": "0",
		"8": "1",
	},
	"1005": {
		"1": "150",
		"2": "0",
		"3": "225",
		"4": "-1",
		"5": "1",
		"11": "255",
		"12": "255",
		"13": "255",
		"7": "1",
		"15": "1",
		"18": "0",
		"8": "1",
	},
	"1006": {
		"1": "0",
		"2": "200",
		"3": "255",
		"4": "-1",
		"5": "1",
		"11": "255",
		"12": "255",
		"13": "255",
		"7": "1",
		"15": "1",
		"18": "0",
		"8": "1",
	},
};

function b64urlDecode(str: string): Uint8Array {
	let s = str.replace(/-/g, "+").replace(/_/g, "/");
	while (s.length % 4) s += "=";
	const binary = atob(s);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

	return bytes;
}

const b64urlEncode = (data: Uint8Array): string =>
	btoa(String.fromCharCode(...data))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

function decodeLevelString(encoded: string): string {
	const compressed = b64urlDecode(encoded);
	const inflated = pako.inflate(compressed);

	return new TextDecoder().decode(inflated);
}

function encodeLevelString(raw: string): string {
	const compressed = pako.gzip(new TextEncoder().encode(raw));

	return b64urlEncode(compressed);
}

function parseKV(str: string, sep = ","): Record<string, string> {
	const result: Record<string, string> = {};
	const parts = str.split(sep);
	for (let i = 0; i < parts.length - 1; i += 2) {
		result[parts[i]] = parts[i + 1];
	}

	return result;
}

const serializeKV = (obj: Record<string, string>): string =>
	Object.entries(obj)
		.map(([k, v]) => `${k},${v}`)
		.join(",");

function convertLegacyColorToKS38(header: Record<string, string>): string {
	const channels: Record<string, string>[] = [];

	for (const [legacyKey, channelId] of Object.entries(LEGACY_COLOR_MAP)) {
		const raw = header[legacyKey];
		if (!raw) continue;

		const data = parseKV(raw, "_");
		const channel: Record<string, string> = {
			"1": data["1"] || "255",
			"2": data["2"] || "255",
			"3": data["3"] || "255",
		};

		const playerColor = data["4"];
		const blending = data["5"];

		if (playerColor && playerColor !== "0") {
			channel["4"] = "-1";
			channel["11"] = "255";
			channel["12"] = "255";
			channel["13"] = "255";
			channel["15"] = "1";
		} else {
			channel["15"] = "0";
		}

		if (blending && blending !== "0") {
			channel["5"] = "1";
		}

		channel["6"] = channelId;
		channel["7"] = "1";
		channel["18"] = "0";
		channel["8"] = "1";

		channels.push(channel);
	}

	for (const [channelId, defaults] of Object.entries(DEFAULT_EXTRA_CHANNELS))
		if (!channels.some((ch) => ch["6"] === channelId))
			channels.push({ ...defaults, "6": channelId });

	return `${channels
		.map((ch) =>
			Object.entries(ch)
				.map(([k, v]) => `${k}_${v}`)
				.join("_"),
		)
		.join("|")}|`;
}

function convertHeader(header: Record<string, string>): Record<string, string> {
	const isLegacy = !header.kS38 && header.kS29 !== undefined;
	const out: Record<string, string> = {};
	out.kS38 = isLegacy ? convertLegacyColorToKS38(header) : header.kS38;

	for (const [key, defaultVal] of Object.entries(DEFAULT_HEADER_KEYS)) {
		out[key] = header[key] !== undefined ? header[key] : defaultVal;
	}

	return out;
}

function assignRenderLayer(id: number): string {
	if (TRIGGER_IDS.has(id) || PORTAL_IDS.has(id) || BACKGROUND_IDS.has(id))
		return "1";
	if (DECO_GLOW_IDS.has(id)) return "3";

	return "2";
}

function convertObject(obj: Record<string, string>): Record<string, string> {
	const id = parseInt(obj["1"], 10);
	const out = { ...obj };
	if (out["4"] === "0") delete out["4"];
	if (out["5"] === "0") delete out["5"];
	if (out["6"] === "0") delete out["6"];

	if (id === 29) {
		Object.assign(out, { "23": "1000", "35": "1", "36": "1" });
	} else if (id === 30) {
		Object.assign(out, { "23": "1001", "35": "1", "36": "1" });
	} else if (id === 899) {
		out["35"] = out["35"] || "1";
		out["36"] = out["36"] || "1";
	} else if (id === 901 || id === 1006) {
		out["36"] = out["36"] || "1";
	} else if (PORTAL_IDS.has(id)) {
		out["36"] = "1";
	}

	out["155"] ??= assignRenderLayer(id);

	return out;
}

export interface ConversionResult {
	encoded: string;
	stats: { total: number; kept: number; stripped: number; score: number };
}

export function convertLevel(inputEncoded: string): ConversionResult {
	const decoded = decodeLevelString(inputEncoded.trim());
	const segments = decoded.split(";");
	const header = parseKV(segments[0]);
	const convertedHeader = convertHeader(header);
	const parts = [serializeKV(convertedHeader)];
	let kept = 0;
	let stripped = 0;
	for (let i = 1; i < segments.length; i++) {
		const s = segments[i].trim();
		if (!s) continue;

		const obj = parseKV(s);
		const id = parseInt(obj["1"], 10);
		if (!SUPPORTED_IDS.has(id)) {
			stripped++;

			continue;
		}

		parts.push(serializeKV(convertObject(obj)));
		kept++;
	}

	const total = kept + stripped;
	const score = total > 0 ? Math.round((kept / total) * 10000) / 100 : 100;

	return {
		encoded: encodeLevelString(parts.join(";")),
		stats: { total, kept, stripped, score },
	};
}
