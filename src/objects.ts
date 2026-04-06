export interface PadEffectConfig {
	burst: {
		lifespanMin: number;
		lifespanMax: number;
		speedMin: number;
		speedMax: number;
		scaleStart: number;
		scaleEnd: number;
		alphaStart: number;
		alphaEnd: number;
		explodeCount: number;
		destroyDelay: number;
	};
	idle: {
		lifespanMin: number;
		lifespanMax: number;
		speedMin: number;
		speedMax: number;
		angleMin: number;
		angleMax: number;
		scaleStart: number;
		scaleEnd: number;
		alphaStart: number;
		alphaEnd: number;
		frequency: number;
		quantity: number;
		emitZoneHalfW: number;
		emitZoneHalfH: number;
	};
	shockwave: {
		radius: number;
		expandScale: number;
		duration: number;
		lineWidth: number;
	};
	ringIdle: {
		lifespanMin: number;
		lifespanMax: number;
		speedMin: number;
		speedMax: number;
		scaleStart: number;
		scaleEnd: number;
		alphaStart: number;
		alphaEnd: number;
		gravityY: number;
		frequency: number;
		quantity: number;
		emitRadius: number;
	};
}

const SQUARE_TEXTURE_PX = 16;
const CONTENT_SCALE = 2;

export function translateEffects(
	bump: Record<string, number | string>,
	ring: Record<string, number | string>,
): PadEffectConfig {
	const lifeMs = (bump.particleLifespan as number) * 1000;
	const lifeVarMs = (bump.particleLifespanVariance as number) * 1000;
	const speed = bump.speed as number;
	const speedVar = bump.speedVariance as number;
	const angle = bump.angle as number;
	const angleVar = bump.angleVariance as number;
	const startSize = bump.startParticleSize as number;
	const endSize = bump.finishParticleSize as number;
	const startAlpha = bump.startColorAlpha as number;
	const endAlpha = bump.finishColorAlpha as number;
	const maxPart = bump.maxParticles as number;
	const srcVarX = bump.sourcePositionVariancex as number;
	const srcVarY = bump.sourcePositionVariancey as number;

	const ringMaxR = ring.maxRadius as number;
	const ringLifeMs = (ring.particleLifespan as number) * 1000;
	const ringLifeVarMs = (ring.particleLifespanVariance as number) * 1000;
	const ringStartSize = ring.startParticleSize as number;
	const ringEndSize = ring.finishParticleSize as number;
	const ringMaxPart = ring.maxParticles as number;
	const ringStartAlpha = (ring.startColorAlpha as number) ?? 0;
	const ringEndAlpha = (ring.finishColorAlpha as number) ?? 0;
	const ringStartAlphaVar = (ring.startColorVarianceAlpha as number) || 0;
	const ringIsRadial = (ring.emitterType as number) === 1;

	const lifespanMin = Math.round(lifeMs - lifeVarMs);
	const lifespanMax = Math.round(lifeMs + lifeVarMs);
	const scaleStart = +((startSize * CONTENT_SCALE) / SQUARE_TEXTURE_PX).toFixed(
		4,
	);
	const scaleEnd = +((endSize * CONTENT_SCALE) / SQUARE_TEXTURE_PX).toFixed(4);

	return {
		burst: {
			lifespanMin,
			lifespanMax,
			speedMin: speed - speedVar,
			speedMax: speed + speedVar,
			scaleStart,
			scaleEnd,
			alphaStart: startAlpha,
			alphaEnd: endAlpha,
			explodeCount: maxPart,
			destroyDelay: lifespanMax + 200,
		},
		idle: {
			lifespanMin,
			lifespanMax,
			speedMin: speed - speedVar,
			speedMax: speed + speedVar,
			angleMin: -(angle + angleVar),
			angleMax: -(angle - angleVar),
			scaleStart,
			scaleEnd,
			alphaStart: startAlpha,
			alphaEnd: endAlpha,
			frequency: Math.round(lifeMs / maxPart),
			quantity: 1,
			emitZoneHalfW: srcVarX * CONTENT_SCALE,
			emitZoneHalfH: srcVarY * CONTENT_SCALE,
		},
		shockwave: {
			radius: Math.round(ringMaxR / 2),
			expandScale: 4,
			duration: Math.round(ringLifeMs),
			lineWidth: 2,
		},
		ringIdle: {
			lifespanMin: Math.round(ringLifeMs - ringLifeVarMs),
			lifespanMax: Math.round(ringLifeMs + ringLifeVarMs),
			speedMin: ringIsRadial ? 5 : 55,
			speedMax: ringIsRadial ? 15 : 95,
			scaleStart: +(
				(ringStartSize * CONTENT_SCALE) /
				SQUARE_TEXTURE_PX
			).toFixed(4),
			scaleEnd: +((ringEndSize * CONTENT_SCALE) / SQUARE_TEXTURE_PX).toFixed(4),
			alphaStart: +Math.max(ringStartAlpha, ringStartAlphaVar * 0.5).toFixed(4),
			alphaEnd: +Math.min(ringEndAlpha, 1).toFixed(4),
			gravityY: ringIsRadial ? 0 : 300,
			frequency: Math.round(ringLifeMs / ringMaxPart),
			quantity: 1,
			emitRadius: Math.round(ringMaxR * CONTENT_SCALE),
		},
	};
}

