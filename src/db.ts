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
        `;

        let insertedCount = 0;

        // วนลูปเฉพาะข้อมูลใน array "statistics"
        for (const item of statisticsData) {
            const values = [
                item.data_source,
                item.ingester,
                item.events_count,
                recortDate
            ];

            await client.query(insertQuery, values);
            insertedCount++;
        }

        console.log(`✅ บันทึกข้อมูลสำเร็จจำนวน ${insertedCount} รายการ`);

    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ เกิดข้อผิดพลาดในการบันทึกฐานข้อมูล:', error.message);
        }
    } finally {
        await client.end();
    }
}