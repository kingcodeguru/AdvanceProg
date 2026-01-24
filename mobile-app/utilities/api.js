import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ REPLACE WITH YOUR REAL PC IP (Run 'ipconfig')
const API_IP = 'http://192.168.1.XX:8080';

const getToken = async () => {
    try {
        return await AsyncStorage.getItem('userToken');
    } catch (e) {
        console.error("Failed to get token", e);
        return null;
    }
};

const getHeaders = async () => {
    const token = await getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getMyDetails = async () => {
    try {
        const headers = await getHeaders();
        const response = await fetch(`${API_IP}/api/users/me`, {
            method: 'GET',
            headers: headers
        });
        return response;
    } catch (error) {
        console.error("API getMyDetails Error:", error);
        throw error;
    }
};

export const getFileById = async (fileId) => {
    try {
        const headers = await getHeaders();
        const response = await fetch(`${API_IP}/api/files/${encodeURIComponent(fileId)}`, {
            method: 'GET',
            headers: headers
        });
        return response;
    } catch (error) {
        console.error("API getFileById Error:", error);
        throw error;
    }
};

export const patchFile = async (fileId, content) => {
    try {
        const headers = await getHeaders();
        const response = await fetch(`${API_IP}/api/files/${encodeURIComponent(fileId)}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({ content: content })
        });
        return response;
    } catch (error) {
        console.error("API patchFile Error:", error);
        throw error;
    }
};

export const getRole = async (fileId) => {
    try {
        const headers = await getHeaders();
        
        // 1. Get all permissions for this file
        const permResponse = await fetch(`${API_IP}/api/files/${fileId}/permissions`, {
            method: 'GET',
            headers: headers
        });
        
        if (!permResponse.ok) return null;
        
        const permissions = await permResponse.json();

        // 2. Get my own details to find my UID
        const meResponse = await getMyDetails();
        if (!meResponse.ok) return null;
        
        const meData = await meResponse.json();
        const myUid = meData.uid;

        // 3. Find my specific role in the permissions list
        const myPermission = permissions.find(p => p.uid === myUid);
        
        // Return the role (or null if not found)
        return myPermission ? myPermission.role : null;

    } catch (error) {
        console.error("API getRole Error:", error);
        return null;
    }
};