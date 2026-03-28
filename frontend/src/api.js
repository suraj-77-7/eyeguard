export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export const predict = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Prediction failed');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error predicting:', error);
        throw error;
    }
};

export const getAnalysis = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/eda`);
        if (!response.ok) {
            throw new Error('Analysis fetch failed');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching analysis:', error);
        throw error;
    }
};

export const getModelComparison = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/model-comparison`);
        if (!response.ok) {
            throw new Error('Model comparison fetch failed');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching model comparison:', error);
        throw error;
    }
};

export const getRecommendations = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return await response.json();
    } catch (err) {
        throw err;
    }
};
