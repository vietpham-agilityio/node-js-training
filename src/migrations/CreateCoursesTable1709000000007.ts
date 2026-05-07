import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateCoursesTable1709000000007 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(80) NOT NULL,
        description TEXT NOT NULL,
        price       INTEGER NOT NULL,
        "isFree"    BOOLEAN NOT NULL DEFAULT false,
        status      TEXT NOT NULL DEFAULT 'unpublished',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS courses`);
  }
}
