import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateCoursesTable1709000000007 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title       TEXT    NOT NULL,
        description TEXT    NOT NULL,
        price       REAL    NOT NULL,
        isFree      INTEGER NOT NULL DEFAULT 0,
        status      TEXT    NOT NULL DEFAULT 'unpublished',
        createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS courses`);
  }
}
