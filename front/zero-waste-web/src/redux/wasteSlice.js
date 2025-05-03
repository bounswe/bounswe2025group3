import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const loginUser = createAsyncThunk('waste/loginUser', async ({ email, password }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/token/`, { email, password });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { error: 'Login failed' });
    }
});

export const fetchWasteLogs = createAsyncThunk('waste/fetchWasteLogs', async (_, { getState, rejectWithValue }) => {
    try {
        const { user } = getState().waste;
        if (!user?.access) throw new Error('No access token');
        const response = await axios.get(`${API_BASE_URL}/api/waste-logs/`, {
            headers: { Authorization: `Bearer ${user.access}` },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { error: error.message });
    }
});

export const createWasteLog = createAsyncThunk('waste/createWasteLog', async (data, { getState, rejectWithValue }) => {
    try {
        const { user } = getState().waste;
        if (!user?.access) throw new Error('No access token');
        const response = await axios.post(
            `${API_BASE_URL}/api/waste-logs/`,
            { ...data, date_logged: new Date().toISOString().split('T')[0] },
            { headers: { Authorization: `Bearer ${user.access}` } }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { error: error.message });
    }
});

const wasteSlice = createSlice({
    name: 'waste',
    initialState: {
        user: null,
        wasteLogs: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.wasteLogs = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchWasteLogs.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchWasteLogs.fulfilled, (state, action) => {
                state.wasteLogs = action.payload;
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(fetchWasteLogs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createWasteLog.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createWasteLog.fulfilled, (state, action) => {
                state.wasteLogs.push(action.payload);
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(createWasteLog.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { logout } = wasteSlice.actions;
export default wasteSlice.reducer;