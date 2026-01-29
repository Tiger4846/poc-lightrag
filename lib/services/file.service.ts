import axios from "axios";

// Helper to get token
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
        }
    };
};

export const fileService = {
    // Get all files
    getAllFiles: async () => {
        const response = await axios.get('/api/files', getAuthHeaders());
        return response.data;
    },

    // Upload files
    uploadFile: async (formData: FormData) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await axios.post('/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        return response.data;
    },

    // Create folder
    createFolder: async (name: string, parentId: string | null) => {
        const response = await axios.post('/api/folder', {
            name,
            parentId,
        }, {
            ...getAuthHeaders(),
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Update file (rename, move, soft delete, recommend)
    updateFile: async (id: string, data: any) => {
        const response = await axios.put(`/api/files/${id}`, data, getAuthHeaders());
        return response.data;
    },

    // Delete file permanently
    deleteFilePermanently: async (id: string) => {
        const response = await axios.delete(`/api/files/${id}`, getAuthHeaders());
        return response.data;
    },

    // Get file preview URL
    getFilePreviewUrl: async (id: string) => {
        const response = await axios.get(`/api/files/${id}/view`, {
            ...getAuthHeaders(),
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    }
};
