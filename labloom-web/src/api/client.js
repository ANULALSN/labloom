const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
    constructor() {
        this.base = API_BASE;
    }

    getToken() {
        return localStorage.getItem('labloom_token');
    }

    setToken(token) {
        localStorage.setItem('labloom_token', token);
    }

    clearToken() {
        localStorage.removeItem('labloom_token');
        localStorage.removeItem('labloom_user');
    }

    async request(method, path, body, skipAuth = false) {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token && !skipAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const res = await fetch(`${this.base}${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await res.json();

            if (!res.ok) {
                throw { status: res.status, message: data.message || 'Something went wrong', data };
            }

            return data;
        } catch (err) {
            if (err.status) throw err;
            throw { status: 0, message: 'Network error — is the backend running?' };
        }
    }

    get(path) { return this.request('GET', path); }
    post(path, body, skipAuth) { return this.request('POST', path, body, skipAuth); }
    put(path, body) { return this.request('PUT', path, body); }
    patch(path, body) { return this.request('PATCH', path, body); }
    del(path) { return this.request('DELETE', path); }
}

const api = new ApiClient();
export default api;
