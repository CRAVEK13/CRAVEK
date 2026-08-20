"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Step 1: Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.user) {
        setError(`Authentication failed: ${authError?.message || "Invalid email or password."}`);
        setLoading(false);
        return;
      }

      // Step 2: Verify admin role (with 15s timeout so it can't hang forever)
      let res: Response;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        res = await fetch("/api/admin/verify", { method: "POST", signal: controller.signal });
        clearTimeout(timeoutId);
      } catch (fetchErr: any) {
        await supabase.auth.signOut();
        if (fetchErr?.name === "AbortError") {
          setError("Verification timed out. Check that DATABASE_URL is set in your Vercel environment variables.");
        } else {
          setError("Network error during verification. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        await supabase.auth.signOut();
        if (res.status === 401) {
          setError("Session error. Please refresh and try again.");
        } else if (res.status === 403) {
          setError("Access denied. Your account does not have admin privileges. Run /api/admin/setup first.");
        } else {
          setError(`Verify error ${res.status}: ${body?.error || "Unknown error"}`);
        }
        setLoading(false);
        return;
      }

      // Step 3: Set admin cookie (used by middleware) and redirect
      document.cookie = `cravek_admin=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      router.push("/admin");
    } catch (err: any) {
      setError(`Login failed: ${err?.message || "Unknown error. Please try again."}`);
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>CRAVEK</span>
          <h1 className={styles.title}>Admin Access</h1>
          <p className={styles.sub}>Sign in to manage CRAVEK</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin} noValidate>
          <div className={styles.field}>
            <label htmlFor="admin-email" className={styles.label}>Email</label>
            <input
              id="admin-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>Password</label>
            <input
              id="admin-password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={loading}
            id="admin-login-btn"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
