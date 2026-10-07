/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DEMO_DIR = path.join(ROOT_DIR, 'demo');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const CHROME_BIN =
	process.env.CHROME_BIN ||
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

let ffmpegBin = process.env.FFMPEG_BIN;
if (!ffmpegBin) {
	for (const candidate of ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', 'ffmpeg']) {
		try {
			execFileSync(candidate, ['-version'], { stdio: 'ignore' });
			ffmpegBin = candidate;
			break;
		} catch {}
	}
}
if (!ffmpegBin) ffmpegBin = 'ffmpeg';

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.mp4': 'video/mp4',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.json': 'application/json',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getFreePort = () =>
	new Promise((resolve, reject) => {
		const s = http.createServer();
		s.listen(0, '127.0.0.1', () => {
			const port = s.address().port;
			s.close((err) => (err ? reject(err) : resolve(port)));
		});
	});

// Curated high-contrast palette with strong hue jumps between consecutive entries
const COLORS = [
	'#f0f8ff', // 0: Aliceblue (initial)
	'#ff9aa2', // 1: Coral pink
	'#80e5ff', // 2: Sky cyan
	'#ffe066', // 3: Sunny yellow
	'#b592ff', // 4: Lavender purple
	'#8ce99a', // 5: Mint green
	'#ffa94d', // 6: Tangerine
	'#74c0fc', // 7: Cornflower blue
	'#f783ac', // 8: Rose pink
	'#63e6be', // 9: Aquamarine
	'#ffd43b', // 10: Gold
	'#da77f2', // 11: Orchid
	'#a9e34b', // 12: Lime
	'#ff8787', // 13: Salmon
	'#66d9e8', // 14: Turquoise
	'#ffc078', // 15: Apricot
	'#9775fa', // 16: Violet
	'#69db7c', // 17: Spring green
	'#faa2c1', // 18:amingo pink
	'#91a7ff', // 19: Periwinkle
	'#ffe8cc', // 20: Cream peach
	'#3bc9db', // 21: Cyan blue
	'#e599f7', // 22: Lilac
	'#c0eb75', // 23: Chartreuse
];

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const FPS = 30;
const TRANSITION_DURATION_SEC = 0.5;
const HOLD_BEFORE_FRAMES = 6; // ~0.2s before clicking Go!
const BUTTON_ACTIVE_FRAMES = 3; // ~0.1s button pressed state
const HOLD_AFTER_FRAMES = 6; // ~0.2s after transition completes

// Parse optional CLI flags (e.g. --effects=0,2,8,10,12 or default to all 0..22)
const args = process.argv.slice(2);
const effectsArg = args.find((a) => a.startsWith('--effects='));
const EFFECTS = effectsArg
	? effectsArg
			.split('=')[1]
			.split(',')
			.map((n) => parseInt(n.trim(), 10))
	: Array.from({ length: 23 }, (_, i) => i);

const outputArg = args.find((a) => a.startsWith('--output='));
const OUTPUT_MP4 = outputArg
	? path.resolve(outputArg.split('=')[1])
	: path.join(DEMO_DIR, 'shared', 'demo.mp4');
const OUTPUT_POSTER = OUTPUT_MP4.replace(/\.mp4$/i, '-poster.png');

// 1. Ensure demo/dist has the latest files from src/
const demoDistDir = path.join(DEMO_DIR, 'dist');
await fs.rm(demoDistDir, { recursive: true, force: true });
await fs.mkdir(demoDistDir, { recursive: true });
await fs.cp(SRC_DIR, demoDistDir, { recursive: true });

// 2. Setup temporary working directory
const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ie-pt-video-'));
const FRAMES_DIR = path.join(tmpDir, 'frames');
const USER_DATA_DIR = path.join(tmpDir, 'chrome-profile');
await fs.mkdir(FRAMES_DIR, { recursive: true });

