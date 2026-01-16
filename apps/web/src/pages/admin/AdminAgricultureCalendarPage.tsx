import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useAgricultureCalendar } from '../../features/agricultureCalendar/useAgricultureCalendar';
import { agricultureCalendarService, AgricultureCalendarEntry } from '../../services/agricultureCalendarService';
import { CROPS, NEPALI_MONTHS, ACTIVITY_TYPES } from '../../features/agricultureCalendar/constants';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const AdminAgricultureCalendarPage: React.FC = () => {
    const { entries, refresh, loading, selectedCrop, setSelectedCrop, selectedMonth, setSelectedMonth } = useAgricultureCalendar();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Partial<AgricultureCalendarEntry> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    // Initial load
    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleCreate = () => {
        setEditingEntry({
            crop: 'PADDY',
            nepaliMonth: 'BAISAKH',
            activityType: 'SOWING',
            region: 'ALL',
            advisory: '',
            active: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (entry: AgricultureCalendarEntry) => {
        setEditingEntry({ ...entry });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteDialog({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        try {
            await agricultureCalendarService.deleteEntry(deleteDialog.id);
            toast.success('सफलतापूर्वक हटाइयो');
            refresh();
        } catch (error) {
            console.error(error);
            toast.error('हटाउन समस्या भयो');
        } finally {
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingEntry?.id) {
                await agricultureCalendarService.updateEntry(editingEntry.id, editingEntry);
                toast.success('अद्यावधिक गरियो');
            } else if (editingEntry) {
                await agricultureCalendarService.createEntry(editingEntry);
                toast.success('नयाँ जानकारी थपियो');
            }
            setIsModalOpen(false);
            refresh();
        } catch (error) {
            console.error(error);
            toast.error('सेभ गर्न समस्या भयो');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">कृषि क्यालेन्डर व्यवस्थापन</h1>
                <button
                    onClick={handleCreate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <span className="text-xl">+</span> नयाँ थप्नुहोस्
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <select
                    className="border border-gray-300 rounded-md p-2 text-sm"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                >
                    <option value="">सबै बाली</option>
                    {CROPS.map(c => <option key={c.value} value={c.value}>{c.nepali} - {c.label}</option>)}
                </select>

                <select
                    className="border border-gray-300 rounded-md p-2 text-sm"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    <option value="">सबै महिना</option>
                    {NEPALI_MONTHS.map(m => <option key={m.value} value={m.value}>{m.nepali} - {m.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">बाली</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">महिना</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">क्रियाकलाप</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">सल्लाह</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">क्षेत्र</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">कार्यहरू</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">लोड हुँदैछ...</td></tr>
                        ) : entries.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">कुनै तथ्याङ्क छैन</td></tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-xl mr-2">{CROPS.find(c => c.value === entry.crop)?.icon}</span>
                                            <span className="text-sm font-medium text-gray-900">{CROPS.find(c => c.value === entry.crop)?.nepali}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {NEPALI_MONTHS.find(m => m.value === entry.nepaliMonth)?.nepali}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {ACTIVITY_TYPES.find(a => a.value === entry.activityType)?.nepali}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {entry.advisory}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {entry.region || 'ALL'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(entry)} className="text-indigo-600 hover:text-indigo-900 mr-3">सम्पादन</button>
                                        <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-900">हटाउने</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && editingEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingEntry.id ? 'सम्पादन गर्नुहोस्' : 'नयाँ थप्नुहोस्'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">बाली</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={editingEntry.crop}
                                        onChange={e => setEditingEntry({ ...editingEntry, crop: e.target.value })}
                                        required
                                    >
                                        {CROPS.map(c => <option key={c.value} value={c.value}>{c.nepali} ({c.label})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">महिना</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={editingEntry.nepaliMonth}
                                        onChange={e => setEditingEntry({ ...editingEntry, nepaliMonth: e.target.value })}
                                        required
                                    >
                                        {NEPALI_MONTHS.map(m => <option key={m.value} value={m.value}>{m.nepali} ({m.label})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">क्रियाकलाप</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={editingEntry.activityType}
                                        onChange={e => setEditingEntry({ ...editingEntry, activityType: e.target.value })}
                                        required
                                    >
                                        {ACTIVITY_TYPES.map(a => <option key={a.value} value={a.value}>{a.nepali} ({a.label})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">क्षेत्र</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={editingEntry.region || ''}
                                        onChange={e => setEditingEntry({ ...editingEntry, region: e.target.value })}
                                        placeholder="उदाहरण: तराई, पहाड, वा ALL"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">सल्लाह</label>
                                <textarea
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    rows={4}
                                    value={editingEntry.advisory}
                                    onChange={e => setEditingEntry({ ...editingEntry, advisory: e.target.value })}
                                    required
                                    placeholder="किसानका लागि सल्लाह..."
                                ></textarea>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                                    checked={editingEntry.active}
                                    onChange={e => setEditingEntry({ ...editingEntry, active: e.target.checked })}
                                />
                                <label className="ml-2 block text-sm text-gray-900">सक्रिय (Active)</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    रद्ध गर्नुहोस्
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                >
                                    {submitting ? 'कुर्दै...' : 'सेभ गर्नुहोस्'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                onConfirm={confirmDelete}
                title="जानकारी हटाउनुहोस्"
                description="के तपाई यो जानकारी हटाउन चाहनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।"
                confirmText="हटाउनुहोस्"
                cancelText="रद्द गर्नुहोस्"
                variant="destructive"
                icon={<Trash2 className="h-6 w-6 text-red-600" />}
            />
        </div>
    );
};

export default AdminAgricultureCalendarPage;
