"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const clearAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_full_name");
    localStorage.removeItem("admin_avatar_url");
    localStorage.removeItem("admin_role");
  }
  document.cookie = "admin_token=; path=/; max-age=0";
  document.cookie = "admin_id=; path=/; max-age=0";
  document.cookie = "admin_role=; path=/; max-age=0";
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Step 1: Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error("Invalid email or password");
      if (!authData.user || !authData.session) throw new Error("Authentication failed");

      // Step 2: Verify admin with backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/adminLogin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": authData.session.access_token,
          },
          body: JSON.stringify({ user_id: authData.user.id }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        await supabase.auth.signOut();
        throw new Error(result.message || "Admin verification failed");
      }

      if (!result.success || !result.data) {
        await supabase.auth.signOut();
        throw new Error("Access denied: Admin verification failed");
      }

      // ✅ result.data is the admin object directly
      const admin = result.data;

      // Step 3: Check role and active status
      if (admin.role !== "SUPER_ADMIN") {
        await supabase.auth.signOut();
        throw new Error("Access denied: Only SUPER_ADMIN can access this panel");
      }

      if (!admin.is_active) {
        await supabase.auth.signOut();
        throw new Error("Access denied: Your account is inactive");
      }

      // Step 4: Store session
      const { access_token, expires_in } = authData.session;
      const maxAge = expires_in || 3600;

      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_id", authData.user.id);
      localStorage.setItem("admin_email", admin.email || email);
      localStorage.setItem("admin_full_name", admin.full_name || "");
      localStorage.setItem("admin_avatar_url", admin.avatar_url || "");
      localStorage.setItem("admin_role", admin.role);

      document.cookie = `admin_token=${access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `admin_id=${authData.user.id}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `admin_role=${admin.role}; path=/; max-age=${maxAge}; SameSite=Lax`;

      // Step 5: Redirect to dashboard
      router.push("/dashboard");

    } catch (err: any) {
      clearAuthData();
      if (err.message.includes("Access denied") || err.message.includes("Forbidden")) {
        setError("Access denied: You are not authorized as an admin");
      } else if (err.message.includes("Invalid email or password")) {
        setError("Invalid email or password");
      } else if (err.message.includes("SUPER_ADMIN")) {
        setError("Only SUPER_ADMIN users can access this panel");
      } else if (err.message.includes("inactive")) {
        setError("Your account is inactive. Please contact support.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0ea5e9] via-[#38bdf8] to-[#7dd3fc] flex-col items-center justify-center p-12">

        {/* decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full bg-white/10" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-white/10" />
        <div className="absolute top-[40%] right-[-40px] w-[160px] h-[160px] rounded-full bg-white/10" />

        {/* floating stat cards */}
        <div className="absolute top-16 right-16 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">Total Users</p>
              <p className="text-white text-lg font-bold">12,489</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-24 left-12 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">Resumes Created</p>
              <p className="text-white text-lg font-bold">48,210</p>
            </div>
          </div>
        </div>

        {/* center content */}
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Resume Maker</h2>
          <p className="text-white/80 text-lg max-w-sm mx-auto leading-relaxed">
            Manage users, subscriptions, resumes and analytics all in one place.
          </p>

          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-white text-2xl font-bold">99%</p>
              <p className="text-white/70 text-xs mt-1">Uptime</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-white text-2xl font-bold">50K+</p>
              <p className="text-white/70 text-xs mt-1">Resumes</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-white text-2xl font-bold">12K+</p>
              <p className="text-white/70 text-xs mt-1">Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md">

          {/* header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-[#0ea5e9] flex items-center justify-center shadow-md shadow-sky-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-[#0ea5e9] font-bold text-lg tracking-tight">Resume Admin</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to your admin dashboard</p>
          </div>

          {/* form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSignIn} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                      text-gray-900 placeholder-gray-400 text-sm bg-gray-50
                      focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
                      focus:bg-white transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200
                      text-gray-900 placeholder-gray-400 text-sm bg-gray-50
                      focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
                      focus:bg-white transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100
                  text-red-600 px-4 py-3 rounded-xl text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-3 rounded-xl
                  font-semibold text-sm tracking-wide mt-2
                  transition-all duration-200 shadow-md shadow-sky-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Secure & powered by Resume Maker Technologies
          </p>
        </div>
      </div>
    </div>
  );
}