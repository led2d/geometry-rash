import type { Component } from "dreamland/core";
import { createState } from "dreamland/core";
import { Logger } from "tslog";
import {
	type ConversionStats,
	DIFFICULTY_SPRITE,
	LEVEL_DIFFICULTY,
	LEVEL_IDS,
	LEVEL_NAMES,
} from "./consts";
import { extractSpriteUrl } from "./sprites";

const log = new Logger({ name: "GD Player" });

const state = createState({
	levelId: 1,
	stats: null as ConversionStats | null,
	spriteUrl: "",
});

async function refreshSprite(levelId: number) {
	const difficulty = LEVEL_DIFFICULTY[levelId] || "Normal";
	const spriteName = DIFFICULTY_SPRITE[difficulty] || DIFFICULTY_SPRITE.Normal;
	state.spriteUrl = await extractSpriteUrl(spriteName);
}

function formatStats(stats: ConversionStats): string {
	return `(${stats.score.toFixed(2)}% - ${stats.kept}/${stats.total} objects compatible)`;
}

window.addEventListener("message", (ev) => {
	if (ev.data?.type === "conversion-stats") {
		const { levelId, stats } = ev.data;

		log.info(`Level ${levelId} compatibility: ${stats.score}%`, stats);

		state.stats = stats;
	}
});

const TitleBar: Component = () => (
	<div id="title-bar">
		<div id="title-info">
			<span id="title-name">
				{use(state.levelId).map(
					(id: number) => LEVEL_NAMES[id] || `Level ${id}`,
				)}{" "}
				{use(state.stats).map((st: ConversionStats | null) =>
					st ? formatStats(st) : "",
				)}
			</span>
			<img
				id="title-difficulty"
				alt="Difficulty"
				attr:src={use(state.spriteUrl)}
				attr:alt={use(state.levelId).map(
					(id: number) => LEVEL_DIFFICULTY[id] || "Normal",
				)}
				attr:title={use(state.levelId).map(
					(id: number) => LEVEL_DIFFICULTY[id] || "Normal",
				)}
			/>
		</div>
	</div>
);

const Controls: Component = () => (
	<div id="controls">
		<select
			id="level-select"
			on:change={(ev: Event) => {
				const selected = parseInt((ev.target as HTMLSelectElement).value, 10);
				state.levelId = selected;
			}}
		>
			{LEVEL_IDS.map((id) => (
				<option value={String(id)}>
					{id} - {LEVEL_NAMES[id]}
				</option>
			))}
		</select>
		<button
			type="button"
			on:click={() => {
				state.stats = null;

				const iframe = document.getElementById(
					"game-frame",
				) as HTMLIFrameElement;
				iframe.src = `/?level=${state.levelId}`;

				refreshSprite(state.levelId);

				const name = LEVEL_NAMES[state.levelId] || `Level ${state.levelId}`;
				document.title = `${name} - Geometry Dash`;
			}}
		>
			Play
		</button>
		<button
			type="button"
			on:click={() => {
				const fileInput = document.getElementById(
					"upload-input",
				) as HTMLInputElement;
				fileInput.click();
			}}
		>
			Upload
		</button>
		<input
			id="upload-input"
			type="file"
			accept=".txt"
			hidden={true}
			on:change={() => {
				const fileInput = document.getElementById(
					"upload-input",
				) as HTMLInputElement;

				const file = fileInput.files?.[0];
				if (!file) return;

				const reader = new FileReader();
				reader.onload = () => {
					const data = reader.result as string;
					const blob = new Blob([data], { type: "text/plain" });
					const blobUrl = URL.createObjectURL(blob);
					const iframe = document.getElementById(
						"game-frame",
					) as HTMLIFrameElement;
					iframe.src = `/?level=custom&data=${encodeURIComponent(blobUrl)}`;
				};
				reader.readAsText(file);
			}}
		/>
	</div>
);

export const App: Component = () => {
	use(state.stats).listen((stats: ConversionStats | null) => {
		if (!stats) return;

		const name = LEVEL_NAMES[state.levelId] || `Level ${state.levelId}`;
		document.title = `${name} ${formatStats(stats)} - Geometry Dash`;
	});

	return (
		<div id="selector">
			<TitleBar />
			<iframe id="game-frame" title="Geometry Dash" />
			<Controls />
		</div>
	);
};

export function loadInitialLevel() {
	state.stats = null;

	const iframe = document.getElementById("game-frame") as HTMLIFrameElement;
	iframe.src = `/?level=${state.levelId}`;

	refreshSprite(state.levelId);

	const name = LEVEL_NAMES[state.levelId] || `Level ${state.levelId}`;
	document.title = `${name} - Geometry Dash`;
}
