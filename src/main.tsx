import { registerSW } from "virtual:pwa-register";
import * as Comlink from "comlink";
import { App, loadInitialLevel } from "./App";
import { createExpandedAtlas } from "./atlas";
import type { PlistApi } from "./plist";
import { parseParticlePlist } from "./plist";

const plistApi: PlistApi = { parseParticlePlist };

function waitForSW(): Promise<void> {
	return new Promise((resolve) => {
		registerSW({ immediate: true });

		if (navigator.serviceWorker.controller) return resolve();

		navigator.serviceWorker.addEventListener(
			"controllerchange",
			() => resolve(),
			{ once: true },
		);
	});
}

function setupGameFrame() {
	navigator.serviceWorker?.addEventListener("message", (ev) => {
		if (ev.data?.type === "comlink-init" && ev.ports[0]) {
			Comlink.expose(plistApi, ev.ports[0]);
			return;
		}

		if (ev.data?.type === "conversion-stats") {
			window.parent.postMessage(
				{
					type: "conversion-stats",
					levelId: ev.data.levelId,
					stats: ev.data.stats,
				},
				"*",
			);
		}
	});

	waitForSW()
		.then(() => createExpandedAtlas())
		.then(() => {
			if (document.querySelector('script[src="./assets/index-game.js"]'))
				return;

			new ResizeObserver(() => {
				window.dispatchEvent(new Event("resize"));
			}).observe(document.documentElement);

			const script = document.createElement("script");
			script.type = "module";
			script.crossOrigin = "";
			script.src = "./assets/index-game.js";

			document.head.appendChild(script);
		});
}

function setupSelector() {
	document.body.appendChild(<App />);
	loadInitialLevel();
}

const params = new URLSearchParams(location.search);

if (params.has("level")) {
	setupGameFrame();
} else {
	waitForSW().then(setupSelector);
}
