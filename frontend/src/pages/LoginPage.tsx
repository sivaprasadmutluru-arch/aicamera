import { useState } from "react";
import type { FormEvent, ReactNode, SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import loginCameraAnimated from "../assets/login-camera-animated.png";
import loginCityNetworkBg from "../assets/login-city-network-bg-v3.png";

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.75h16v10.5H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.75 7.5 7.25 5.25L19.25 7.5" />
    </svg>
  );
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.25h10v8.5H7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.25V8a3 3 0 0 1 6 0v2.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v1.75" />
    </svg>
  );
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12s3.25-5.25 8.5-5.25S20.5 12 20.5 12 17.25 17.25 12 17.25 3.5 12 3.5 12Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
    </svg>
  );
}

function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 4 16 16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.98A8.79 8.79 0 0 0 3.5 12s3.25 5.25 8.5 5.25c1.48 0 2.78-.42 3.88-1.02M10.7 6.88c.42-.08.86-.13 1.3-.13 5.25 0 8.5 5.25 8.5 5.25a13.64 13.64 0 0 1-2.2 2.56" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.65 10.65a2.25 2.25 0 0 0 2.7 2.7" />
    </svg>
  );
}

function VideoCameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="3.5" y="7.5" width="13.5" height="13" rx="1.6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m17 11.2 7.5-3.7v13L17 16.8" />
      <path fill="currentColor" stroke="none" d="m9.8 11.1 4.2 2.9-4.2 2.9z" />
    </svg>
  );
}

function AiChipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.55} {...props}>
      <rect x="7" y="7" width="14" height="14" rx="2" />
      <path strokeLinecap="round" d="M10.5 3.5v3M14 3.5v3M17.5 3.5v3M10.5 21.5v3M14 21.5v3M17.5 21.5v3M3.5 10.5h3M3.5 14h3M3.5 17.5h3M21.5 10.5h3M21.5 14h3M21.5 17.5h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m10.2 17.2 2.1-6.4 2.1 6.4M11 15h2.6M16.5 10.8v6.4" />
    </svg>
  );
}

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.7} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.4 23 7v6.6c0 5.5-3.7 9.3-9 11-5.3-1.7-9-5.5-9-11V7l9-3.6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.8 14.3 2.6 2.7 5.9-6.2" />
    </svg>
  );
}

function BarReportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="5" y="4" width="18" height="20" rx="1.8" />
      <path strokeLinecap="round" d="M9.5 20v-5M14 20V9M18.5 20v-8" />
    </svg>
  );
}

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11.01 11.01 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function FeatureIcon({ icon }: { icon: ReactNode }) {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10 text-primary-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_24px_rgba(37,99,235,0.42)] backdrop-blur-md">
      {icon}
    </div>
  );
}

