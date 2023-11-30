import { Injectable, Inject } from '@nestjs/common';
import { Not } from 'typeorm';
import fetch from 'node-fetch';
import { MetaService } from '@/core/MetaService.js';
import type { UserProfilesRepository, MiUser } from '@/models/_.js';
import { HttpRequestService } from '@/core/HttpRequestService.js';
import { StatusError } from '@/misc/status-error.js';
import { DI } from '@/di-symbols.js';
import type Logger from '@/logger.js';
import { LoggerService } from '@/core/LoggerService.js';
import { bindThis } from '@/decorators.js';
import type { OnApplicationShutdown } from '@nestjs/common';

type FanboxMember = {
	amounts: number,
	user: MiUser,
	isHideFromSupporterPage: boolean,
}

@Injectable()
export class FanboxManagementService implements OnApplicationShutdown {
	private intervalId: NodeJS.Timeout;
	private timeoutId: NodeJS.Timeout;
	private logger: Logger;
	private cache: Record<string, FanboxMember> = {};
	private cacheLastUpdate = 0;
	private isWaitingToUpdate = false;
	private isUpdating = false;

	constructor(
		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		private metaService: MetaService,
		private httpRequestService: HttpRequestService,
		private loggerService: LoggerService,
	) {
		this.logger = this.loggerService.getLogger('fanbox-manager');
		this.start();
	}

	@bindThis
	private async start(): Promise<void> {
		this.updateCache();

		// 1時間おきにキャッシュを更新する
		this.intervalId = setInterval(this.updateCache, 1000 * 60 * 60);
	}

	@bindThis
	public amountsValue(user: MiUser): number {
		const target = this.cache[user.id];
		return target?.amounts ?? 0;
	}

	@bindThis
	public getFanboxUsers() {
		return this.cache;
	}

	@bindThis
	public requestUpdateCache(): void {
		// 最後に更新してから5分経過していなければキューに追加
		if (Date.now() - this.cacheLastUpdate < 1000 * 60 * 5 && !this.isWaitingToUpdate) {
			this.isWaitingToUpdate = true;
			const waitTime = this.cacheLastUpdate + (1000 * 60 * 5) - Date.now();
			this.logger.debug(`Refresh request received. next refresh is after ${waitTime}ms`);
			this.timeoutId = setTimeout(this.updateCache, waitTime);
			return;
		}

		this.updateCache();
	}

	@bindThis
	private async updateCache(): Promise<void> {
		if (this.isUpdating) return;
		const meta = await this.metaService.fetch();
		if (!meta.enableFanboxIntegration) return;

		this.isUpdating = true;

		const members = await this.fetchUsers();
		const users = await this.userProfilesRepository.find({
			where: {
				integrations: Not('{}'),
			},
			relations: {
				user: {
					avatar: true,
				},
			},
		});

		const usersList = {} as Record<string, FanboxMember>;

		for (const user of users) {
			const pixivId = user.integrations.fanbox?.id;
			const amounts = pixivId ? members[pixivId] : null;
			if (!amounts) continue;
			usersList[user.userId] = {
				amounts,
				user: user.user as MiUser,
				isHideFromSupporterPage: user.hideFromSupporterPage,
			};
		}

		this.logger.info(`Found ${Object.keys(usersList).length} fanbox supporter(s)`);
		this.cache = usersList;
		this.cacheLastUpdate = Date.now();
		this.isWaitingToUpdate = false;
		this.isUpdating = false;

		this.logger.info('Cache updated.');
	}

	@bindThis
	private async fetchUsers(): Promise<Record<string, number>> {
		this.logger.debug('Getting fanbox supporters from api');

		const plans = (await this.request('plan'))?.body;
		const members = (await this.request('relationship'))?.body;

		if (!plans || !members) throw new Error('Failed to fetch fanbox supporters');

		const plansMap = {} as Record<string, number>;
		for (const plan of plans) {
			plansMap[plan.id] = plan.fee;
		}

		const membershipUsers = {} as Record<string, number>;
		for (const member of members) {
			membershipUsers[member.user.userId] = plansMap[member.planId];
		}

		return membershipUsers;
	}

	@bindThis
	private async request(url: string, retry = 0): Promise<any> {
		if (retry >= 2) return {};
		const meta = await this.metaService.fetch(true);

		return await this.httpRequestService.getJson(encodeURI(`${meta.fanboxApiBackendUrl}/api/${url}`), '*/*').then(res => res).catch(async err => {
			if (!(err instanceof StatusError)) {
				this.logger.error(err);
				return {};
			}
			if (err.statusCode !== 401) return {};
			return await this.request(url, retry + 1);
		});
	}

	async onApplicationShutdown(): Promise<void> {
		clearInterval(this.intervalId);
		clearTimeout(this.timeoutId);
	}
}
