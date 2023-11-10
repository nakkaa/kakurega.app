export class FeatAgeLimitRestriction1699632953140 {
    name = 'FeatAgeLimitRestriction1699632953140'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableAgeRestriction" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "ageRestrictionThreshold" integer NOT NULL DEFAULT '20'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "ageRestrictionThreshold"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableAgeRestriction"`);
    }
}
