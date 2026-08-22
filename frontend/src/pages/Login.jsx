import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen w-screen flex items-center justify-center px-4 select-none overflow-hidden transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0e0f12] text-[#e3e3e3]" : "bg-[#eef5fc] text-[#1e293b]"
      }`}
    >
      {/* Ambient Background Glows */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 ${
          theme === "dark"
            ? "bg-[radial-gradient(ellipse_at_top,_#142442_0%,_#0a101d_45%,_#0e0f12_85%)]"
            : "bg-[radial-gradient(ellipse_at_top,_#c9e2fa_0%,_#dbeefe_35%,_#eef5fc_75%,_#f8fafc_100%)]"
        }`}
      />

      <div className="w-full max-w-[420px] relative z-10">
        <div
          className={`p-8 md:p-9 rounded-3xl border backdrop-blur-2xl shadow-2xl transition-all ${
            theme === "dark"
              ? "bg-[#16181d]/90 border-[#272b35] shadow-black/60"
              : "bg-white/90 border-slate-200 shadow-slate-200/80"
          }`}
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center p-2.5 bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border border-blue-400/20 shadow-lg shadow-blue-500/10">
                <img
                  src="/VakilAI.png"
                  alt="VakilAI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back to <span className="text-blue-500 font-bold">VakilAI</span>
            </h1>
            <p
              className={`text-xs mt-1.5 ${
                theme === "dark" ? "text-[#94a3b8]" : "text-slate-500"
              }`}
            >
              Sign in to manage legal drafting, RTIs & intelligence records
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ml-1 ${
                  theme === "dark" ? "text-[#94a3b8]" : "text-slate-600"
                }`}
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail
                  size={16}
                  className={`absolute left-3.5 pointer-events-none ${
                    theme === "dark" ? "text-[#64748b]" : "text-slate-400"
                  }`}
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                    theme === "dark"
                      ? "bg-[#111317] border-[#272b35] text-white placeholder-[#64748b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ml-1 ${
                  theme === "dark" ? "text-[#94a3b8]" : "text-slate-600"
                }`}
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock
                  size={16}
                  className={`absolute left-3.5 pointer-events-none ${
                    theme === "dark" ? "text-[#64748b]" : "text-slate-400"
                  }`}
                />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                    theme === "dark"
                      ? "bg-[#111317] border-[#272b35] text-white placeholder-[#64748b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <p
            className={`mt-6 text-xs text-center ${
              theme === "dark" ? "text-[#94a3b8]" : "text-slate-500"
            }`}
          >
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-400 font-semibold ml-1 transition"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}