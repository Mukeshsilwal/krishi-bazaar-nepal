import api from './api';
import { ADVISORY_LOG_ENDPOINTS } from '../config/endpoints';

export interface AdvisoryLogFilter {
    advisoryType?: string;
    severity?: string;
    ruleId?: string;
    district?: string;
    deliveryStatus?: string;
    startDate?: string;
    endDate?: string;
    cursor?: string;
    limit?: number;
}

export interface AdvisoryLogResponse {
    id: string;
    farmerId: string;
    farmerName?: string;
    ruleId?: string;
    ruleName?: string;
    advisoryType: string;
    severity: string;
    district?: string;
    cropType?: string;
    deliveryStatus: string;
    channel?: string;
    createdAt: string;
    deliveredAt?: string;
    openedAt?: string;
    feedback?: string;
}

export interface AdvisoryLogDetail {
    id: string;
    farmerId: string;
    farmerName?: string;
    farmerPhone?: string;
    advisoryId?: string;
    ruleId?: string;
    ruleName?: string;
    advisoryType: string;
    severity: string;
    advisoryContent?: string;
    weatherSignal?: string;
    diseaseCode?: string;
    pestCode?: string;
    district?: string;
    cropType?: string;
    growthStage?: string;
    season?: string;
    riskLevel?: string;
    temperature?: number;
    rainfall?: number;
    humidity?: number;
    deliveryStatus: string;
    channel?: string;
    priority?: number;
    failureReason?: string;
    createdAt: string;
    deliveredAt?: string;
    openedAt?: string;
    feedbackAt?: string;
    feedback?: string;
    feedbackComment?: string;
}

export interface CursorPageResponse<T> {
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
    limit: number;
    totalCount?: number;
}

export interface AdvisoryAnalytics {
    totalAdvisories: number;
    deliverySuccessRate: number;
    openRate: number;
    feedbackRate: number;
    channelPerformance: Record<string, ChannelMetrics>;
    ruleEffectiveness: Record<string, RuleMetrics>;
    feedbackDistribution: Record<string, number>;
    districtInsights: Record<string, DistrictMetrics>;
}

export interface ChannelMetrics {
    totalSent: number;
    delivered: number;
    opened: number;
    successRate: number;
}

export interface RuleMetrics {
    ruleName: string;
    triggerCount: number;
    openCount: number;
    openRate: number;
    usefulFeedback: number;
    notUsefulFeedback: number;
    feedbackRatio: number;
}

export interface DistrictMetrics {
    district: string;
    advisoryCount: number;
    emergencyCount: number;
    deliveryFailureRate: number;
}

const advisoryLogService = {
    /**
     * Get advisory logs with filters (Admin)
     */
    async getAdvisoryLogs(filter: AdvisoryLogFilter): Promise<CursorPageResponse<AdvisoryLogResponse>> {
        const params = new URLSearchParams();

        if (filter.advisoryType) params.append('advisoryType', filter.advisoryType);
        if (filter.severity) params.append('severity', filter.severity);
        if (filter.ruleId) params.append('ruleId', filter.ruleId);
        if (filter.district) params.append('district', filter.district);
        if (filter.deliveryStatus) params.append('deliveryStatus', filter.deliveryStatus);
        if (filter.startDate) params.append('startDate', filter.startDate);
        if (filter.endDate) params.append('endDate', filter.endDate);
        if (filter.cursor) params.append('cursor', filter.cursor);
        if (filter.limit) params.append('limit', filter.limit.toString());

        const response = await api.get(`${ADVISORY_LOG_ENDPOINTS.BASE}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get advisory log detail (Admin)
     */
    async getAdvisoryLogDetail(id: string): Promise<AdvisoryLogDetail> {
        const response = await api.get(ADVISORY_LOG_ENDPOINTS.BY_ID(id));
        return response.data.data;
    },

    /**
     * Get analytics (Admin)
     */
    async getAnalytics(since?: string): Promise<AdvisoryAnalytics> {
        const params = since ? `?since=${since}` : '';
        const response = await api.get(`${ADVISORY_LOG_ENDPOINTS.ANALYTICS}${params}`);
        return response.data.data;
    },

    /**
     * Get farmer advisory history (Farmer)
     */
    async getFarmerAdvisoryHistory(farmerId: string): Promise<AdvisoryLogResponse[]> {
        const response = await api.get(ADVISORY_LOG_ENDPOINTS.BY_FARMER(farmerId));
        return response.data.data;
    },

    /**
     * Mark advisory as opened (Farmer)
     */
    async markAsOpened(logId: string): Promise<void> {
        await api.post(ADVISORY_LOG_ENDPOINTS.OPENED(logId));
    },

    /**
     * Submit feedback (Farmer)
     */
    async submitFeedback(logId: string, feedback: string, comment?: string): Promise<void> {
        await api.post(ADVISORY_LOG_ENDPOINTS.FEEDBACK, {
            logId,
            feedback,
            comment
        });
    },

    /**
     * Get alert fatigue detection (Admin)
     */
    async getAlertFatigue(since?: string, threshold: number = 10): Promise<Record<string, number>> {
        const params = new URLSearchParams();
        if (since) params.append('since', since);
        params.append('threshold', threshold.toString());

        const response = await api.get(`${ADVISORY_LOG_ENDPOINTS.ALERT_FATIGUE}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get high-risk districts (Admin)
     */
    async getHighRiskDistricts(since?: string): Promise<string[]> {
        const params = since ? `?since=${since}` : '';
        const response = await api.get(`${ADVISORY_LOG_ENDPOINTS.HIGH_RISK_DISTRICTS}${params}`);
        return response.data.data;
    },

    /**
     * Get top performing rules (Admin)
     */
    async getTopPerformingRules(since?: string, limit: number = 10): Promise<string[]> {
        const params = new URLSearchParams();
        if (since) params.append('since', since);
        params.append('limit', limit.toString());

        const response = await api.get(`${ADVISORY_LOG_ENDPOINTS.TOP_RULES}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get underperforming rules (Admin)
     */
    async getUnderperformingRules(since?: string, limit: number = 10): Promise<string[]> {
        const params = new URLSearchParams();
        if (since) params.append('since', since);
        params.append('limit', limit.toString());

        const response = await api.get(`${ADVISORY_LOG_ENDPOINTS.UNDERPERFORMING_RULES}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get farmer engagement score (Admin)
     */
    async getFarmerEngagementScore(since?: string): Promise<number> {
        const params = since ? `?since=${since}` : '';
        const response = await api.get(`${ADVISORY_LOG_ENDPOINTS.ENGAGEMENT_SCORE}${params}`);
        return response.data.data;
    }
};

export default advisoryLogService;
