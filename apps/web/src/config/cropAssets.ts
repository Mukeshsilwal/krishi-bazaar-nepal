
export const cropAssets: Record<string, string> = {
    // Vegetables
    'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
    'golbheda': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
    'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60',
    'alu': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60',
    'onion': 'https://images.unsplash.com/photo-1508747703725-7197b91dac80?w=500&auto=format&fit=crop&q=60',
    'pyaj': 'https://images.unsplash.com/photo-1508747703725-7197b91dac80?w=500&auto=format&fit=crop&q=60',
    'cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=60',
    'kauli': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=60',
    'cabbage': 'https://images.unsplash.com/photo-1551068832-75d3de6ca681?w=500&auto=format&fit=crop&q=60',
    'banda': 'https://images.unsplash.com/photo-1551068832-75d3de6ca681?w=500&auto=format&fit=crop&q=60',
    'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60',
    'gajar': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60',
    'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60',
    'saag': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60',
    'radish': 'https://images.unsplash.com/photo-1595123550441-d377e017de6a?w=500&auto=format&fit=crop&q=60',
    'mula': 'https://images.unsplash.com/photo-1595123550441-d377e017de6a?w=500&auto=format&fit=crop&q=60',
    'pumpkin': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=500&auto=format&fit=crop&q=60',
    'farsi': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=500&auto=format&fit=crop&q=60',

    // Fruits
    'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60',
    'syau': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60',
    'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60',
    'kera': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60',
    'orange': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=60',
    'suntala': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=60',

    // Grains
    'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
    'chamal': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
    'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60',
    'gahu': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60',
    'maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&auto=format&fit=crop&q=60',
    'makai': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&auto=format&fit=crop&q=60',

    // Fallback
    'default': 'https://images.unsplash.com/photo-1595855709915-f65b907afa0a?w=500&auto=format&fit=crop&q=60'
};

export const getCropImage = (cropName: string): string => {
    if (!cropName) return cropAssets['default'];

    // Normalize string: lowercase, remove special chars
    const normalized = cropName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Direct match
    if (cropAssets[normalized]) return cropAssets[normalized];

    // Partial match (e.g. "red tomato" -> "tomato")
    for (const key of Object.keys(cropAssets)) {
        if (normalized.includes(key) && key !== 'default') {
            return cropAssets[key];
        }
    }

    return cropAssets['default'];
};
