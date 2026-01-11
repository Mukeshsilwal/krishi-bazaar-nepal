import api from './api';

export const getColdStorages = async () => {
    const response = await api.get('/logistics/cold-storages');
    return response.data;
};