interface ObjectDef {
	id: number;
	frame: string | null;
	type: string;
	gridW: number;
	gridH: number;
	sheet?: string;
	spriteW?: number;
	spriteH?: number;
	children?: {
		frame: string;
		x: number;
		y: number;
		sheet?: string;
		blend?: string;
		tint?: number;
		z?: number;
		audioScale?: boolean;
	}[];
	sub?: string;
	portalParticle?: boolean;
	portalParticleColor?: number;
	audioScale?: boolean;
	padParticleColor?: number;
	inOriginalOs: boolean;
	collision?: {
		type: string;
		width: number;
		height: number;
	};
	padVelocity?: number;
	padFlipGravity?: boolean;
	ringVelocity?: number;
	ringParticleColor?: number;
	portalDispatch?: string;
}

const OBJECTS: ObjectDef[] = [
	{
		id: 32,
		frame: null,
		type: "ss",
		gridW: 0,
		gridH: 0,
		inOriginalOs: false,
	},
	{
		id: 33,
		frame: null,
		type: "ss",
		gridW: 0,
		gridH: 0,
		inOriginalOs: false,
	},
	{
		id: 73,
		frame: "square_c_05_001.png",
		type: "Ji",
		gridW: 1,
		gridH: 1,
		sheet: "GJ_GameSheet-hd",
		inOriginalOs: false,
	},
	{
		id: 110,
		frame: "d_chain_02_001.png",
		type: "$i",
		gridW: 0,
		gridH: 0,
		sheet: "GJ_GameSheet-hd",
		inOriginalOs: false,
	},
	{
		id: 50,
		frame: "d_ball_01_001.png",
		type: "$i",
		gridW: 0,
		gridH: 0,
		audioScale: true,
		inOriginalOs: true,
	},
	{
		id: 54,
		frame: "d_ball_05_001.png",
		type: "$i",
		gridW: 0,
		gridH: 0,
		sheet: "GJ_GameSheet-hd",
		audioScale: true,
		inOriginalOs: true,
	},
	{
		id: 142,
		frame: "secretCoin_01_001.png",
		type: "$i",
		gridW: 0,
		gridH: 0,
		sheet: "GJ_GameSheet02-hd",
		inOriginalOs: true,
	},
	{
		id: 62,
		frame: "square_b_01_001.png",
		type: "Ji",
		gridW: 1,
		gridH: 1,
		sheet: "GJ_GameSheet-hd",
		children: [{ frame: "blockOutline_02_001.png", x: 0, y: 7.25 }],
		inOriginalOs: true,
	},
	{
		id: 65,
		frame: "square_b_04_001.png",
		type: "Ji",
		gridW: 1,
		gridH: 1,
		sheet: "GJ_GameSheet-hd",
		children: [{ frame: "blockOutline_02_001.png", x: 0, y: 7.25 }],
		inOriginalOs: true,
	},
	{
		id: 68,
		frame: "square_b_06_001.png",
		type: "Ji",
		gridW: 1,
		gridH: 1,
		sheet: "GJ_GameSheet-hd",
		children: [{ frame: "blockOutline_02_001.png", x: 0, y: 7.25 }],
		inOriginalOs: true,
	},
	{
		id: 35,
		frame: "bump_01_001.png",
		type: "es",
		gridW: 1,
		gridH: 1,
		sheet: "GJ_GameSheet-hd",
		padParticleColor: 0xffff00,
		inOriginalOs: true,
		collision: {
			type: "ypad",
			width: 50,
			height: 8,
		},
		padVelocity: 32.0,
	},
	{
		id: 140,
		frame: "bump_03_001.png",
		type: "es",
		gridW: 1,
		gridH: 1,
		sheet: "GJ_GameSheet-hd",
		padParticleColor: 0xff00ff,
		inOriginalOs: true,
		collision: {
			type: "ppad",
			width: 50,
			height: 10,
		},
		padVelocity: 20.8,
	},
	{
		id: 67,
		frame: "gravbump_01_001.png",
		type: "es",
		gridW: 1,
		gridH: 1,
		sheet: "GJ_GameSheet-hd",
		padParticleColor: 0x00ffff,
		inOriginalOs: true,
		collision: {
			type: "gpad",
			width: 50,
			height: 12,
		},
		padVelocity: 25.6,
		padFlipGravity: true,
	},
	{
		id: 36,
		frame: "ring_01_001.png",
		type: "is",
		gridW: 1,
		gridH: 1,
		sheet: "GJ_GameSheet-hd",
		audioScale: true,
		inOriginalOs: true,
		collision: {
			type: "yring",
			width: 72,
			height: 72,
		},
		ringVelocity: 22.360064,
		ringParticleColor: 0xffff00,
	},
	{
		id: 10,
		frame: "portal_01_front_001.png",
		type: "ts",
		gridW: 1,
		gridH: 3,
		sub: "gravity_normal",
		sheet: "GJ_GameSheet02-hd",
		portalParticle: true,
		portalParticleColor: 0x00ffff,
		inOriginalOs: true,
		collision: {
			type: "gnorm",
			width: 50,
			height: 150,
		},
		portalDispatch: [
			"if(!_0x1b13b8.activated){",
			"_0x1b13b8.activated=true;",
			"this['p'][_0x5f48d1(0xa22)]=!0x1;",
			"this['p']['yVelocity']/=2;",
			"try{this[_0x5f48d1(0xc7a)](_0x1b13b8);}catch(_ef){}",
			"}",
		].join(""),
	},
	{
		id: 11,
		frame: "portal_02_front_001.png",
		type: "ts",
		gridW: 1,
		gridH: 3,
		sub: "gravity_flip",
		sheet: "GJ_GameSheet02-hd",
		portalParticle: true,
		portalParticleColor: 0xffff00,
		inOriginalOs: true,
		collision: {
			type: "gflip",
			width: 50,
			height: 150,
		},
		portalDispatch: [
			"if(!_0x1b13b8.activated){",
			"_0x1b13b8.activated=true;",
			"this['p'][_0x5f48d1(0xa22)]=!0x0;",
			"this['p']['yVelocity']/=2;",
			"try{this[_0x5f48d1(0xc7a)](_0x1b13b8);}catch(_ef){}",
			"}",
		].join(""),
	},
];

