import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1787211926318 implements MigrationInterface {
  name = 'InitSchema1787211926318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "genres" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_f105f8230a83b86a346427de94d" UNIQUE ("name"), CONSTRAINT "PK_80ecd718f0f00dde5d77a9be842" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "movie_genres" ("movie_id" uuid NOT NULL, "genre_id" uuid NOT NULL, CONSTRAINT "PK_ec45eae1bc95d1461ad55713ffc" PRIMARY KEY ("movie_id", "genre_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bbbc12542564f7ff56e36f5bbf" ON "movie_genres"  ("genre_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "movies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "synopsis" text, "poster_url" character varying, "duration_minutes" integer NOT NULL, "language" character varying NOT NULL, "release_date" date NOT NULL, "rating" numeric(3,1), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "chk_movies_rating_range" CHECK ("rating" IS NULL OR ("rating" >= 0.0 AND "rating" <= 10.0)), CONSTRAINT "chk_movies_duration_positive" CHECK ("duration_minutes" > 0), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_status_enum" AS ENUM('valid', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reservation_id" uuid NOT NULL, "seat_id" uuid NOT NULL, "ticket_number" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'valid', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8d7b9a157280caf57aa0282e72c" UNIQUE ("ticket_number"), CONSTRAINT "chk_tickets_price_non_negative" CHECK ("price" >= 0), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d6c0193a93baf537ffc9af525e" ON "tickets"  ("reservation_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec055dae7b2350f2acf72fcc63" ON "tickets"  ("seat_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_tickets_reservation_seat" ON "tickets"  ("reservation_id", "seat_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."halls_hall_type_enum" AS ENUM('2D', '3D', 'IMAX')`,
    );
    await queryRunner.query(
      `CREATE TABLE "halls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "hall_type" "public"."halls_hall_type_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_46711ac8c7003abe9f974263bfb" UNIQUE ("name"), CONSTRAINT "PK_4665c2f3b1e718e12b06278bae8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "seats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hall_id" uuid NOT NULL, "seat_row" character varying NOT NULL, "seat_column" integer NOT NULL, "seat_label" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "chk_seats_seat_column_positive" CHECK ("seat_column" > 0), CONSTRAINT "PK_3fbc74bb4638600c506dcb777a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9d085d571f1bca57c9ed4ec97" ON "seats"  ("hall_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_seats_hall_label" ON "seats"  ("hall_id", "seat_label") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."seat_holds_status_enum" AS ENUM('held', 'confirmed', 'released', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "seat_holds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "showtime_id" uuid NOT NULL, "seat_id" uuid NOT NULL, "user_id" uuid NOT NULL, "reservation_id" uuid, "status" "public"."seat_holds_status_enum" NOT NULL DEFAULT 'held', "held_until" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() + interval '10 minutes', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5b8bce6f92f229102b485b05f51" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0967e94ccf5281b3f00669756a" ON "seat_holds"  ("showtime_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9533c542c9f5f3a865c653add" ON "seat_holds"  ("seat_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_806831e40343dfbb8a799f22e1" ON "seat_holds"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d2e0cfbf657453c64272fea3e" ON "seat_holds"  ("reservation_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_seat_holds_held_until_held" ON "seat_holds"  ("held_until") WHERE status = 'held'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_seat_holds_showtime_status" ON "seat_holds"  ("showtime_id", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_seat_hold_active" ON "seat_holds"  ("showtime_id", "seat_id") WHERE status IN ('held', 'confirmed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."showtimes_status_enum" AS ENUM('scheduled', 'active', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "showtimes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "movie_id" uuid NOT NULL, "hall_id" uuid NOT NULL, "show_date" date NOT NULL, "show_time" TIME NOT NULL, "end_time" TIME NOT NULL, "base_price" numeric(10,2) NOT NULL, "status" "public"."showtimes_status_enum" NOT NULL DEFAULT 'scheduled', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "chk_showtimes_base_price_non_negative" CHECK ("base_price" >= 0), CONSTRAINT "PK_2d979092e692ec1a7b505893ee2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cbe689b0c116fbc866d8ea2175" ON "showtimes"  ("movie_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d90444306cb1cfdc01d9e16353" ON "showtimes"  ("hall_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1aa06480ad2bac0c8dcf541a0c" ON "showtimes"  ("show_date") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_showtimes_hall_date_time" ON "showtimes"  ("hall_id", "show_date", "show_time") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reservations_status_enum" AS ENUM('confirmed', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reservation_number" character varying NOT NULL, "user_id" uuid NOT NULL, "showtime_id" uuid NOT NULL, "status" "public"."reservations_status_enum" NOT NULL DEFAULT 'confirmed', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ec7bddfb31ba19db3c085f5bd2b" UNIQUE ("reservation_number"), CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4af5055a871c46d011345a255a" ON "reservations"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e1355b3e5e4de3590d1e11f83e" ON "reservations"  ("showtime_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_reservations_user_status" ON "reservations"  ("user_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone_number" character varying, "date_of_birth" date, "address" character varying, "avatar_url" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ddc983c5f7bcf132fd8732c3f" ON "refresh_tokens"  ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_ae967ce58ef99e9ff3933ccea48" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_bbbc12542564f7ff56e36f5bbf6" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_d6c0193a93baf537ffc9af525e7" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_ec055dae7b2350f2acf72fcc63c" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seats" ADD CONSTRAINT "FK_c9d085d571f1bca57c9ed4ec97b" FOREIGN KEY ("hall_id") REFERENCES "halls"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" ADD CONSTRAINT "FK_0967e94ccf5281b3f00669756a4" FOREIGN KEY ("showtime_id") REFERENCES "showtimes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" ADD CONSTRAINT "FK_a9533c542c9f5f3a865c653add4" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" ADD CONSTRAINT "FK_806831e40343dfbb8a799f22e1f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" ADD CONSTRAINT "FK_9d2e0cfbf657453c64272fea3e5" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" ADD CONSTRAINT "FK_cbe689b0c116fbc866d8ea21759" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" ADD CONSTRAINT "FK_d90444306cb1cfdc01d9e163537" FOREIGN KEY ("hall_id") REFERENCES "halls"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_4af5055a871c46d011345a255a6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_e1355b3e5e4de3590d1e11f83e1" FOREIGN KEY ("showtime_id") REFERENCES "showtimes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_e1355b3e5e4de3590d1e11f83e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_4af5055a871c46d011345a255a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" DROP CONSTRAINT "FK_d90444306cb1cfdc01d9e163537"`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" DROP CONSTRAINT "FK_cbe689b0c116fbc866d8ea21759"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" DROP CONSTRAINT "FK_9d2e0cfbf657453c64272fea3e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" DROP CONSTRAINT "FK_806831e40343dfbb8a799f22e1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" DROP CONSTRAINT "FK_a9533c542c9f5f3a865c653add4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" DROP CONSTRAINT "FK_0967e94ccf5281b3f00669756a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seats" DROP CONSTRAINT "FK_c9d085d571f1bca57c9ed4ec97b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_ec055dae7b2350f2acf72fcc63c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_d6c0193a93baf537ffc9af525e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_bbbc12542564f7ff56e36f5bbf6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_ae967ce58ef99e9ff3933ccea48"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3ddc983c5f7bcf132fd8732c3f"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_reservations_user_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e1355b3e5e4de3590d1e11f83e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4af5055a871c46d011345a255a"`,
    );
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TYPE "public"."reservations_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."uq_showtimes_hall_date_time"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1aa06480ad2bac0c8dcf541a0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d90444306cb1cfdc01d9e16353"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cbe689b0c116fbc866d8ea2175"`,
    );
    await queryRunner.query(`DROP TABLE "showtimes"`);
    await queryRunner.query(`DROP TYPE "public"."showtimes_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."uq_seat_hold_active"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_seat_holds_showtime_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_seat_holds_held_until_held"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9d2e0cfbf657453c64272fea3e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_806831e40343dfbb8a799f22e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a9533c542c9f5f3a865c653add"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0967e94ccf5281b3f00669756a"`,
    );
    await queryRunner.query(`DROP TABLE "seat_holds"`);
    await queryRunner.query(`DROP TYPE "public"."seat_holds_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."uq_seats_hall_label"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c9d085d571f1bca57c9ed4ec97"`,
    );
    await queryRunner.query(`DROP TABLE "seats"`);
    await queryRunner.query(`DROP TABLE "halls"`);
    await queryRunner.query(`DROP TYPE "public"."halls_hall_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."uq_tickets_reservation_seat"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec055dae7b2350f2acf72fcc63"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d6c0193a93baf537ffc9af525e"`,
    );
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
    await queryRunner.query(`DROP TABLE "movies"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bbbc12542564f7ff56e36f5bbf"`,
    );
    await queryRunner.query(`DROP TABLE "movie_genres"`);
    await queryRunner.query(`DROP TABLE "genres"`);
  }
}
