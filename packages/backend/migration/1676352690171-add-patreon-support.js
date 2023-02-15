export class addPatreonSupport1676352690171 {
    name = 'addPatreonSupport1676352690171'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "enablePatreonIntegration" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "patreonClientId" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "patreonClientSecret" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "patreonAccessToken" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "patreonRefreshToken" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "integrations" jsonb NOT NULL DEFAULT '{}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "integrations"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "patreonRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "patreonAccessToken"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "patreonClientSecret"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "patreonClientId"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enablePatreonIntegration"`);
    }
}
