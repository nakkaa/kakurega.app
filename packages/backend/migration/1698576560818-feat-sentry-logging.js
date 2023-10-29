export class FeatSentryLogging1698576560818 {
    name = 'FeatSentryLogging1698576560818'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableSentryLogging" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "sentryDsn" character varying(1024)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "sentryDsn"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableSentryLogging"`);
    }
}
