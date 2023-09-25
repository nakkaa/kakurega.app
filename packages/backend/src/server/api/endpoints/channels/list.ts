import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { ChannelsRepository } from '@/models/_.js';
import { ChannelEntityService } from '@/core/entities/ChannelEntityService.js';
import { DI } from '@/di-symbols.js';
import { sqlLikeEscape } from '@/misc/sql-like-escape.js';

export const meta = {
	tags: ['channels'],

	requireCredential: false,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'Channel',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		offset: { type: 'integer', default: 0 },
		search: { type: 'string', nullable: true },
		excludeNonActiveChannels: { type: 'boolean', nullable: true },
		includeDescription: { type: 'boolean', nullable: true },
		sort: { type: 'string', nullable: true, enum: ['+lastNotedAt', '-lastNotedAt', '+name', '-name', '+notesCount', '-notesCount', '+usersCount', '-usersCount'] },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		private channelEntityService: ChannelEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.channelsRepository.createQueryBuilder('channel').andWhere('channel.isArchived = FALSE');

			switch (ps.sort) {
				case '+lastNotedAt': query.orderBy('channel.lastNotedAt', 'DESC', 'NULLS LAST'); break;
				case '-lastNotedAt': query.orderBy('channel.lastNotedAt', 'ASC', 'NULLS FIRST'); break;
				case '+name': query.orderBy('channel.name', 'DESC'); break;
				case '-name': query.orderBy('channel.name', 'ASC'); break;
				case '+notesCount': query.orderBy('channel.notesCount', 'DESC'); break;
				case '-notesCount': query.orderBy('channel.notesCount', 'ASC'); break;
				case '+usersCount': query.orderBy('channel.usersCount', 'DESC'); break;
				case '-usersCount': query.orderBy('channel.usersCount', 'ASC'); break;
			}

			if (ps.search) {
				query.andWhere('channel.name like :name', { name: '%' + sqlLikeEscape(ps.search) + '%' });

				if (ps.includeDescription) {
					query.orWhere('channel.description like :description', { description: '%' + sqlLikeEscape(ps.search) + '%' });
				}
			}

			if (ps.excludeNonActiveChannels) {
				query.andWhere('channel.lastNotedAt IS NOT NULL');
			}

			const channels = await query.take(ps.limit).skip(ps.offset).getMany();

			return await Promise.all(channels.map(x => this.channelEntityService.pack(x, me)));
		});
	}
}
