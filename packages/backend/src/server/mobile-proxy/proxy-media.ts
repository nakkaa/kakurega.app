import * as fs from 'node:fs';
import Koa from 'koa';
import FFmpeg from 'fluent-ffmpeg';
import { StatusError } from '@/misc/fetch.js';
import { serverLogger } from '../index.js';
import { createTempDir } from '@/misc/create-temp.js';
import config from '@/config/index.js';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function proxyMedia(ctx: Koa.Context) {
	if (config.betaTestKey && ctx.query.key !== config.betaTestKey) {
		ctx.status = 403;
		return;
	}

	if (!ctx.query.url && typeof ctx.query.url !== 'string') {
		ctx.status = 400;
		return;
	}
	
	const url = ctx.query.url as string;

	if (!url.match(/https?:\/\/[\w! ?/+\-_~;.,*&@#$%()'[\]]+/)) {
		ctx.status = 400;
		return;
	}

	const [dir, cleanup] = await createTempDir();
	const path = `${dir}/out.webp`;

	try {
		await new Promise((res, rej) => {
			FFmpeg(url)
			.videoFilter('scale=720x480:force_original_aspect_ratio=decrease')
			.on('end', res)
			.on('error', rej)
			.save(path);
		});
		
		ctx.set('Content-Type', 'image/webp');
		ctx.set('Cache-Control', 'max-age=31536000, immutable');
		ctx.body = fs.readFileSync(path);
	} catch (e) {
		serverLogger.error(`${e}`);
		
		if (e instanceof StatusError && (e.statusCode === 302 || e.isClientError)) {
			ctx.status = e.statusCode;
		} else {
			ctx.status = 500;
		}
	} finally {
		cleanup();
	}
}
