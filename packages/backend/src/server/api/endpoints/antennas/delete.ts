import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { AntennasRepository } from '@/models/index.js';
import { RoleService } from '@/core/RoleService.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['antennas'],

	requireCredential: true,

	kind: 'write:account',

	errors: {
		noSuchAntenna: {
			message: 'No such antenna.',
			code: 'NO_SUCH_ANTENNA',
			id: 'b34dcf9d-348f-44bb-99d0-6c9314cfe2df',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		antennaId: { type: 'string', format: 'misskey:id' },
	},
	required: ['antennaId'],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,

		private roleService: RoleService,
		private globalEventService: GlobalEventService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const myRoles = await this.roleService.getUserRoles(me.id);
			const antenna = await this.antennasRepository.findOneBy({
				id: ps.antennaId,
				userId: myRoles.some(x => x.isAdministrator) ? undefined : me.id,
			});

			if (antenna == null) {
				throw new ApiError(meta.errors.noSuchAntenna);
			}

			await this.antennasRepository.delete(antenna.id);

			this.globalEventService.publishInternalEvent('antennaDeleted', antenna);
		});
	}
}
