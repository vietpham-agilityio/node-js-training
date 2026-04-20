import { DataSource } from "typeorm";

// Constant
import { NODE_ENV } from "@/constants/environments.ts";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: 'database/english-learning-platform.db',
  entities: {},
  migrations: {},
  migrationsRun: true,
  synchronize: false,
  logging: NODE_ENV === 'dev',
})
