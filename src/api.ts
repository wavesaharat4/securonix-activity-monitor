import axios from 'axios';
import { API_CONFIG } from './config';
import { MetricsResult } from './types';

export async function getWsToken(): Promise<string> {
    const url = `https://${API_CONFIG.baseUrl}/ws/token/generate`;
    const headers = {
        'username': API_CONFIG.username || '',
        'password': API_CONFIG.password || '',
        'validity': '365'
    };

    const response = await axios.get(url, { headers });
    return response.data.trim();
}

export async function getOAuthToken(wsToken: string): Promise<string> {
    const url = `https://${API_CONFIG.regionUrl}/shared/snypr-service-gateway/api/v2/oauth/token`;
    const headers = {
        'wstoken': wsToken,
        //'x-transaction-id': crypto.randomUUID()
    };

    const response = await axios.post(url, null, { headers });

    // ดึงค่า accessToken จาก JSON response
    const token = response.data.accessToken;

    if (!token) {
        throw new Error("ไม่พบ accessToken ในการตอบกลับจาก API");
    }

    return token;
}
export async function getMetricsData(bearerToken: string): Promise<MetricsResult> {
    const url = `https://${API_CONFIG.regionUrl}/shared/snypr-service-gateway/api/v2/ce-metrics-service/resource-groups/tenant/v1/metrics`;

    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    // 1. จัดรูปแบบวันที่เป็น YYYYMMDD
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`; // จะได้รูปแบบ 20260513
    

    // สร้าง Object วันที่ของเมื่อวาน เวลา 00:00:00.000
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 7, 0, 0, 0);
    
    // สร้าง Object วันที่ของเมื่อวาน เวลา 23:59:59.999
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 59, 59, 999);

    const startTime = startOfYesterday.getTime(); // ได้ค่าเป็น Milliseconds
    const endTime = endOfYesterday.getTime();

    const headers = {
        //'accept': '*/*',
        //'accept-language': 'en-US,en;q=0.9',
        'aggregation': 'HOURLY',
        // ใช้ Bearer Token ที่ได้จากขั้นตอนที่ 2 มาใส่แทนที่ Token เดิมใน curl
        'authorization': `Bearer ${bearerToken}`,

        // Header พิเศษที่มีค่าว่าง
        //'datasources': '',
        //'ingesters': '',

        'end-time': endTime,
        'start-time': startTime,
        //'limit': '5',
        //'order': 'TOP',
        //'origin': 'https://portal.securonix.net',
        //'priority': 'u=1, i',
        //'referer': 'https://portal.securonix.net/',

        // Browser & Sec-Fetch Headers เพื่อให้ Gateway มองว่าเป็นเบราว์เซอร์
        //'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
        //'sec-ch-ua-mobile': '?0',
        //'sec-ch-ua-platform': '"Windows"',
        //'sec-fetch-dest': 'empty',
        //'sec-fetch-mode': 'cors',
        //'sec-fetch-site': 'same-site',

        // Tenant Info
        'sub-tenant': 'INET',
        'tenant': 'a3t7achi',

        //'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',

        // Securonix Specific Headers
        //'x-snx-module': 'Vm0weE5GbFdiRmRYYmxKV1YwZG9VMWxyVm5kVmJGcHlWV3RLVUZWVU1Eaz0=',
        //'x-subscriber-token': 'Vm0weE5GbFhSWGROVldSV1YwZG9WVmx0ZEhkVU1WcHlWMjVrVjJKR2JETlpWVlpQVm14S2MxTnNaRmRpUjJoMlZrZDRTMk14WkhOWGJGcFhUVEZHTTFac1kzaFNNRFZ6VjJ4V1UySkdXbGhXYlhSM1VsWmFjMVp0UmxSTlZYQjZWa2MxUzFsV1NuTlhiRkphWVRGd00xVXdXbUZUUjFKSFYyMTRVMkpJUWpaV01uUmhZekZhZEZOcldrOVdiV2hYV1d0YWQxbFdjRmhsUjBaWFRWaENSbFZYZUdGVWJGcFhWMVJDVjFaRmJ6Qldha1pyWTJzeFNXTkdTbWxTVkZadlZtMXdUMVV4U1hoalJtUlRWa2Q0VWxaV1VYZFBVVDA5',

        // ใช้ UUID ใหม่แทนค่าคงที่ หรือจะใช้ค่าเดิมไปก่อนเพื่อทดสอบก็ได้ (แนะนำให้ใช้ uuid ใหม่)
        'x-transaction-id': '0ca7d735197d88'
    };


    const response = await axios.get(url, { headers });
    return {
        responseData: response.data,
        recordDate: dateStr
    };
}