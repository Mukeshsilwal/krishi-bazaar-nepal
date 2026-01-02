import React, { useState, useEffect } from 'react';
import financeService from '../services/financeService';
import { useAuth } from '../modules/auth/context/AuthContext';
import { Landmark, Shield, Coins, ExternalLink, Calendar } from 'lucide-react';

const FinanceDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('loans');
    const [loans, setLoans] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [subsidies, setSubsidies] = useState([]);

    useEffect(() => {
        if (user) {
            loadUserFinance();
        }
        loadSubsidies();
    }, [user]);

    const loadUserFinance = async () => {
        try {
            const loanData = await financeService.getLoans(user.id);
            const policyData = await financeService.getInsurancePolicies(user.id);
            setLoans(loanData);
            setPolicies(policyData);
        } catch (error) {
            console.error("Error loading finance data", error);
        }
    };

    const loadSubsidies = async () => {
        try {
            const data = await financeService.getSubsidies();
            setSubsidies(data);
        } catch (error) {
            console.error("Error loading subsidies", error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <Landmark className="w-8 h-8 text-green-600" />
                    Finance & Insurance
                </h1>

                <div className="flex gap-4 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`pb-4 px-4 font-medium transition ${activeTab === 'loans' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                    >
                        Agricultural Loans
                    </button>
                    <button
                        onClick={() => setActiveTab('insurance')}
                        className={`pb-4 px-4 font-medium transition ${activeTab === 'insurance' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                    >
                        Crop Insurance
                    </button>
                    <button
                        onClick={() => setActiveTab('subsidies')}
                        className={`pb-4 px-4 font-medium transition ${activeTab === 'subsidies' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                    >
                        Govt. Subsidies
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Content Area */}
                    <div className="md:col-span-2">
                        {activeTab === 'loans' && (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                                    <h3 className="text-xl font-bold mb-4">Apply for a New Loan</h3>
                                    <p className="text-gray-600 mb-4">Get low-interest agricultural loans from our partner banks.</p>
                                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                                        Check Eligibility
                                    </button>
                                </div>

                                <h3 className="font-bold text-gray-900 mt-8">Your Loans</h3>
                                {loans.length === 0 ? <p className="text-gray-500 italic">No active loans.</p> : (
                                    loans.map((loan: any) => (
                                        <div key={loan.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{loan.purpose}</p>
                                                <p className="text-sm text-gray-500">Rs. {loan.amount} • {loan.provider}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">{loan.status}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'insurance' && (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
                                    <h3 className="text-xl font-bold mb-4">Protect Your Crops</h3>
                                    <p className="text-gray-600 mb-4">Insurance against weather damage, pests, and yield loss.</p>
                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                        Get Quote
                                    </button>
                                </div>

                                <h3 className="font-bold text-gray-900 mt-8">Your Policies</h3>
                                {policies.length === 0 ? <p className="text-gray-500 italic">No active policies.</p> : (
                                    policies.map((policy: any) => (
                                        <div key={policy.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{policy.cropName} Insurance</p>
                                                <p className="text-sm text-gray-500">Cover: Rs. {policy.coverageAmount}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{policy.status}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'subsidies' && (
                            <div className="space-y-6">
                                {subsidies.map((subsidy: any) => (
                                    <div key={subsidy.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-bold text-green-600 uppercase tracking-wide">{subsidy.govtBody}</span>
                                                <h3 className="text-lg font-bold mt-1">{subsidy.title}</h3>
                                                <p className="text-gray-600 mt-2 text-sm">{subsidy.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl text-green-700">Rs. {subsidy.amount}</p>
                                                <p className="text-xs text-red-500 mt-1">Deadline: {new Date(subsidy.deadline).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button className="mt-4 w-full border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition flex items-center justify-center gap-2">
                                            View Details <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg">
                            <p className="text-green-100 mb-1">Total Loan Approved</p>
                            <h2 className="text-3xl font-bold">Rs. {loans.reduce((acc, curr: any) => acc + (curr.status === 'APPROVED' ? curr.amount : 0), 0)}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Financial Health</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Credit Score</span>
                                    <span className="font-semibold text-green-600">Good (720)</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Active Policies</span>
                                    <span className="font-semibold">{policies.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
