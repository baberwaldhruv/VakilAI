import api from "./api";

// Authentication & Profile Services
export const authService = {
  register: (name, email, password) =>
    api.post("/api/auth/register", { name, email, password }),

  login: async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    if (res?.data?.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getProfile: () => api.get("/api/users/profile"),
};

// RTI Services
export const rtiService = {
  createCase: () => api.post("/api/rti/cases"),
  listCases: () => api.get("/api/rti/cases"),
  getCase: (sessionId) => api.get(`/api/rti/cases/${sessionId}`),
  getMessages: (sessionId) => api.get(`/api/rti/cases/${sessionId}/messages`),
  sendMessage: (sessionId, message) =>
    api.post(`/api/rti/cases/${sessionId}/chat`, { message }),
  generateDraft: (sessionId) =>
    api.post(`/api/rti/cases/${sessionId}/draft`),
  // ADD THESE:
  deleteCase: (sessionId) => api.delete(`/api/rti/cases/${sessionId}`),
  clearAllCases: () => api.delete("/api/rti/cases"),
};

// Placeholder Services
export const extraServices = {
  analyzeRights: (payload) => api.post("/api/rights/analyze", payload),
  checkSchemeEligibility: (payload) =>
    api.post("/api/schemes/eligibility", payload),
  fillForm: (payload) => api.post("/api/forms/fill", payload),
};