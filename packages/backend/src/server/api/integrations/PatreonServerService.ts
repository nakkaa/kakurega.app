import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';
import { OAuth2 } from 'oauth';
import { IsNull } from 'typeorm';
import type { Config } from '@/config.js';
import type { UserProfilesRepository, UsersRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { HttpRequestService } from '@/core/HttpRequestService.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { MetaService } from '@/core/MetaService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { FastifyReplyError } from '@/misc/fastify-reply-error.js';
import { bindThis } from '@/decorators.js';
import type { FastifyInstance, FastifyRequest, FastifyPluginOptions } from 'fastify';

@Injectable()
export class PatreonServerService {
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.redis)
		private redisClient: Redis.Redis,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		private userEntityService: UserEntityService,
		private httpRequestService: HttpRequestService,
		private globalEventService: GlobalEventService,
		private metaService: MetaService,
	) {
		//this.create = this.create.bind(this);
	}

	@bindThis
	public create(fastify: FastifyInstance, options: FastifyPluginOptions, done: (err?: Error) => void) {
		fastify.get('/disconnect/patreon', async (request, reply) => {
			if (!this.compareOrigin(request)) {
				throw new FastifyReplyError(400, 'invalid origin');
			}

			const userToken = this.getUserToken(request);
			if (!userToken) {
				throw new FastifyReplyError(400, 'signin required');
			}

			const user = await this.usersRepository.findOneByOrFail({
				host: IsNull(),
				token: userToken,
			});

			const profile = await this.userProfilesRepository.findOneByOrFail({ userId: user.id });

			delete profile.integrations.patreon;

			await this.userProfilesRepository.update(user.id, {
				integrations: profile.integrations,
			});

			// Publish i updated event
			this.globalEventService.publishMainStream(user.id, 'meUpdated', await this.userEntityService.pack(user, user, {
				detail: true,
				includeSecrets: true,
			}));

			return 'Patreonの連携を解除しました :v:';
		});

		const getOath2 = async () => {
			const meta = await this.metaService.fetch(true);

			if (meta.enablePatreonIntegration && meta.patreonClientId && meta.patreonClientSecret) {
				return new OAuth2(
					meta.patreonClientId,
					meta.patreonClientSecret,
					'https://www.patreon.com/',
					'oauth2/authorize',
					'api/oauth2/token',
				);
			} else {
				return null;
			}
		};

		fastify.get('/connect/patreon', async (request, reply) => {
			if (!this.compareOrigin(request)) {
				throw new FastifyReplyError(400, 'invalid origin');
			}

			const userToken = this.getUserToken(request);
			if (!userToken) {
				throw new FastifyReplyError(400, 'signin required');
			}

			const params = {
				redirect_uri: `${this.config.url}/api/pr/cb`,
				scope: ['identity identity[email]'],
				state: randomUUID(),
				response_type: 'code',
			};

			this.redisClient.set(userToken, JSON.stringify(params));

			const oauth2 = await getOath2();
			reply.redirect(oauth2!.getAuthorizeUrl(params));
		});

		fastify.get<{ Querystring: { code: string; state: string; } }>('/pr/cb', async (request, reply) => {
			const userToken = this.getUserToken(request);

			const oauth2 = await getOath2();

			if (!userToken) {
				throw new FastifyReplyError(400, 'invalid session (code: 1)');
			} else {
				const code = request.query.code;

				if (!code || typeof code !== 'string') {
					throw new FastifyReplyError(400, 'invalid session (code: 2)');
				}

				const { redirect_uri, state } = await new Promise<any>((res, rej) => {
					this.redisClient.get(userToken, async (_, state) => {
						if (state == null) throw new Error('empty state');
						res(JSON.parse(state));
					});
				});

				if (request.query.state !== state) {
					throw new FastifyReplyError(400, 'invalid session (code: 3)');
				}

				const { accessToken, refreshToken, expiresDate } = await new Promise<any>((res, rej) =>
					oauth2!.getOAuthAccessToken(code, {
						grant_type: 'authorization_code',
						redirect_uri,
					}, (err, accessToken, refreshToken, result) => {
						if (err) {
							rej(err);
						} else if (result.error) {
							rej(result.error);
						} else {
							res({
								accessToken,
								refreshToken,
								expiresDate: Date.now() + Number(result.expires_in) * 1000,
							});
						}
					}));

				const { data } = (await this.httpRequestService.getJson(`https://www.patreon.com/api/oauth2/v2/identity?${encodeURI('fields[user]=email')}`, 'application/json', {
					'Authorization': `bearer ${accessToken}`,
				})) as Record<string, any>;

				const email = data?.attributes?.email;

				if (typeof email !== 'string') {
					throw new FastifyReplyError(400, 'invalid session (code: 4)');
				}

				const aleadyConnectedUser = await this.userProfilesRepository.findOneBy({ integrations: { patreon: { id: email } } });
				if (aleadyConnectedUser) {
					throw new FastifyReplyError(403, 'このPatreonアカウントは既に他のアカウントに接続されているため、接続できません。');
				}

				const user = await this.usersRepository.findOneByOrFail({
					host: IsNull(),
					token: userToken,
				});

				const profile = await this.userProfilesRepository.findOneByOrFail({ userId: user.id });

				await this.userProfilesRepository.update(user.id, {
					integrations: {
						...profile.integrations,
						patreon: {
							accessToken: accessToken,
							refreshToken: refreshToken,
							expiresDate: expiresDate,
							id: email as any,
						},
					},
				});

				// Publish i updated event
				this.globalEventService.publishMainStream(user.id, 'meUpdated', await this.userEntityService.pack(user, user, {
					detail: true,
					includeSecrets: true,
				}));

				return `Patreon: ${email} を、Misskey: @${user.username} に接続しました！\n${JSON.stringify(data, null, '    ')}}`;
			}
		});

		done();
	}

	@bindThis
	private getUserToken(request: FastifyRequest): string | null {
		return ((request.headers['cookie'] ?? '').match(/igi=(\w+)/) ?? [null, null])[1];
	}

	@bindThis
	private compareOrigin(request: FastifyRequest): boolean {
		function normalizeUrl(url?: string): string {
			return url ? url.endsWith('/') ? url.substr(0, url.length - 1) : url : '';
		}

		const referer = request.headers['referer'];

		return (normalizeUrl(referer) === normalizeUrl(this.config.url));
	}
}
