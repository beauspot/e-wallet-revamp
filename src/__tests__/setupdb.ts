// import createApp from "@/app";
import { AppDataSource } from "@/configs/db.config";
// const app = createApp();

// import log from "@/utils/logging";
import "reflect-metadata";
import "tsconfig-paths/register";

let connection;
// let server;
beforeAll(async () => {
  process.env.NODE_ENV = "test";
  connection = await AppDataSource.initialize();
  await connection.dropDatabase();
  await connection.synchronize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  // Optionally clear tables before each test
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.delete({});
  }
});
