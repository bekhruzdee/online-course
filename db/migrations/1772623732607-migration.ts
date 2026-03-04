import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772623732607 implements MigrationInterface {
    name = 'Migration1772623732607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "PK_9b9a8d455cac672d262d7275730"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "course_id"`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "course_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "UQ_647c6bda9ead37b702421710fde"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP COLUMN "course_id"`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD "course_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "UQ_647c6bda9ead37b702421710fde" UNIQUE ("user_id", "course_id")`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "UQ_647c6bda9ead37b702421710fde"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP COLUMN "course_id"`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD "course_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "UQ_647c6bda9ead37b702421710fde" UNIQUE ("user_id", "course_id")`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "course_id"`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "course_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "PK_9b9a8d455cac672d262d7275730"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
