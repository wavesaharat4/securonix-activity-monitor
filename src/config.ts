import * as dotenv from 'dotenv';
import { ClientConfig } from 'pg';


//โหลด env
dotenv.config();

// ==========================================
//  Configuration
// ==========================================
export const dbConfig: ClientConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export const API_CONFIG = {
    baseUrl: process.env.API_BASE_URL,
    regionUrl: process.env.API_REGION_URL,
    username: process.env.API_USERNAME,
    password: process.env.API_PASSWORD,
    tenant: process.env.API_TENANT,
    subTenant: process.env.API_SUB_TENANT,
};