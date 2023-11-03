import { Inject, Injectable } from '@nestjs/common';
import { MoreThan } from 'typeorm';
import type { UserPendingsRepository, UsersRepository } from '@/models/_.js';
import { MetaService } from '@/core/MetaService.js';
import { DI } from '@/di-symbols.js';
import { bindThis } from '@/decorators.js';
import { IdService } from '@/core/IdService.js';

@Injectable()
export class RegistrationLimitService {
	private cache = 0;
	private cacheTtl = 0;

	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userPendingsRepository)
		private userPendingsRepository: UserPendingsRepository,

		private idService: IdService,
		private metaService: MetaService,
	) {
	}

	@bindThis
	public async isAvailable(): Promise<boolean> {
		const instance = await this.metaService.fetch();
		if (!instance.enableRegistrationLimit) return true;
		if (instance.disableRegistration) return false;

		const now = Date.now();
		if (this.cacheTtl > now) {
			return instance.registrationLimit > this.cache;
		}

		let count = await this.usersRepository.countBy({
			id: MoreThan(this.idService.gen(now - (1000 * 60 * 60 * instance.registrationLimitCooldown))),
		});

		if (instance.registrationLimit > count) {
			count += await this.userPendingsRepository.countBy({
				id: MoreThan(this.idService.gen(now - (1000 * 60 * 30))),
			});
		}

		this.cache = count;
		this.cacheTtl = now + 1000 * 60 * 5;

		return instance.registrationLimit > count;
	}
}
