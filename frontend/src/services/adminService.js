import api from './api';
import { ADMIN_ENDPOINTS } from '../config/endpoints';

const adminService = {
    getDashboardStats: async () => {
        const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
        return response.data.data; // Extract from ApiResponse wrapper
    },

    getPendingVendors: async () => {
        const response = await api.get(ADMIN_ENDPOINTS.VENDORS_PENDING);
        return response.data;
    },

    getUserActivities: async (params) => {
        const response = await api.get(ADMIN_ENDPOINTS.ACTIVITIES, { params });
        return response.data; // Assuming backend returns Page object directly or wrapped in ApiResponse? 
        // Backend AdminActivityController returns ResponseEntity<Page<UserActivity>>. 
        // Usually axios returns data key. If no ApiResponse wrapper, it is response.data.
        // Let's check other methods. getDashboardStats returns response.data.data. 
        // My controller returns ResponseEntity.ok(page). So it is direct JSON.
        // Wait, other controllers return ApiResponse.success(data). 
        // My AdminActivityController returns ResponseEntity.ok(userActivityService.getAllActivities(pageable));
        // It DOES NOT return ApiResponse wrapper. 
        // So response.data is the Page object.
    },

    approveUser: async (userId) => {
        await api.post(ADMIN_ENDPOINTS.APPROVE_USER(userId));
    }
};

export default adminService;
