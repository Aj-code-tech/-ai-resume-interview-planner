import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

export async function register({ username, email, password }) {
    const response = await api.post('/api/auth/register', { 
        username, email, password
    })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", {
        email, password
    })
    return response.data
}

export async function requestPasswordReset({ email }) {
    const response = await api.post("/api/auth/forgot-password", { email })
    return response.data
}

export async function resetPassword({ token, newPassword }) {
    const response = await api.post("/api/auth/reset-password", { token, newPassword })
    return response.data
}


export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        return null
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        return null
    }
}