export class FeatFanboxIntegration1701012699337 {
    name = 'FeatFanboxIntegration1701012699337'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableFanboxIntegration" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "fanboxApiBackendUrl" character varying(128)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "fanboxApiBackendUrl"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableFanboxIntegration"`);
    }
}
