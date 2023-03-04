export class addSupporterPage1677833866884 {
    name = 'addSupporterPage1677833866884'

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "enableSupporterPage" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "supporterRoles" character varying(256) array NOT NULL DEFAULT '{}'`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "supporterNameThreshold" integer`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "supporterNameWithIconThreshold" integer`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "supporterNameWithIconThreshold"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "supporterNameThreshold"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "supporterRoles"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableSupporterPage"`);
	}
}