function padDispatch(
	velocity: number,
	color: number,
	flipGravity: boolean,
	effects: PadEffectConfig,
): string {
	const { burst, shockwave } = effects;
	const lines = ["if(!_0x1b13b8.activated){", "_0x1b13b8.activated=true;"];
	if (flipGravity) {
		lines.push("this['p'][_0x5f48d1(0xa22)]=!this['p'][_0x5f48d1(0xa22)];");
	}
	lines.push(
		`this['p']['yVelocity']=${velocity}*this[_0x5f48d1(0x4bd)]();`,
		"this['p'][_0x5f48d1(0x9ab)]=false;",
		"var _scene=this[_0x5f48d1(0x9d4)];",
		"if(_0x1b13b8._eeSprite){",
		"var _ps=_0x1b13b8._eeSprite;",
		"_ps.setScale(1.4,0.6);",
		"_scene[_0x5f48d1(0x16c1)][_0x5f48d1(0x42f)]({'targets':_ps,'scaleX':1,'scaleY':1,'duration':400,'ease':'Elastic.Out','easeParams':[1,0.3]});",
		"}",
		`var _pe=_scene[_0x5f48d1(0x42f)][_0x5f48d1(0x11d7)](_0x1b13b8.x,_0x1b13b8.y,_0x5f48d1(0xf44),{`,
		"'frame':_0x5f48d1(0x8a2),",
		`'lifespan':{'min':${burst.lifespanMin},'max':${burst.lifespanMax}},`,
		`'speed':{'min':${burst.speedMin},'max':${burst.speedMax}},`,
		`'scale':{'start':${burst.scaleStart},'end':${burst.scaleEnd}},`,
		`'alpha':{'start':${burst.alphaStart},'end':${burst.alphaEnd}},`,
		`'tint':${color},`,
		"'blendMode':Phaser[_0x5f48d1(0x496)][_0x5f48d1(0x98a)],",
		"'emitting':false",
		"});",
		`_pe.explode(${burst.explodeCount});`,
		`_scene.time.delayedCall(${burst.destroyDelay},function(){_pe.destroy();});`,
		`var _cw=_scene[_0x5f48d1(0x42f)].graphics({x:_0x1b13b8.x,y:_0x1b13b8.y});`,
		`_cw.lineStyle(${shockwave.lineWidth},${color},1);`,
		`_cw.strokeCircle(0,0,${shockwave.radius});`,
		`_scene[_0x5f48d1(0x16c1)][_0x5f48d1(0x42f)]({'targets':_cw,'scaleX':${shockwave.expandScale},'scaleY':${shockwave.expandScale},'alpha':0,'duration':${shockwave.duration},'ease':'Sine.Out','onComplete':function(){_cw.destroy();}});`,
		"}",
	);
	return lines.join("");
}

