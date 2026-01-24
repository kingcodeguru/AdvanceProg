import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ REPLACE WITH YOUR REAL PC IP
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

// --- User & Basic File Ops ---

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

// --- File Content Editing (Original Function) ---

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

// --- Role Checking (Original Function) ---

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

// --- Permissions Management (New Functions) ---

// 1. Get all users who have access to the file
export const getFilePermissions = async (fileId) => {
    try {
        const headers = await getHeaders();
        const response = await fetch(`${API_IP}/api/files/${fileId}/permissions`, {
            method: 'GET',
            headers: headers
        });
        return response;
    } catch (error) {
        console.error("API getFilePermissions Error:", error);
        throw error;
    }
};

// 2. Share file with a new user (Add Permission)
export const addPermission = async (fileId, email, role) => {
    try {
        const headers = await getHeaders();
        const response = await fetch(`${API_IP}/api/files/${fileId}/permissions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ email, role })
        });
        return response;
    } catch (error) {
        console.error("API addPermission Error:", error);
        throw error;
    }
};

// 3. Update an existing user's role
export const updatePermission = async (fileId, uid, newRole) => {
    try {
        const headers = await getHeaders();
        // Assuming REST path: /api/files/{id}/permissions/{uid}
        const response = await fetch(`${API_IP}/api/files/${fileId}/permissions/${uid}`, {
            method: 'PATCH', // Or PUT
            headers: headers,
            body: JSON.stringify({ role: newRole })
        });
        return response;
    } catch (error) {
        console.error("API updatePermission Error:", error);
        throw error;
    }
};

// 4. Remove a user (Unshare) or Leave file
export const removePermission = async (fileId, uid) => {
    try {
        const headers = await getHeaders();
        // Assuming REST path: /api/files/{id}/permissions/{uid}
        const response = await fetch(`${API_IP}/api/files/${fileId}/permissions/${uid}`, {
            method: 'DELETE',
            headers: headers
        });
        return response;
    } catch (error) {
        console.error("API removePermission Error:", error);
        throw error;
    }
};