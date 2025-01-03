import 'tsconfig-paths/register';

import "reflect-metadata";

import { AppDataSource } from '@/configs/db.config';
import createApp from '@/app';

// const app = createApp();

import log from "@/utils/logging";

let connection, server;
beforeAll(async () => {
    process.env.NODE_ENV = "test";
    connection = await AppDataSource.initialize();
    await connection.synchronize();
});

afterAll(async () => {
    await AppDataSource.destroy();
})


beforeEach(async () => {
    // Optionally clear tables before each test
    const entities = AppDataSource.entityMetadatas;
    for (const entity of entities) {
        const repository = AppDataSource.getRepository(entity.name);
        await repository.delete({});
    }
});