function ringDispatch(
	velocity: number,
	color: number,
	effects: PadEffectConfig,
): string {
	const { burst, shockwave } = effects;
	return [
		"if(!_0x1b13b8.activated&&this['p']['upKeyDown']){",
		"_0x1b13b8.activated=true;",
		`this['p']['yVelocity']=${velocity}*this[_0x5f48d1(0x4bd)]();`,
		"this['p'][_0x5f48d1(0x9ab)]=false;",
		"try{",
		"var _scene=this[_0x5f48d1(0x9d4)];",
		"if(_0x1b13b8._eeSprite){",
		"var _rs=_0x1b13b8._eeSprite;",
		"_rs.setScale(1.3);",
		"_scene[_0x5f48d1(0x16c1)][_0x5f48d1(0x42f)]({'targets':_rs,'scaleX':1,'scaleY':1,'duration':300,'ease':'Sine.Out'});",
		"}",
		`var _rpe=_scene[_0x5f48d1(0x42f)][_0x5f48d1(0x11d7)](_0x1b13b8.x,_0x1b13b8.y,_0x5f48d1(0xf44),{`,
		"'frame':_0x5f48d1(0x8a2),",
		`'lifespan':{'min':${burst.lifespanMin},'max':${burst.lifespanMax}},`,
		`'speed':{'min':${burst.speedMin},'max':${burst.speedMax}},`,
		`'scale':{'start':${burst.scaleStart},'end':${burst.scaleEnd}},`,
		`'alpha':{'start':${burst.alphaStart},'end':${burst.alphaEnd}},`,
		`'tint':${color},`,
		"'blendMode':Phaser[_0x5f48d1(0x496)][_0x5f48d1(0x98a)],",
		"'emitting':false",
		"});",
		`_rpe.explode(${burst.explodeCount});`,
		`_scene.time.delayedCall(${burst.destroyDelay},function(){_rpe.destroy();});`,
		`var _rcw=_scene[_0x5f48d1(0x42f)].graphics({x:_0x1b13b8.x,y:_0x1b13b8.y});`,
		`_rcw.lineStyle(${shockwave.lineWidth},${color},1);`,
		`_rcw.strokeCircle(0,0,${shockwave.radius});`,
		`_scene[_0x5f48d1(0x16c1)][_0x5f48d1(0x42f)]({'targets':_rcw,'scaleX':${shockwave.expandScale},'scaleY':${shockwave.expandScale},'alpha':0,'duration':${shockwave.duration},'ease':'Sine.Out','onComplete':function(){_rcw.destroy();}});`,
		"}catch(_ev){console.warn('ring vfx error',_ev);}",
		"}",
	].join("");
}

export function generateOsPatches(): string {
	const lines: string[] = [];

	for (const obj of OBJECTS) {
		if (!obj.inOriginalOs) {
			const props: string[] = [];
			props.push(`'type':${obj.type}`);
			if (obj.frame) {
				props.push(`'frame':'${obj.frame}'`);
			} else {
				props.push("'frame':null");
			}
			props.push(`'gridW':${obj.gridW}`);
			props.push(`'gridH':${obj.gridH}`);
			lines.push(`os[${obj.id}]={${props.join(",")}};`);
		}

		if (obj.collision) {
			lines.push(`os[${obj.id}].colType='${obj.collision.type}';`);
			lines.push(`os[${obj.id}].hitW=${obj.collision.width};`);
			lines.push(`os[${obj.id}].hitH=${obj.collision.height};`);
		}

		if (obj.sub) {
			lines.push(`os[${obj.id}].sub='${obj.sub}';`);
		}

		if (obj.portalParticle) {
			lines.push(`os[${obj.id}]['portalParticle']=!0;`);
			lines.push(
				`os[${obj.id}]['portalParticleColor']=${obj.portalParticleColor};`,
			);
		}

		if (obj.audioScale) {
			lines.push(`os[${obj.id}]['audioScale']=!0;`);
		}

		if (obj.padParticleColor !== undefined) {
			lines.push(`os[${obj.id}]['padParticleColor']=${obj.padParticleColor};`);
		}

		if (obj.ringParticleColor !== undefined) {
			lines.push(
				`os[${obj.id}]['ringParticleColor']=${obj.ringParticleColor};`,
			);
			lines.push(`os[${obj.id}]['glow']=!1;`);
		}

		const hasNewChildProps = obj.children?.some(
			(child) =>
				child.blend !== undefined || child.z !== undefined || child.audioScale,
		);
		if (hasNewChildProps && obj.children) {
			const childEntries: string[] = [];
			for (const child of obj.children) {
				const childProps: string[] = [];
				childProps.push(`'frame':'${child.frame}'`);
				if (child.x !== 0) childProps.push(`'localDx':${child.x}`);
				if (child.y !== 0) childProps.push(`'localDy':${child.y}`);
				if (child.blend) childProps.push(`'blend':'${child.blend}'`);
				if (child.tint !== undefined) childProps.push(`'tint':${child.tint}`);
				if (child.z !== undefined) childProps.push(`'z':${child.z}`);
				if (child.audioScale) childProps.push(`'audioScale':!0`);
				childEntries.push(`{${childProps.join(",")}}`);
			}
			lines.push(`os[${obj.id}]['children']=[${childEntries.join(",")}];`);
		}
	}

	return lines.join("");
}

