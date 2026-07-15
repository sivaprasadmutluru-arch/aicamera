import { useState } from "react";
import type { FormEvent, SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import loginCityNetworkBg from "../assets/login-city-network-bg.png";

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.75h16v10.5H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.75 7.5 7.25 5.25L19.25 7.5" />
    </svg>
  );
}

function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0 6-6m-6 6 6 6" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06142c] text-ink-800">
      <img
        src={loginCityNetworkBg}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[48%_50%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_34%_20%,rgba(37,99,235,0.12),transparent_30%),linear-gradient(90deg,rgba(2,7,20,0.12)_0%,rgba(2,7,20,0.08)_50%,rgba(2,7,20,0.28)_100%)]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[520px] rounded-[1.4rem] border border-white/70 bg-white/90 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_32px_80px_rgba(2,7,20,0.34)] backdrop-blur-2xl sm:p-10"
        >
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition hover:text-primary-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to sign in
          </button>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-primary-100/80 bg-white/70 shadow-[0_0_0_14px_rgba(37,99,235,0.04),0_18px_50px_rgba(37,99,235,0.12)] backdrop-blur-xl">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-50/95 text-primary-600">
                <MailIcon className="h-7 w-7" />
              </div>
            </div>
            <h1 className="text-[1.7rem] font-black tracking-normal text-ink-900">Forgot Password?</h1>
            <p className="mt-2 text-sm font-medium leading-6 text-ink-500">
              Enter your email and we will send password reset instructions if the account exists.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {sent && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              Reset instructions have been sent to {email}.
            </div>
          )}

          <label className="relative block">
            <span className="sr-only">Email address</span>
            <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-ink-200/80 bg-white/78 px-12 text-sm font-medium text-ink-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
              placeholder="Email address"
              autoFocus
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(37,99,235,0.32)] transition hover:from-primary-500 hover:to-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </main>
    </div>
  );
}