function BackgroundArtwork() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src={loginCityNetworkBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_29%_22%,rgba(37,99,235,0.08),transparent_28%),linear-gradient(90deg,rgba(2,7,20,0.18)_0%,rgba(2,7,20,0.02)_48%,rgba(2,7,20,0.24)_100%)]" />
    </div>
  );
}

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    }
  }

  function handleSocialSignIn(provider: "google" | "microsoft") {
    window.location.assign(authApi.socialLoginUrl(provider));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06142c] text-ink-800">
      <main className="relative flex min-h-screen w-full flex-col overflow-hidden lg:flex-row">
        <BackgroundArtwork />
        <section className="relative z-10 hidden min-h-screen flex-1 overflow-hidden p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black italic tracking-tight text-primary-300 drop-shadow-[0_0_18px_rgba(59,130,246,0.55)]">a</span>
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-[0_8px_26px_rgba(0,0,0,0.35)]">VIDEO ANALYTICS</span>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-100/75">
              Enterprise Surveillance Dashboard
            </p>
          </div>

          <div className="relative z-10 mt-12 max-w-sm">
            <h1 className="text-[2.35rem] font-black uppercase leading-[1.06] tracking-normal text-white drop-shadow-[0_16px_35px_rgba(0,0,0,0.45)]">
              <span className="text-primary-300">AI</span> Powered
              <br />
              Video Analytics
              <br />
              Platform
            </h1>
            <div className="mt-5 h-px w-48 bg-gradient-to-r from-primary-400 via-live-400 to-transparent shadow-[0_0_18px_rgba(0,174,239,0.7)]" />
            <p className="mt-5 text-sm leading-6 text-primary-50/85">
              Intelligent Video Management & Analytics integrated with Dahua VMS for a smarter and
              safer world.
            </p>
          </div>

          <div className="relative z-10 mt-9 grid max-w-md grid-cols-4 gap-5 text-[11px] font-semibold text-primary-50/90">
            <div className="flex flex-col items-center gap-2 text-center">
              <FeatureIcon icon={<VideoCameraIcon className="h-7 w-7" />} />
              <span>Live Monitoring</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <FeatureIcon icon={<AiChipIcon className="h-7 w-7" />} />
              <span>AI Analytics</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <FeatureIcon icon={<ShieldCheckIcon className="h-7 w-7" />} />
              <span>Smart Alerts</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <FeatureIcon icon={<BarReportIcon className="h-7 w-7" />} />
              <span>Advanced Reports</span>
            </div>
          </div>

          <div className="absolute -right-14 top-8 z-10 h-72 w-72 xl:-right-8 xl:h-80 xl:w-80">
            <div className="absolute inset-8 rounded-full bg-primary-500/20 blur-3xl" />
            <img
              src={loginCameraAnimated}
              alt=""
              className="relative h-full w-full object-contain drop-shadow-[0_28px_42px_rgba(0,0,0,0.42)]"
            />
          </div>

          <div className="relative z-10 mt-auto max-w-sm rounded-xl border border-primary-200/18 bg-[#12284a]/62 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex gap-3">
              <ShieldCheckIcon className="mt-1 h-9 w-9 shrink-0 text-primary-200" />
              <div>
                <p className="text-sm font-bold text-white">Enterprise Grade Security</p>
                <p className="mt-1 text-xs leading-5 text-primary-50/80">
                  Your data is protected with advanced security and role-based access control.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-transparent px-4 py-8 sm:px-8 lg:px-6 xl:px-6">
          <div className="pointer-events-none absolute inset-y-0 -left-28 w-80 bg-gradient-to-r from-transparent via-[#0d2b5d]/28 to-white/18 blur-2xl" />
          <div className="pointer-events-none absolute inset-y-10 left-0 w-56 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="relative w-full max-w-[740px]">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black italic tracking-tight text-primary-500">a</span>
                <span className="text-2xl font-black tracking-tight text-ink-900">VIDEO ANALYTICS</span>
              </div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">
                Enterprise Surveillance Dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[1.4rem] border border-white/70 bg-white/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_32px_80px_rgba(2,7,20,0.34)] backdrop-blur-2xl sm:p-8 lg:flex lg:min-h-[calc(100vh-5rem)] lg:flex-col lg:justify-center lg:px-16 lg:py-12 xl:px-20">
              <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full border border-primary-100/80 bg-white/70 shadow-[0_0_0_15px_rgba(37,99,235,0.04),0_18px_50px_rgba(37,99,235,0.12)] backdrop-blur-xl">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-50/95 text-primary-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <LockIcon className="h-8 w-8" />
                </div>
              </div>

              <div className="mb-6 text-center">
                <h2 className="text-[1.7rem] font-black tracking-normal text-ink-900">Welcome Back</h2>
                <p className="mt-2 text-sm font-medium text-ink-500">Sign in to access your dashboard</p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <label className="relative block">
                <span className="sr-only">Username or Email</span>
                <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-ink-200/80 bg-white/78 px-12 text-sm font-medium text-ink-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  placeholder="Username or Email"
                  autoFocus
                />
              </label>

              <label className="relative mt-4 block">
                <span className="sr-only">Password</span>
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-ink-200/80 bg-white/78 px-12 pr-12 text-sm font-medium text-ink-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-ink-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </label>

              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-ink-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-ink-300 text-primary-600 accent-primary-600"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="font-semibold text-primary-700 hover:text-primary-800"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 h-12 w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(37,99,235,0.32)] transition hover:from-primary-500 hover:to-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
                <span className="h-px flex-1 bg-ink-200" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-ink-200" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn("google")}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200/80 bg-white/72 text-sm font-bold text-ink-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition hover:bg-white"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn("microsoft")}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200/80 bg-white/72 text-sm font-bold text-ink-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition hover:bg-white"
                >
                  <span className="grid grid-cols-2 gap-0.5">
                    <span className="h-2.5 w-2.5 bg-[#f25022]" />
                    <span className="h-2.5 w-2.5 bg-[#7fba00]" />
                    <span className="h-2.5 w-2.5 bg-[#00a4ef]" />
                    <span className="h-2.5 w-2.5 bg-[#ffb900]" />
                  </span>
                  Microsoft
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-ink-500">
                Don't have an account?{" "}
                <button type="button" className="font-semibold text-primary-700 hover:text-primary-800">
                  Contact Administrator
                </button>
              </p>
            </form>
          </div>
        </section>
      </main>

      <p className="pointer-events-none absolute bottom-4 left-1/4 hidden -translate-x-1/2 text-center text-xs text-white/55 lg:block">
        © 2024 AI Video Analytics Dashboard. All rights reserved.
      </p>
    </div>
  );
}