export const OS_TABLE_HOOK = "=!0x0);function ls(";

export function generateOsTableReplacement(): string {
	return `=!0x0);${generateOsPatches()}function ls(`;
}

export function generateCreationPatch(): string {
	return [
		"else if(_0x24471f.colType){",
		"var _col=new O(_0x24471f.colType,_0x173c58,_0x7ab528,_0x24471f.hitW,_0x24471f.hitH);",
		"_col._eeSprite=this._eeLastSprite;",
		"this[_0x5bb2ae(0x139c)][_0x5bb2ae(0x3ae)](_col);",
		"this[_0x5bb2ae(0x218)](_col);",
		"}",
	].join("");
}

export const CREATION_HOOK =
	"this[_0x5bb2ae(0x218)](_0x4bd7bc);}}}}}}_0x443c50";

export function generateCreationReplacement(): string {
	const closing = "this[_0x5bb2ae(0x218)](_0x4bd7bc);}";
	const portalBlockClose = "}";
	const newBranch = generateCreationPatch();
	const remainingBraces = "}}}}_0x443c50";

	return `${closing}${portalBlockClose}${newBranch}${remainingBraces}`;
}

export function generateDispatchPatch(effects: PadEffectConfig): string {
	const checks: string[] = [];

	for (const obj of OBJECTS) {
		if (!obj.collision) continue;

		if (obj.padVelocity !== undefined) {
			const dispatch = padDispatch(
				obj.padVelocity,
				obj.padParticleColor as number,
				obj.padFlipGravity ?? false,
				effects,
			);
			checks.push(
				`if(_0x1b13b8.type==='${obj.collision.type}'){${dispatch}return;}`,
			);
		} else if (obj.ringVelocity !== undefined) {
			const dispatch = ringDispatch(
				obj.ringVelocity,
				obj.ringParticleColor as number,
				effects,
			);
			checks.push(
				`if(_0x1b13b8.type==='${obj.collision.type}'){${dispatch}return;}`,
			);
		} else if (obj.portalDispatch) {
			checks.push(
				`if(_0x1b13b8.type==='${obj.collision.type}'){${obj.portalDispatch}return;}`,
			);
		}
	}

	return checks.join("");
}

export const DISPATCH_HOOK =
	"if(_0x1b13b8[_0x5f48d1(0x1684)]!==_){if(_0x1b13b8[_0x5f48d1(0x1684)]!==w){if(_0x1b13b8[_0x5f48d1(0x1684)]===x)return void this[_0x5f48d1(0x154)]();if(_0x1b13b8[_0x5f48d1(0x1684)]===y)";

export function generateDispatchReplacement(effects: PadEffectConfig): string {
	return `${generateDispatchPatch(effects)}${DISPATCH_HOOK}`;
}

const EXTRA_SPRITES: Record<string, string[]> = {
	"GJ_GameSheet02-hd": ["portal_01_back_001.png", "portal_02_back_001.png"],
	"GJ_GameSheetGlow-hd": ["ring_01_glow_001.png"],
};

export const SPRITE_REQUIREMENTS: Record<string, string[]> = (() => {
	const reqs: Record<string, Set<string>> = {};

	for (const obj of OBJECTS) {
		if (!obj.sheet || !obj.frame) continue;

		if (!reqs[obj.sheet]) reqs[obj.sheet] = new Set();
		reqs[obj.sheet].add(obj.frame);

		if (obj.children) {
			for (const child of obj.children) {
				const childSheet = child.sheet ?? obj.sheet;
				if (!reqs[childSheet]) reqs[childSheet] = new Set();
				reqs[childSheet].add(child.frame);
			}
		}
	}

	for (const [sheet, sprites] of Object.entries(EXTRA_SPRITES)) {
		if (!reqs[sheet]) reqs[sheet] = new Set();
		for (const sprite of sprites) {
			reqs[sheet].add(sprite);
		}
	}

	const result: Record<string, string[]> = {};
	for (const [sheet, sprites] of Object.entries(reqs)) {
		result[sheet] = [...sprites];
	}

	return result;
})();

