export class HideFromSupporterPage1688196846496 {
    name = 'HideFromSupporterPage1688196846496'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "hideFromSupporterPage" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "hideFromSupporterPage"`);
    }
}
