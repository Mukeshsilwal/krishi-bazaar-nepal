import React, { useState } from 'react';
import advisoryService from '../../advisory/services/advisoryService';
import { Plus, ShieldAlert, Bug } from 'lucide-react';

const DiseaseCMS = () => {
    const [activeTab, setActiveTab] = useState<'DISEASE' | 'PESTICIDE'>('DISEASE');
    const [diseaseData, setDiseaseData] = useState<any>({
        riskLevel: 'LOW',
        symptomsNe: '',
        symptomsEn: '',
        nameNe: '',
        nameEn: '',
        affectedCrops: []
    });
    const [pesticideData, setPesticideData] = useState<any>({
        type: 'FUNGICIDE',
        isOrganic: false
    });

    const handleCreateDisease = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await advisoryService.createDisease(diseaseData);
            alert('Disease created successfully!');
            setDiseaseData({ riskLevel: 'LOW', symptomsNe: '', symptomsEn: '', nameNe: '', nameEn: '', affectedCrops: [] });
        } catch (error) {
            alert('Failed to create disease');
        }
    };

    const handleCreatePesticide = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await advisoryService.createPesticide(pesticideData);
            alert('Pesticide created successfully!');
            setPesticideData({ type: 'FUNGICIDE', isOrganic: false });
        } catch (error) {
            alert('Failed to create pesticide');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bug className="text-red-500" />
                    Disease & Pest Management
                </h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('DISEASE')}
                        className={`px-4 py-1 rounded-md text-sm font-medium transition ${activeTab === 'DISEASE' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        Diseases
                    </button>
                    <button
                        onClick={() => setActiveTab('PESTICIDE')}
                        className={`px-4 py-1 rounded-md text-sm font-medium transition ${activeTab === 'PESTICIDE' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        Pesticides
                    </button>
                </div>
            </div>

            {activeTab === 'DISEASE' ? (
                <form onSubmit={handleCreateDisease} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name (English)</label>
                            <input className="w-full border rounded p-2" required
                                value={diseaseData.nameEn} onChange={e => setDiseaseData({ ...diseaseData, nameEn: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Name (Nepali)</label>
                            <input className="w-full border rounded p-2" required
                                value={diseaseData.nameNe} onChange={e => setDiseaseData({ ...diseaseData, nameNe: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Symptoms (English)</label>
                            <textarea className="w-full border rounded p-2 h-24" required
                                value={diseaseData.symptomsEn} onChange={e => setDiseaseData({ ...diseaseData, symptomsEn: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Symptoms (Nepali)</label>
                            <textarea className="w-full border rounded p-2 h-24" required
                                value={diseaseData.symptomsNe} onChange={e => setDiseaseData({ ...diseaseData, symptomsNe: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Risk Level</label>
                            <select className="w-full border rounded p-2"
                                value={diseaseData.riskLevel} onChange={e => setDiseaseData({ ...diseaseData, riskLevel: e.target.value })}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Affected Crops (comma separated)</label>
                            <input className="w-full border rounded p-2" placeholder="Rice, Tomato, Wheat"
                                value={diseaseData.affectedCrops.join(', ')}
                                onChange={e => setDiseaseData({ ...diseaseData, affectedCrops: e.target.value.split(',').map((c: string) => c.trim()) })} />
                        </div>
                    </div>

                    <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 flex items-center gap-2">
                        <Plus size={18} /> Add Disease
                    </button>
                </form>
            ) : (
                <form onSubmit={handleCreatePesticide} className="space-y-4 max-w-2xl border-l-4 border-yellow-400 pl-6">
                    <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 mb-4 flex items-start gap-2">
                        <ShieldAlert className="flex-shrink-0" size={20} />
                        <p>Warning: All pesticides added here will automatically carry the mandatory "Advisory Only" disclaimer when shown to farmers.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name (English)</label>
                            <input className="w-full border rounded p-2" required
                                value={pesticideData.nameEn} onChange={e => setPesticideData({ ...pesticideData, nameEn: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Name (Nepali)</label>
                            <input className="w-full border rounded p-2" required
                                value={pesticideData.nameNe} onChange={e => setPesticideData({ ...pesticideData, nameNe: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select className="w-full border rounded p-2"
                                value={pesticideData.type} onChange={e => setPesticideData({ ...pesticideData, type: e.target.value })}>
                                <option value="FUNGICIDE">Fungicide</option>
                                <option value="INSECTICIDE">Insecticide</option>
                                <option value="HERBICIDE">Herbicide</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-6">
                            <input type="checkbox" id="organic" className="mr-2"
                                checked={pesticideData.isOrganic} onChange={e => setPesticideData({ ...pesticideData, isOrganic: e.target.checked })} />
                            <label htmlFor="organic">Is Organic?</label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Safety Instructions (English)</label>
                        <textarea className="w-full border rounded p-2 h-20" required
                            value={pesticideData.safetyInstructionsEn} onChange={e => setPesticideData({ ...pesticideData, safetyInstructionsEn: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Govt Approval / License</label>
                        <input className="w-full border rounded p-2" placeholder="License No."
                            value={pesticideData.govtApprovalLicense} onChange={e => setPesticideData({ ...pesticideData, govtApprovalLicense: e.target.value })} />
                    </div>

                    <button type="submit" className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700 flex items-center gap-2">
                        <Plus size={18} /> Add Pesticide
                    </button>
                </form>
            )}
        </div>
    );
};

export default DiseaseCMS;
