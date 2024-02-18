export class ChangeDefaultRepositoryUrl1708219546820 {
    name = 'ChangeDefaultRepositoryUrl1708219546820'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://github.com/hideki0403/misskey.yukineko.me'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://github.com/hideki0403/misskey.yukineko.me/issues/new'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://github.com/misskey-dev/misskey/issues/new'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://github.com/misskey-dev/misskey'`);
    }
}