export const COLLISION_HOOK =
	"_0x2841ea=(this['p'][_0x5f48d1(0x845)]<=0x0||this['p'][_0x5f48d1(0x9ab)])&&(_0x146a97>=_0x8a8d9a||_0x869e42>=_0x8a8d9a);if(_0x3c1654&&!_0x2841ea)return void this[_0x5f48d1(0x154)]();if(_0x3c691e+0x1e-0x5>_0xf3791a&&_0x3c691e-0x1e+0x5<_0x17dbc8){if((_0x146a97>=_0x8a8d9a||_0x869e42>=_0x8a8d9a)&&(this['p'][_0x5f48d1(0x845)]<=0x0||this['p'][_0x5f48d1(0x9ab)])){this['p']['y']=_0x8a8d9a+_0x6bfa06,this[_0x5f48d1(0x1890)](),_0x30410f=!0x0,this['p'][_0x5f48d1(0x112f)]=_0x8a8d9a,this['p'][_0x5f48d1(0x5df)]||this['_checkSnapJump'](_0x1b13b8);continue;}if((_0x3e7199<=_0x2d2fa7||_0x135a9d<=_0x2d2fa7)&&(this['p'][_0x5f48d1(0x845)]>=0x0||this['p']['onGround'])&&this['p'][_0x5f48d1(0x5df)]){this['p']['y']=_0x2d2fa7-_0x6bfa06,this[_0x5f48d1(0x1890)](),this['p'][_0x5f48d1(0x200)]=!0x0,this['p']['collideTop']=_0x2d2fa7;continue;}}}}";

export function generateCollisionReplacement(): string {
	return [
		"_0x2841ea=this['p'][_0x5f48d1(0xa22)]",
		"?(this['p'][_0x5f48d1(0x845)]>=0x0||this['p'][_0x5f48d1(0x9ab)])&&(_0x3e7199<=_0x2d2fa7||_0x135a9d<=_0x2d2fa7)",
		":(this['p'][_0x5f48d1(0x845)]<=0x0||this['p'][_0x5f48d1(0x9ab)])&&(_0x146a97>=_0x8a8d9a||_0x869e42>=_0x8a8d9a);",
		"if(_0x3c1654&&!_0x2841ea)return void this[_0x5f48d1(0x154)]();",
		"var _gf=this['p'][_0x5f48d1(0xa22)];",
		"if(_0x3c691e+0x1e-0x5>_0xf3791a&&_0x3c691e-0x1e+0x5<_0x17dbc8){",
		"if((_gf?(_0x3e7199<=_0x2d2fa7||_0x135a9d<=_0x2d2fa7)&&(this['p'][_0x5f48d1(0x845)]>=0x0||this['p'][_0x5f48d1(0x9ab)]):(_0x146a97>=_0x8a8d9a||_0x869e42>=_0x8a8d9a)&&(this['p'][_0x5f48d1(0x845)]<=0x0||this['p'][_0x5f48d1(0x9ab)]))){",
		"this['p']['y']=_gf?_0x2d2fa7-_0x6bfa06:_0x8a8d9a+_0x6bfa06,this[_0x5f48d1(0x1890)](),_0x30410f=!0x0,this['p'][_0x5f48d1(0x112f)]=_gf?_0x2d2fa7:_0x8a8d9a,this['p'][_0x5f48d1(0x5df)]||this['_checkSnapJump'](_0x1b13b8);continue;}",
		"if((_gf?(_0x146a97>=_0x8a8d9a||_0x869e42>=_0x8a8d9a)&&(this['p'][_0x5f48d1(0x845)]<=0x0||this['p'][_0x5f48d1(0x9ab)]):(_0x3e7199<=_0x2d2fa7||_0x135a9d<=_0x2d2fa7)&&(this['p'][_0x5f48d1(0x845)]>=0x0||this['p']['onGround']))&&(_gf||this['p'][_0x5f48d1(0x5df)])){",
		"this['p']['y']=_gf?_0x8a8d9a+_0x6bfa06:_0x2d2fa7-_0x6bfa06,this[_0x5f48d1(0x1890)](),this['p'][_0x5f48d1(0x200)]=!0x0,this['p']['collideTop']=_gf?_0x8a8d9a:_0x2d2fa7;continue;}",
		"}}",
		"}",
	].join("");
}

export const FLIP_HOOK =
	"_0x2c61a1['sprite'][_0x423b5e(0x17fc)]=_0x2907d3);}this[_0x423b5e(0x4cf)](_0x30c325,_0x3f0607,_0x3afedf);}";

