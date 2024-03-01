export class RepositoryUrlFromMisskeyDevToKakurega1709309785388 {
	name = 'RepositoryUrlFromMisskeyDevToKakurega1709309785388';

	async up(queryRunner) {
		await queryRunner.query(`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/hideki0403/misskey.yukineko.me' WHERE "repositoryUrl" = 'https://github.com/misskey-dev/misskey'`);
	}

	async down(queryRunner) {
		// no valid down migration
	}
}
