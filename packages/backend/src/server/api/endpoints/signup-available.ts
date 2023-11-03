import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { RegistrationLimitService } from '@/core/RegistrationLimitService.js';

export const meta = {
	tags: ['meta'],

	requireCredential: false,

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			available: {
				type: 'boolean',
				optional: false, nullable: false,
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private registrationLimitService: RegistrationLimitService,
	) {
		super(meta, paramDef, async (ps, me) => {
			return {
				available: await this.registrationLimitService.isAvailable(),
			};
		});
	}
}