export function generateFlipReplacement(): string {
	return [
		"_0x2c61a1['sprite'][_0x423b5e(0x17fc)]=_0x2907d3);}",
		"for(var _fl of this[_0x423b5e(0x1204)])if(_fl&&_fl[_0x423b5e(0xe42)]){",
		"var _sp=_fl[_0x423b5e(0xe42)];",
		"if(this['p'][_0x423b5e(0xa22)]){",
		"_sp['scaleY']=-Math.abs(_sp['scaleY']);",
		"_sp[_0x423b5e(0x17fc)]=-_sp[_0x423b5e(0x17fc)];",
		"_sp['y']=2*_0x1a433c-_sp['y'];",
		"}else{_sp['scaleY']=Math.abs(_sp['scaleY']);}",
		"}",
		"var _snY=_0x1a433c-_0x3f0607;",
		"var _skObj=this[_0x423b5e(0x244)];",
		"var _origSP;",
		"if(this['p'][_0x423b5e(0xa22)]&&_skObj){",
		"_origSP=_skObj[_0x423b5e(0x7f9)];",
		"var _snRef=_snY;",
		"_skObj[_0x423b5e(0x7f9)]=function(px,py){return _origSP.call(this,px,2*_snRef-py);};",
		"}",
		"this[_0x423b5e(0x4cf)](_0x30c325,_0x3f0607,_0x3afedf);",
		"if(_origSP&&_skObj){_skObj[_0x423b5e(0x7f9)]=_origSP;}",
		"if(this['p'][_0x423b5e(0xa22)]){",
		"var _ge=this[_0x423b5e(0x809)];",
		"if(_ge){_ge[_0x423b5e(0x10eb)]=2*_snY-_ge[_0x423b5e(0x10eb)];}",
		"var _fe=this[_0x423b5e(0x31c)];",
		"if(_fe){_fe[_0x423b5e(0x10eb)]=2*_snY-_fe[_0x423b5e(0x10eb)];}",
		"var _f2=this[_0x423b5e(0x163d)];",
		"if(_f2){_f2[_0x423b5e(0x10eb)]=2*_snY-_f2[_0x423b5e(0x10eb)];}",
		"var _sd=this[_0x423b5e(0x1b6)];",
		"if(_sd){_sd[_0x423b5e(0x10eb)]=2*_0x1a433c-_sd[_0x423b5e(0x10eb)];}",
		"}",
		"}",
	].join("");
}

export function generatePortalSubPatch(): string {
	return [
		"if(_0x5bb2ae(0xcec)===_0x24471f['sub']?_0x25452a=_:",
		"'cube'===_0x24471f[_0x5bb2ae(0x11f7)]?_0x25452a=w:",
		"'gravity_flip'===_0x24471f[_0x5bb2ae(0x11f7)]?_0x25452a='gflip':",
		"'gravity_normal'===_0x24471f[_0x5bb2ae(0x11f7)]&&(_0x25452a='gnorm')",
		",_0x25452a)",
	].join("");
}

export const PORTAL_SUB_HOOK =
	"if(_0x5bb2ae(0xcec)===_0x24471f['sub']?_0x25452a=_:'cube'===_0x24471f[_0x5bb2ae(0x11f7)]&&(_0x25452a=w),_0x25452a)";

export const SPAWN_HOOK =
	"this['_addToSection'](_0xe3eaec));}if(_0x24471f['children'])";

