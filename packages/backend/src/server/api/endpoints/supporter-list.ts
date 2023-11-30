import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { PatreonManagementService } from '@/core/integrations/PatreonManagementService.js';
import { FanboxManagementService } from '@/core/integrations/FanboxManagementService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { MetaService } from '@/core/MetaService.js';

export const meta = {
	requireCredential: false,
	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

type SupporterUser = {
	username: string,
	name: string,
	avatarUrl: string,
	withIcon: boolean,
}

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private userEntityService: UserEntityService,
		private patreonManagementService: PatreonManagementService,
		private fanboxManagementService: FanboxManagementService,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const patreons = this.patreonManagementService.getPatreonUsers();
			const supporters = this.fanboxManagementService.getFanboxUsers();
			const users: Map<string, SupporterUser> = new Map();
			const meta = await this.metaService.fetch();

			if (!meta.enableSupporterPage || !meta.supporterNameThreshold || !meta.supporterNameWithIconThreshold) return [];

			for (const patreon of Object.values(patreons)) {
				if (patreon.amounts < meta.supporterNameThreshold || patreon.isHideFromSupporterPage) continue;
				users.set(patreon.user.id, {
					username: patreon.user.username,
					name: patreon.user.name ?? patreon.user.username,
					avatarUrl: patreon.user.avatarUrl ?? this.userEntityService.getIdenticonUrl(patreon.user),
					withIcon: meta.supporterNameWithIconThreshold <= patreon.amounts,
				});
			}

			for (const supporter of Object.values(supporters)) {
				if (supporter.amounts < meta.supporterNameThreshold || supporter.isHideFromSupporterPage) continue;
				users.set(supporter.user.id, {
					username: supporter.user.username,
					name: supporter.user.name ?? supporter.user.username,
					avatarUrl: supporter.user.avatarUrl ?? this.userEntityService.getIdenticonUrl(supporter.user),
					withIcon: meta.supporterNameWithIconThreshold <= supporter.amounts,
				});
			}

			return Array.from(users.values());
		});
	}
}
