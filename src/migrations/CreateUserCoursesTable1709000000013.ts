import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateUserCoursesTable1709000000013 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_courses (
        id              SERIAL PRIMARY KEY,
        "userId"          TEXT NOT NULL,
        "courseId"        INTEGER NOT NULL,
        "stripeSessionId" TEXT,
        "grantedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("userId")   REFERENCES users(id)   ON DELETE CASCADE,
        FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE ("userId", "courseId")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_courses`);
  }
}
