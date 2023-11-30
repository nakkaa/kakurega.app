import { Inject, Injectable } from '@nestjs/common';
import type { UserProfilesRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';

export const meta = {
	requireCredential: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		private userEntityService: UserEntityService,
		private globalEventService: GlobalEventService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const profile = await this.userProfilesRepository.findOneByOrFail({ userId: me.id });

			delete profile.integrations.fanbox;

			await this.userProfilesRepository.update(me.id, {
				integrations: profile.integrations,
			});

			// Publish i updated event
			this.globalEventService.publishMainStream(me.id, 'meUpdated', await this.userEntityService.pack(me, me, {
				detail: true,
				includeSecrets: true,
			}));
		});
	}
}
