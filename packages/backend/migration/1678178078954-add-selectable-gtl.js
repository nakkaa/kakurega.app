export class addSelectableGtl1678178078954 {
    name = 'addSelectableGtl1678178078954'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "enableGTL" boolean`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "enableGTL"`);
    }
}
