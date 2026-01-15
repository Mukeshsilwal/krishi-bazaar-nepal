import React from 'react';

interface AdminTableProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Standardized admin table wrapper component.
 * Provides consistent styling with horizontal scroll support across all admin tables.
 */
const AdminTable: React.FC<AdminTableProps> = ({ children, className = '' }) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
                    {children}
                </table>
            </div>
        </div>
    );
};

export default AdminTable;
