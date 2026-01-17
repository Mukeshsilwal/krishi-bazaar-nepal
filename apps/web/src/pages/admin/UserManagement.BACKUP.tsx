import React from 'react';
import { useAdminTitle } from '@/context/AdminContext';

const UserManagement = () => {
    const { setTitle } = useAdminTitle();

    React.useEffect(() => {
        setTitle('User Management', 'प्रयोगकर्ता व्यवस्थापन');
    }, [setTitle]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <p>This is a simplified version to test if the component loads.</p>
        </div>
    );
};

export default UserManagement;
