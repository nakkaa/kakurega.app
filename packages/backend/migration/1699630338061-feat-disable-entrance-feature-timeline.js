export class FeatDisableEntranceFeatureTimeline1699630338061 {
    name = 'FeatDisableEntranceFeatureTimeline1699630338061'

    async up(queryRunner) {
				await queryRunner.query(`ALTER TABLE "meta" ADD "disableEntranceFeatureTimeline" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
				await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableEntranceFeatureTimeline"`);
    }
}
