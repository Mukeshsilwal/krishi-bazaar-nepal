import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Users, ShoppingBag, DollarSign, CheckCircle, BookOpen, Bug, BarChart } from 'lucide-react';
import KnowledgeCMS from '../modules/knowledge/pages/KnowledgeCMS';
import DiseaseCMS from '../modules/advisory/pages/DiseaseCMS';
import { Line } from 'react-chartjs-2';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [pendingVendors, setPendingVendors] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const dashboardStats = await adminService.getDashboardStats();
            setStats(dashboardStats);
            const vendors = await adminService.getPendingVendors();
            setPendingVendors(vendors);
        } catch (error) {
            console.error("Error loading admin dashboard", error);
        }
    };

    const approveVendor = async (userId: string) => {
        try {
            await adminService.approveUser(userId);
            setPendingVendors(pendingVendors.filter((v: any) => v.id !== userId));
        } catch (error) {
            console.error("Error approving vendor", error);
        }
    };

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue (NPR)',
                data: [12000, 19000, 3000, 5000, 2000, 30000],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
            },
        ],
    };

    const [activeTab, setActiveTab] = useState('DASHBOARD');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

                    <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border">
                        <button
                            onClick={() => setActiveTab('DASHBOARD')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'DASHBOARD' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <BarChart size={18} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('KNOWLEDGE')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'KNOWLEDGE' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <BookOpen size={18} /> Knowledge Base
                        </button>
                        <button
                            onClick={() => setActiveTab('ADVISORY')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'ADVISORY' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Bug size={18} /> Disease Advisory
                        </button>
                    </div>
                </div>

                {activeTab === 'DASHBOARD' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Users</p>
                                        <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
                                    </div>
                                    <Users className="text-blue-500 h-8 w-8" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Active Listings</p>
                                        <h3 className="text-2xl font-bold">{stats?.activeListings || 0}</h3>
                                    </div>
                                    <ShoppingBag className="text-green-500 h-8 w-8" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Revenue</p>
                                        <h3 className="text-2xl font-bold">Rs. {stats?.revenue?.toLocaleString() || 0}</h3>
                                    </div>
                                    <DollarSign className="text-yellow-500 h-8 w-8" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue Chart */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Revenue Trends</h3>
                                <Line data={chartData} />
                            </div>

                            {/* Pending Approvals */}
                            <div className="bg-white p-6 rounded-lg shadow-sm container">
                                <h3 className="text-lg font-bold mb-4">Pending Vendor Approvals</h3>
                                {pendingVendors.length === 0 ? (
                                    <p className="text-gray-500">No pending approvals.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingVendors.map((vendor: any) => (
                                            <div key={vendor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{vendor.name}</p>
                                                    <p className="text-sm text-gray-500">{vendor.email}</p>
                                                    <p className="text-xs text-gray-400">Mobile: {vendor.mobileNumber}</p>
                                                </div>
                                                <button
                                                    onClick={() => approveVendor(vendor.id)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'KNOWLEDGE' && <KnowledgeCMS />}
                {activeTab === 'ADVISORY' && <DiseaseCMS />}
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
