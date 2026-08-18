"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "@/app/login/login.module.css";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email and password are required.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        // Success — usually Supabase sends a confirmation email
        // Or if email confirmation is off, they might just need to log in.
        // We'll show a message or redirect to login.
        setSuccessMsg("Account created! Redirecting to login...");
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }, 2000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Join CRAVEK</h1>
          <p className={styles.sub}>Create an account to track your orders.</p>

          <form className={styles.form} onSubmit={handleRegister} noValidate>
            <div className={styles.field}>
              <label htmlFor="reg-name" className={styles.label}>Full Name</label>
              <input
                id="reg-name"
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Kamal Perera"
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="reg-email" className={styles.label}>Email</label>
              <input
                id="reg-email"
                type="email"
                className={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="reg-phone" className={styles.label}>Phone (Optional)</label>
              <input
                id="reg-phone"
                type="tel"
                className={styles.input}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="077 123 4567"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="reg-password" className={styles.label}>Password</label>
              <input
                id="reg-password"
                type="password"
                className={styles.input}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                required
              />
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}
            {successMsg && <p className={styles.error} style={{background: 'rgba(16,185,129,0.1)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)'}} role="status">{successMsg}</p>}

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.submitBtn}`}
              disabled={loading || !!successMsg}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className={styles.page}><div className={styles.loading}>Loading...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