// 3. Start local static HTTP server serving DEMO_DIR on 127.0.0.1
const server = http.createServer(async (req, res) => {
	try {
		const urlObj = new URL(req.url, 'http://127.0.0.1');
		const reqPath = decodeURIComponent(urlObj.pathname);
		let fullPath = path.resolve(DEMO_DIR, '.' + reqPath);

		// Security: ensure path stays within DEMO_DIR
		if (!fullPath.startsWith(DEMO_DIR + path.sep) && fullPath !== DEMO_DIR) {
			res.writeHead(403);
			res.end('Forbidden');
			return;
		}

		let stat;
		try {
			stat = await fs.stat(fullPath);
		} catch {
			// Support clean URLs (e.g. /mpa/enter/0 -> /mpa/enter/0.html)
			fullPath += '.html';
			stat = await fs.stat(fullPath);
		}

		if (stat.isDirectory()) {
			fullPath = path.join(fullPath, 'index.html');
		}

		const data = await fs.readFile(fullPath);
		const ext = path.extname(fullPath).toLowerCase();
		res.writeHead(200, {
			'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
		});
		res.end(data);
	} catch {
		res.writeHead(404);
		res.end('Not found');
	}
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const serverPort = server.address().port;
const fullDemoUrl = `http://127.0.0.1:${serverPort}/spa/`;
console.log(`Launching URL: ${fullDemoUrl}`);

const chromeDebugPort = await getFreePort();

// 4. Launch Chrome headless
const chrome = spawn(CHROME_BIN, [
	'--headless=new',
	`--remote-debugging-port=${chromeDebugPort}`,
	`--user-data-dir=${USER_DATA_DIR}`,
	`--window-size=${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}`,
	'--hide-scrollbars',
	'--no-first-run',
	'--no-default-browser-check',
	'--mute-audio',
	fullDemoUrl,
]);

try {
	// Connect to Chrome page target via CDP
	let target = null;
	for (let i = 0; i < 30; i++) {
		try {
			const res = await fetch(`http://127.0.0.1:${chromeDebugPort}/json`);
			const list = await res.json();
			const pageTarget = list.find(
				(t) => t.type === 'page' && !t.url.startsWith('chrome-extension://')
			);
			if (pageTarget) {
				target = pageTarget;
				break;
			}
		} catch {}
		await sleep(200);
	}

	if (!target) {
		throw new Error('Failed to connect to Chrome page target');
	}

	const ws = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		ws.addEventListener('open', resolve);
		ws.addEventListener('error', reject);
	});

	let msgId = 1;
	const send = (method, params = {}) =>
		new Promise((resolve, reject) => {
			const id = msgId++;
			const listener = (event) => {
				const data = JSON.parse(event.data);
				if (data.id === id) {
					ws.removeEventListener('message', listener);
					if (data.error) reject(data.error);
					else resolve(data.result);
				}
			};
			ws.addEventListener('message', listener);
			ws.send(JSON.stringify({ id, method, params }));
		});

	await send('Page.enable');
	await send('Runtime.enable');
	await send('Emulation.setDeviceMetricsOverride', {
		width: VIEWPORT_WIDTH,
		height: VIEWPORT_HEIGHT,
		deviceScaleFactor: 1,
		mobile: false,
	});

	// Wait for page load, fonts, and any initial entry View Transition to finish
	await sleep(1200);
	await send('Runtime.evaluate', {
		expression: `(async () => {
			if (document.fonts && document.fonts.ready) {
				await document.fonts.ready;
			}
			for (const anim of document.getAnimations()) {
				anim.finish();
			}
			// Fit header, main, and footer cleanly centered inside 1280x720
			document.body.style.backgroundColor = '${COLORS[0]}';
			document.body.style.display = 'flex';
			document.body.style.flexDirection = 'column';
			document.body.style.justifyContent = 'center';
			document.body.style.padding = '1rem 2rem';
			document.documentElement.style.fontSize = '1.1em';

			const style = document.createElement('style');
			style.textContent = \`
				header, main, footer {
					margin: 0.45rem auto !important;
				}
				button.is-active {
					background: white !important;
					color: black !important;
					transform: scale(0.95);
				}
			\`;
			document.head.appendChild(style);
		})()`,
		awaitPromise: true,
	});

	let frameIndex = 0;
	const captureFrame = async () => {
		const shot = await send('Page.captureScreenshot', { format: 'png' });
		const fileName = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(5, '0')}.png`);
		await fs.writeFile(fileName, Buffer.from(shot.data, 'base64'));
		frameIndex++;
	};

	const transitionFrames = Math.round(TRANSITION_DURATION_SEC * FPS);

	console.log(`Capturing ${EFFECTS.length} transition effects at ${FPS}fps...`);

	for (let idx = 0; idx < EFFECTS.length; idx++) {
		const effectNum = EFFECTS[idx];
		const nextColor = COLORS[(idx + 1) % COLORS.length];

		// 1. Select the effect in the UI dropdown
		const effectLabel = await send('Runtime.evaluate', {
			expression: `(() => {
				const exitSelect = document.querySelector('select[name="Page-Exit"]');
				const enterSelect = document.querySelector('select[name="Page-Enter"]');
				exitSelect.value = '';
				enterSelect.value = '${effectNum}';
				return enterSelect.options[enterSelect.selectedIndex]?.text || 'Effect ${effectNum}';
			})()`,
			returnByValue: true,
		});

		process.stdout.write(`  [${idx + 1}/${EFFECTS.length}] ${effectLabel.result.value} -> ${nextColor}\n`);

		// Capture hold frames before pressing Go!
		for (let f = 0; f < HOLD_BEFORE_FRAMES; f++) {
			await captureFrame();
		}

		// Simulate pressing the Go! button
		await send('Runtime.evaluate', {
			expression: `document.querySelector('form button').classList.add('is-active');`,
		});
		for (let f = 0; f < BUTTON_ACTIVE_FRAMES; f++) {
			await captureFrame();
		}

		// 2. Start the View Transition, wait for vt.ready, and immediately pause its animations
		// so we can scrub them frame-by-frame deterministically.
		await send('Runtime.evaluate', {
			expression: `(async () => {
				const { startViewTransition } = await import('/dist/ie-page-transitions.spa.js');
				const btn = document.querySelector('form button');
				btn.classList.remove('is-active');

				document.querySelector('meta[http-equiv="Page-Exit"]').setAttribute('content', '');
				document.querySelector('meta[http-equiv="Page-Enter"]').setAttribute(
					'content',
					'revealTrans(Duration=${TRANSITION_DURATION_SEC},Transition=${effectNum})'
				);

				const vt = startViewTransition(() => {
					const oldColor = getComputedStyle(document.body).getPropertyValue('background-color');
					document.documentElement.style.setProperty('--page-transitions-backdrop-color', oldColor);
					document.body.style.setProperty('background-color', '${nextColor}');
				});

				window.__activeVT = vt;
				await vt.ready;

				const anims = document.getAnimations();
				for (const anim of anims) {
					anim.pause();
					anim.currentTime = 0;
				}
			})()`,
			awaitPromise: true,
		});

		// 3. Step through the transition frames
		const totalDurationMs = TRANSITION_DURATION_SEC * 1000;
		for (let f = 0; f <= transitionFrames; f++) {
			const currentTimeMs = Math.min(
				totalDurationMs - 1,
				Math.round((f / transitionFrames) * totalDurationMs)
			);
			await send('Runtime.evaluate', {
				expression: `(() => {
					for (const anim of document.getAnimations()) {
						anim.currentTime = ${currentTimeMs};
					}
				})()`,
			});
			await captureFrame();
		}

		// 4. Finish the View Transition cleanly
		await send('Runtime.evaluate', {
			expression: `(async () => {
				for (const anim of document.getAnimations()) {
					anim.finish();
				}
				if (window.__activeVT) {
					await window.__activeVT.finished.catch(() => {});
					window.__activeVT = null;
				}
			})()`,
			awaitPromise: true,
		});

		// 5. Hold briefly on the completed state
		for (let f = 0; f < HOLD_AFTER_FRAMES; f++) {
			await captureFrame();
		}
	}

	ws.close();
	chrome.kill();
	await new Promise((resolve) => chrome.on('exit', resolve));
	server.close();

	// 6. Encode MP4 using ffmpeg and save poster image
	console.log(`Encoding ${frameIndex} frames to ${OUTPUT_MP4}...`);
	execFileSync(ffmpegBin, [
		'-y',
		'-framerate', String(FPS),
		'-i', path.join(FRAMES_DIR, 'frame_%05d.png'),
		'-c:v', 'libx264',
		'-pix_fmt', 'yuv420p',
		'-crf', '20',
		'-preset', 'slow',
		'-movflags', '+faststart',
		'-an',
		OUTPUT_MP4,
	]);

	console.log(`Saving first frame to ${OUTPUT_POSTER}...`);
	await fs.copyFile(path.join(FRAMES_DIR, 'frame_00000.png'), OUTPUT_POSTER);

	console.log(`Successfully generated ${OUTPUT_MP4} and ${OUTPUT_POSTER}!`);
} finally {
	try {
		chrome.kill();
	} catch {}
	try {
		server.close();
	} catch {}
	try {
		await fs.rm(tmpDir, { recursive: true, force: true });
	} catch {}
}
