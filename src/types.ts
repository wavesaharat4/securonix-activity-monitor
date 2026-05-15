 export interface StatisticItem {
    data_source: string;
    ingester: string;
    events_count: number;
    avg_eps?: number;
    events_size?: number;
}

// สร้าง Interface สำหรับ Response หลัก
export interface SecuronixResponse {
    total_events_count: number;
    series: any[];
    filters: any;
    statistics: StatisticItem[];
}

export interface MetricsResult {
    responseData: SecuronixResponse;
    recordDate: string;
}