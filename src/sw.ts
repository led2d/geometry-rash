declare const self: ServiceWorkerGlobalScope;

import * as Comlink from "comlink";
import { Logger } from "tslog";
import { registerRoute } from "workbox-routing";
import { convertLevel } from "./converter";
import {
	COLLISION_HOOK,
	CREATION_HOOK,
	DISPATCH_HOOK,
	FLIP_HOOK,
	generateCollisionReplacement,
	generateCreationReplacement,
	generateDispatchReplacement,
	generateFlipReplacement,
	generateOsTableReplacement,
	generatePortalSubPatch,
	generateSpawnReplacement,
	OS_TABLE_HOOK,
	type PadEffectConfig,
	PORTAL_SUB_HOOK,
	SPAWN_HOOK,
	translateEffects,
} from "./objects";
import type { PlistApi } from "./plist";

const log = new Logger({ name: "SW", type: "pretty" });

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (ev) => ev.waitUntil(self.clients.claim()));

const DOMAIN_CHECK =
	"const Ts=window[_0x6e411f(0xfa0)][_0x6e411f(0x1876)],bs=[0x67,0x65,0x6f,0x6d,0x65,0x74,0x72,0x79,0x64,0x61,0x73,0x68,0x2e,0x63,0x6f,0x6d]['map'](_0x1c1bb4=>String[_0x6e411f(0x370)](_0x1c1bb4))[_0x6e411f(0xb6b)]('');if(!(Ts===bs||Ts===_0x6e411f(0x7ec)+bs||Ts[_0x6e411f(0x696)]('.'+bs)||_0x6e411f(0x10b9)===Ts))throw document['body']['innerHTML']='',new Error('');";

const MUSIC_MAP: Record<number, string> = {
	1: "StereoMadness",
	2: "BackOnTrack",
	3: "Polargeist",
	4: "DryOut",
	5: "BaseAfterBase",
	6: "CantLetGo",
	7: "Jumper",
	8: "TimeMachine",
	9: "Cycles",
	10: "xStep",
	11: "Clutterfunk",
	12: "TheoryOfEverything",
	13: "Electroman",
	14: "Clubstep",
	15: "Electrodynamix",
	16: "HexagonForce",
	17: "BlastProcessing",
	18: "TheoryOfEverything2",
	19: "GeometricalDominator",
	20: "Deadlocked",
	21: "Fingerdash",
	22: "Dash",
	3001: "Clubstep",
	5001: "PowerTrip",
	5002: "StayInsideMe",
	5003: "StereoMadness",
	5004: "StereoMadness",
};

async function getLevelId(clientId: string): Promise<number> {
	const client = await self.clients.get(clientId);
	if (!client) return 1;

	const url = new URL(client.url);

	return parseInt(url.searchParams.get("level") || "1", 10) || 1;
}

const comlinkApiCache = new Map<string, Comlink.Remote<PlistApi>>();

async function getComlinkApi(
	clientId: string,
): Promise<Comlink.Remote<PlistApi>> {
	const cached = comlinkApiCache.get(clientId);
	if (cached) return cached;

	const client = await self.clients.get(clientId);
	if (!client) throw new Error(`No client found for ${clientId}`);

	const channel = new MessageChannel();
	client.postMessage({ type: "comlink-init" }, [channel.port2]);

	const api = Comlink.wrap<PlistApi>(channel.port1);
	comlinkApiCache.set(clientId, api);
	return api;
}

let effectsCache: PadEffectConfig | null = null;

async function loadEffects(clientId: string): Promise<PadEffectConfig> {
	if (effectsCache) return effectsCache;

	const api = await getComlinkApi(clientId);

	const [bumpResp, ringResp] = await Promise.all([
		fetch("/assets/steam/bumpEffect.plist"),
		fetch("/assets/steam/ringEffect.plist"),
	]);

	const [bumpXml, ringXml] = await Promise.all([
		bumpResp.text(),
		ringResp.text(),
	]);

	const [bumpData, ringData] = await Promise.all([
		api.parseParticlePlist(bumpXml),
		api.parseParticlePlist(ringXml),
	]);

	effectsCache = translateEffects(bumpData, ringData);
	log.info("Loaded particle effects via Comlink IPC", effectsCache);
	return effectsCache;
}

registerRoute(
	({ url }) =>
		url.pathname === "/assets/GJ_WebSheet.json" ||
		url.pathname === "/assets/GJ_WebSheet.png",
	async ({ url }) => {
		const cache = await caches.open("gd-expanded-atlas");
		const cached = await cache.match(url.pathname);
		if (cached) {
			log.info(`Serving expanded atlas: ${url.pathname}`);

			return cached;
		}

		return fetch(url.href);
	},
);

registerRoute(
	({ url }) => url.pathname === "/assets/index-game.js",
	async ({ event }) => {
		const fe = event as FetchEvent;

		const [resp, effects] = await Promise.all([
			fetch("/assets/index-game.js"),
			loadEffects(fe.clientId),
		]);

		let js = await resp.text();

		js = js.replace(DOMAIN_CHECK, "");
		js = js.replace(OS_TABLE_HOOK, generateOsTableReplacement());
		js = js.replace(PORTAL_SUB_HOOK, generatePortalSubPatch());
		js = js.replace(SPAWN_HOOK, generateSpawnReplacement(effects));
		js = js.replace(CREATION_HOOK, generateCreationReplacement());
		js = js.replace(DISPATCH_HOOK, generateDispatchReplacement(effects));
		js = js.replace(COLLISION_HOOK, generateCollisionReplacement());
		js = js.replace(FLIP_HOOK, generateFlipReplacement());

		log.info(
			"Applied patches: DRM, os table, portal sub, spawn, creation, dispatch, collision, flip",
		);

		return new Response(js, {
			headers: { "Content-Type": "application/javascript; charset=utf-8" },
		});
	},
);

registerRoute(
	({ url }) => url.pathname === "/assets/1.txt",
	async ({ event }) => {
		const fe = event as FetchEvent;

		const levelId = await getLevelId(fe.clientId);
		const resp = await fetch(`/assets/levels/${levelId}.txt`);
		if (!resp.ok) return fetch("/assets/1.txt");

		const raw = await resp.text();
		const { encoded, stats } = convertLevel(raw);

		log.info(`Level ${levelId} converted`, stats);

		const client = await self.clients.get(fe.clientId);
		client?.postMessage({ type: "conversion-stats", levelId, stats });

		return new Response(encoded, {
			headers: { "Content-Type": "text/plain" },
		});
	},
);

registerRoute(
	({ url }) => url.pathname === "/assets/StereoMadness.mp3",
	async ({ event }) => {
		const fe = event as FetchEvent;

		const levelId = await getLevelId(fe.clientId);
		const track = MUSIC_MAP[levelId] || "StereoMadness";
		return fetch(`/assets/${track}.mp3`);
	},
);
