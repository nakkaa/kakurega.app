export class FeatRegistrationLimit1698996314308 {
    name = 'FeatRegistrationLimit1698996314308'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableRegistrationLimit" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "registrationLimit" integer NOT NULL DEFAULT '10'`);
				await queryRunner.query(`ALTER TABLE "meta" ADD "registrationLimitCooldown" integer NOT NULL DEFAULT '24'`);
        await queryRunner.query(`COMMENT ON COLUMN "meta"."registrationLimitCooldown" IS 'Cooldown of registration limit in hours'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`COMMENT ON COLUMN "meta"."registrationLimitCooldown" IS 'Cooldown of registration limit in hours'`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "registrationLimitCooldown"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "registrationLimit"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableRegistrationLimit"`);
    }
}
