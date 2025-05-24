import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { config } from '../config/config.js';

let dbInstance = null;

async function getDatabase() {
  if (dbInstance) return dbInstance;
  try {
    console.log("Creating TypeORM DataSource...");

    // إنشاء كائن DataSource لـ TypeORM باستخدام إعدادات متغيرات البيئة
    const dataSource = new DataSource({
      type: "mysql",
      host: config.database.host,
      port: config.database.port,
      username: config.database.user,
      password: config.database.password,
      database: config.database.database,
      synchronize: false,
    });

    // تهيئة اتصال قاعدة البيانات
    await dataSource.initialize();
    console.log("DataSource initialized successfully");

    // إنشاء كائن SqlDatabase باستخدام DataSource
    dbInstance = new SqlDatabase({
      appDataSource: dataSource,
      includesTables: ["products"]
    });

    console.log("SqlDatabase instance created successfully");
    return dbInstance;
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
    throw error;
  }
}

export { getDatabase };