export function generateSpawnReplacement(effects: PadEffectConfig): string {
	const { idle, ringIdle } = effects;
	return [
		"this['_addToSection'](_0xe3eaec));}",
		"this._eeLastSprite=_0x554e0e;",
		"if(_0x24471f&&_0x24471f[_0x5bb2ae(0x743)]&&_0x554e0e){",
		"try{",
		"_0x554e0e[_0x5bb2ae(0x655)](0.1);",
		"_0x554e0e[_0x5bb2ae(0xd4c)](0.9);",
		"_0x554e0e[_0x5bb2ae(0x101d)]=!0x0;",
		"this[_0x5bb2ae(0x535)]['push'](_0x554e0e);",
		"}catch(_as0){console.warn('audioScale error',_as0,_0x24471f);}",
		"}",
		"if(_0x24471f&&_0x24471f['padParticleColor']!==undefined&&_0x554e0e){",
		"try{",
		"var _padScene=_0x554e0e['scene'];",
		"var _padColor=_0x24471f['padParticleColor'];",
		`var _padEmitter=_padScene[_0x5bb2ae(0x42f)][_0x5bb2ae(0x11d7)](_0x554e0e.x,_0x554e0e.y,_0x5bb2ae(0xf44),{`,
		"'frame':_0x5bb2ae(0x8a2),",
		`'lifespan':{'min':${idle.lifespanMin},'max':${idle.lifespanMax}},`,
		`'speed':{'min':${idle.speedMin},'max':${idle.speedMax}},`,
		`'angle':{'min':${idle.angleMin},'max':${idle.angleMax}},`,
		`'scale':{'start':${idle.scaleStart},'end':${idle.scaleEnd}},`,
		`'alpha':{'start':${idle.alphaStart},'end':${idle.alphaEnd}},`,
		"'tint':_padColor,",
		"'blendMode':Phaser[_0x5bb2ae(0x496)][_0x5bb2ae(0x98a)],",
		`'frequency':${idle.frequency},`,
		`'quantity':${idle.quantity},`,
		"'emitting':true,",
		`'emitZone':{'type':'random','source':new Phaser.Geom.Rectangle(${-idle.emitZoneHalfW},${-idle.emitZoneHalfH},${idle.emitZoneHalfW * 2},${idle.emitZoneHalfH * 2})}`,
		"});",
		"if(_0x554e0e.parentContainer){_0x554e0e.parentContainer.add(_padEmitter);}",
		"_padEmitter[_0x5bb2ae(0x115f)]((_0x554e0e.depth||1)-1);",
		"}catch(_pe0){console.warn('pad idle emitter error',_pe0);}",
		"}",
		"if(_0x24471f&&_0x24471f['ringParticleColor']!==undefined&&_0x554e0e){",
		"try{",
		"var _ringScene=_0x554e0e['scene'];",
		"var _ringColor=_0x24471f['ringParticleColor'];",
		`var _ringEmitter=_ringScene[_0x5bb2ae(0x42f)][_0x5bb2ae(0x11d7)](_0x554e0e.x,_0x554e0e.y,_0x5bb2ae(0xf44),{`,
		"'frame':_0x5bb2ae(0x8a2),",
		`'lifespan':{'min':${ringIdle.lifespanMin},'max':${ringIdle.lifespanMax}},`,
		`'speed':{'min':${ringIdle.speedMin},'max':${ringIdle.speedMax}},`,
		"'angle':{'min':0,'max':360},",
		`'scale':{'start':${ringIdle.scaleStart},'end':${ringIdle.scaleEnd}},`,
		`'alpha':{'start':${ringIdle.alphaStart},'end':${ringIdle.alphaEnd}},`,
		`'gravityY':${ringIdle.gravityY},`,
		"'tint':_ringColor,",
		"'blendMode':Phaser[_0x5bb2ae(0x496)][_0x5bb2ae(0x98a)],",
		`'frequency':${ringIdle.frequency},`,
		`'quantity':${ringIdle.quantity},`,
		"'emitting':true,",
		`'emitZone':{'type':'random','source':new Phaser.Geom.Circle(0,0,${ringIdle.emitRadius})}`,
		"});",
		"if(_0x554e0e.parentContainer){_0x554e0e.parentContainer.add(_ringEmitter);}",
		"_ringEmitter[_0x5bb2ae(0x115f)]((_0x554e0e.depth||1)-1);",
		"}catch(_re0){console.warn('ring idle emitter error',_re0);}",
		"}",
		"if(_0x24471f&&_0x24471f['ringParticleColor']!==undefined&&_0x554e0e){",
		"try{",
		"var _glowScene=_0x554e0e['scene'];",
		"if(!_glowScene.textures.exists('_eeRingGlow')){",
		"var _gc=document.createElement('canvas');",
		"_gc.width=80;_gc.height=80;",
		"var _gctx=_gc.getContext('2d');",
		"var _grad=_gctx.createRadialGradient(40,40,8,40,40,40);",
		"_grad.addColorStop(0,'rgba(255,255,255,0.7)');",
		"_grad.addColorStop(0.4,'rgba(255,255,255,0.3)');",
		"_grad.addColorStop(1,'rgba(255,255,255,0)');",
		"_gctx.fillStyle=_grad;",
		"_gctx.fillRect(0,0,80,80);",
		"_glowScene.textures.addCanvas('_eeRingGlow',_gc);",
		"}",
		"var _glowSp=_glowScene[_0x5bb2ae(0x42f)].image(_0x554e0e.x,_0x554e0e.y,'_eeRingGlow');",
		"_glowSp[_0x5bb2ae(0x52e)](Phaser[_0x5bb2ae(0x496)][_0x5bb2ae(0x98a)]);",
		"_glowSp.setTint(_0x24471f['ringParticleColor']);",
		"_glowSp[_0x5bb2ae(0x655)](0.1);",
		"_glowSp[_0x5bb2ae(0x101d)]=!0x0;",
		"this[_0x5bb2ae(0x535)][_0x5bb2ae(0x3ae)](_glowSp);",
		"if(_0x554e0e.parentContainer){_0x554e0e.parentContainer.addAt(_glowSp,0);}",
		"}catch(_ge0){console.warn('ring glow error',_ge0);}",
		"}",
		"if(_0x24471f['children'])",
	].join("");
}
