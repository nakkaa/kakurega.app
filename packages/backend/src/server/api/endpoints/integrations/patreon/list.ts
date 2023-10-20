import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { PatreonManagementService } from '@/core/integrations/PatreonManagementService.js';
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
	type: 'name' | 'nameWithIcon'
}

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private userEntityService: UserEntityService,
		private patreonManagementService: PatreonManagementService,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const patreons = this.patreonManagementService.getPatreonUsers();
			const users: SupporterUser[] = [];
			const meta = await this.metaService.fetch();

			if (!meta.enableSupporterPage || !meta.supporterNameThreshold || !meta.supporterNameWithIconThreshold) return [];

			for (const patreon of Object.values(patreons)) {
				if (patreon.amounts < meta.supporterNameThreshold || patreon.isHideFromSupporterPage) continue;
				users.push({
					username: patreon.user.username,
					name: patreon.user.name ?? patreon.user.username,
					avatarUrl: patreon.user.avatarUrl ?? this.userEntityService.getIdenticonUrl(patreon.user),
					type: meta.supporterNameWithIconThreshold <= patreon.amounts ? 'nameWithIcon' : 'name',
				});
			}

			return users;
		});
	}
}
