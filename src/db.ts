import { Client } from 'pg';
import { dbConfig } from './config';
import { StatisticItem } from './types';

export async function saveToDb(statisticsData: StatisticItem[], recortDate: string): Promise<void> {
    // ป้องกันกรณีไม่มีข้อมูลส่งมา
    if (!statisticsData || statisticsData.length === 0) {
        console.log('⚠️ ไม่พบข้อมูล Statistics สำหรับบันทึก');
        return;
    }

    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log('🔗 เชื่อมต่อฐานข้อมูลสำเร็จ');

       const insertQuery = `
            INSERT INTO securonix_statistics (data_source, ingester, events_count, record_date)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (data_source, ingester, record_date) DO NOTHING
            
        `;

       let insertedCount = 0;
        let skippedCount = 0;

        for (const item of statisticsData) {
            const values = [
                item.data_source,
                item.ingester,
                item.events_count,
                recortDate
            ];
            
            const result = await client.query(insertQuery, values);
            
            // ถ้า INSERT สำเร็จ (ไม่ใช่ข้อมูลซ้ำ) PostgreSQL จะคืนค่า rowCount = 1
            if (result.rowCount === 1) {
                insertedCount++;
            } else {
                // ถ้าข้อมูลซ้ำ มันจะ DO NOTHING ทำให้ rowCount = 0
                skippedCount++;
            }
        }

        console.log(`✅ สรุปการทำงานสำหรับวันที่ ${recortDate}:`);
        console.log(`   - บันทึกข้อมูลใหม่: ${insertedCount} รายการ`);
        console.log(`   - ข้ามข้อมูลที่ซ้ำกัน: ${skippedCount} รายการ`);

    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ เกิดข้อผิดพลาดในการบันทึกฐานข้อมูล:', error.message);
        }
    } finally {
        await client.end();
    }
}