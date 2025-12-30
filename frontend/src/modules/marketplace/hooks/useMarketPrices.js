import { useState, useEffect } from 'react';
import marketPriceService from '../services/marketPriceService';

export const useMarketPrices = (cropName = null, district = null) => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPrices = async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (cropName && district) {
                data = await marketPriceService.getPrices(cropName, district);
            } else {
                data = await marketPriceService.getTodaysPrices();
            }
            setPrices(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch market prices');
            console.error('Error fetching market prices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, [cropName, district]);

    return { prices, loading, error, refetch: fetchPrices };
};

export const useAvailableCrops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCrops = async () => {
            setLoading(true);
            try {
                const data = await marketPriceService.getAvailableCrops();
                setCrops(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCrops();
    }, []);

    return { crops, loading, error };
};

export const useAvailableDistricts = () => {
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDistricts = async () => {
            setLoading(true);
            try {
                const data = await marketPriceService.getAvailableDistricts();
                setDistricts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDistricts();
    }, []);

    return { districts, loading, error };
};
