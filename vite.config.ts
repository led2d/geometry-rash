import { createReadStream, existsSync, statSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { jsxPlugin } from "dreamland/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const STEAM_SHEETS = [
	"GJ_GameSheet-hd.plist",
	"GJ_GameSheet-hd.png",
	"GJ_GameSheet02-hd.plist",
	"GJ_GameSheet02-hd.png",
	"GJ_GameSheetGlow-hd.plist",
	"GJ_GameSheetGlow-hd.png",
];

const MIME: Record<string, string> = {
	".png": "image/png",
	".plist": "application/xml",
};

function steamAssetsPlugin(steamPath: string, files: string[]): Plugin {
	const fileMap = new Map(
		files.map((file) => [`/assets/steam/${file}`, resolve(steamPath, file)]),
	);

	return {
		name: "steam-assets",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const absPath = fileMap.get(req.url ?? "");
				if (!absPath || !existsSync(absPath)) return next();

				const stat = statSync(absPath);
				const ext = absPath.slice(absPath.lastIndexOf("."));
				res.writeHead(200, {
					"Content-Type": MIME[ext] || "application/octet-stream",
					"Content-Length": stat.size,
					"Cache-Control": "no-cache",
				});
				createReadStream(absPath).pipe(res);
			});
		},
		async writeBundle(options) {
			const outDir = options.dir || "dist";
			const destDir = join(outDir, "assets", "steam");
			await mkdir(destDir, { recursive: true });
			for (const [, absPath] of fileMap) {
				if (existsSync(absPath)) {
					await copyFile(absPath, join(destDir, basename(absPath)));
				}
			}
		},
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "GD_");
	const steamPath = resolve(
		(env.GD_STEAM_RESOURCES || "").replace(/^~/, homedir()),
	);

	return {
		publicDir: "geometrydash.com/game",
		server: { port: 3000 },
		preview: { port: 3000 },
		plugins: [
			jsxPlugin(),
			steamAssetsPlugin(steamPath, STEAM_SHEETS),
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
	};
});
