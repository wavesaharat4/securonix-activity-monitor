import axios from 'axios';
import cron from 'node-cron';;
import { getWsToken, getOAuthToken, getMetricsData } from './api';
import { saveToDb } from './db';

async function main() {
    try {
        console.log('1. กำลังดึง WS Token...');
        const wsToken = await getWsToken();
        //console.log("Token คือ", wsToken); // Debug log


        console.log('2. กำลังขอ OAuth Bearer Token...');
        const bearerToken = await getOAuthToken(wsToken);
        //console.log("Bearer Token คือ", bearerToken); // Debug log

        console.log('3. กำลังดึงข้อมูล Metrics...');
        const result = await getMetricsData(bearerToken);
        const data = result.responseData;
        const dateStr = result.recordDate;
        console.log(`🔍 พบข้อมูล Statistics จำนวน: ${data.statistics?.length || 0} รายการ`);

        console.log('4. กำลังบันทึกข้อมูลลง PostgreSQL...');
        // ส่งเฉพาะ Array statistics เข้าไปที่ฟังก์ชัน saveToDb
        //await saveToDb(data.statistics, dateStr);

        console.log('ทำงานเสร็จสมบูรณ์!');
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            console.error(`❌ API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error instanceof Error) {
            console.error('❌ System Error:', error.message);
        } else {
            console.error('❌ Unknown Error:', error);
        }
    }
}

// 
cron.schedule('*/1 * * * *', async () => {
    console.log('⏰ เริ่มต้นการดึงข้อมูล');
    await main();
});

console.log(`ระบบเริ่มทำงานแล้วเวลา: ${new Date().toLocaleString()}`);