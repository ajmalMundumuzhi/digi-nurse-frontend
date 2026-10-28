
import { useState } from "react";
import { Activity, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function LoginPage() {
  const [form, setForm] = useState({
    institutionCode: "",
    staffId: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      const token = response.data.token || response.data.data?.token;

      if (!token) {
        throw new Error("The login response did not include a token.");
      }

      localStorage.setItem("nurseflow_token", token);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-slate-50 to-blue-50 p-4 sm:p-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-9">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 text-white">
            <Activity size={25} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              NurseFlow
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Clinical workspace
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in with your hospital staff credentials.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-xs text-teal-800">
          <ShieldCheck size={18} />
          <span>Secure staff sign-in</span>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-700">
              Institution code
            </span>
            <input
              name="institutionCode"
              value={form.institutionCode}
              onChange={handleChange}
              placeholder="Enter institution code"
              autoComplete="organization"
              required
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-700">
              Staff ID
            </span>
            <input
              name="staffId"
              value={form.staffId}
              onChange={handleChange}
              placeholder="Enter your staff ID"
              autoComplete="username"
              required
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-700">
              Password
            </span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
          NurseFlow hackathon prototype. Use demo credentials and fictional patient data.
        </p>
      </section>
    </main>
  );
}
