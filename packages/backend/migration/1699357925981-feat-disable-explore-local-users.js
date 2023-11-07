export class FeatDisableExploreLocalUsers1699357925981 {
    name = 'FeatDisableExploreLocalUsers1699357925981'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "disableExploreLocalUsers" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableExploreLocalUsers"`);
    }
}
