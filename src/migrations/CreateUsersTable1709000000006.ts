import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateUsersTable1709000000006 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id        TEXT     PRIMARY KEY NOT NULL,
        email     TEXT     NOT NULL UNIQUE,
        firstName TEXT,
        lastName  TEXT,
        role      TEXT     NOT NULL DEFAULT 'user',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
