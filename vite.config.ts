import { jsxPlugin } from "dreamland/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	publicDir: "geometrydash.com/game",
	server: { port: 3000 },
	preview: { port: 3000 },
	plugins: [
		jsxPlugin(),
		VitePWA({
			strategies: "injectManifest",
			srcDir: "src",
			filename: "sw.ts",
			registerType: "autoUpdate",
			injectManifest: {
				injectionPoint: undefined,
			},
			devOptions: {
				enabled: true,
				type: "module",
				suppressWarnings: true,
			},
		}),
	],
});
