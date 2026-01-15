import React from 'react';

interface TableHeaderProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Standardized table header cell for admin tables.
 * Applies consistent styling with whitespace-nowrap to prevent text wrapping.
 */
const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
    return (
        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${className}`}>
            {children}
        </th>
    );
};

export default TableHeader;
