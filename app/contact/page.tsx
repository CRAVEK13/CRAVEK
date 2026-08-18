"use client";
import { useState } from "react";
import type { Metadata } from "next";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const validate = () => {
    const e: Partial<typeof formData> = {};
    if (!formData.name.trim()) e.name = "Please enter your name.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) e.email = "Please enter a valid email.";
    if (!formData.message.trim() || formData.message.trim().length < 10) e.message = "Please enter a message (min 10 characters).";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    {
      icon: "✉️",
      label: "Email",
      value: "hello.cravek@gmail.com",
      href: "mailto:hello.cravek@gmail.com",
    },
    {
      icon: "📞",
      label: "Phone",
      value: "[Coming soon]",
      href: undefined,
    },
    {
      icon: "🕐",
      label: "Hours",
      value: "[To be confirmed]",
      href: undefined,
    },
    {
      icon: "🚚",
      label: "Delivery",
      value: "Delivery only — Coming to you",
      href: undefined,
    },
  ];

  return (
    <>
      {/* Page Hero */}
      <section className={styles.pageHero} aria-label="Contact CRAVEK">
        <div className="container">
          <div className={styles.heroContent}>
            <p className="section-label">Get In Touch</p>
            <h1 className={styles.pageTitle}>Contact CRAVEK</h1>
            <p className={styles.pageSub}>
              Questions, feedback, or just craving something? We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className={styles.contactSection} aria-label="Contact details and form">
        <div className="container">
          <div className={styles.contactGrid}>

            {/* Info */}
            <div className={styles.infoCol}>
              <h2 className={styles.infoTitle}>Find us</h2>
              <div className={styles.infoList}>
                {contactItems.map((item) => (
                  <div key={item.label} className={styles.infoItem}>
                    <span className={styles.infoIcon} aria-hidden="true">{item.icon}</span>
                    <div>
                      <p className={styles.infoLabel}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className={styles.infoValue}>{item.value}</a>
                      ) : (
                        <p className={styles.infoValue}>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.socialSection}>
                <h3 className={styles.socialTitle}>Follow the Crave</h3>
                <div className={styles.socialLinks}>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                    className={`btn btn-ghost btn-sm ${styles.socialBtn}`}
                    aria-label="Follow CRAVEK on Instagram">
                    Instagram
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                    className={`btn btn-ghost btn-sm ${styles.socialBtn}`}
                    aria-label="Follow CRAVEK on Facebook">
                    Facebook
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                    className={`btn btn-ghost btn-sm ${styles.socialBtn}`}
                    aria-label="Follow CRAVEK on TikTok">
                    TikTok
                  </a>
                </div>
              </div>

              <div className={styles.orderBox}>
                <p className={styles.orderBoxText}>Ready to order?</p>
                <a href="#order" className="btn btn-primary" id="contact-order-btn">
                  Order Now
                </a>
              </div>
            </div>

            {/* Form */}
            <div className={styles.formCol}>
              <h2 className={styles.formTitle}>Send a message</h2>
              {submitted ? (
                <div className={styles.successMessage} role="alert">
                  <span className={styles.successIcon} aria-hidden="true">✓</span>
                  <h3 className={styles.successTitle}>Message sent!</h3>
                  <p className={styles.successText}>
                    Thanks for reaching out. We&apos;ll get back to you at{" "}
                    <strong>{formData.email}</strong> soon.
                  </p>
                </div>
              ) : (
                <form
                  className={styles.form}
                  onSubmit={handleSubmit}
                  noValidate
                  aria-label="Contact form"
                >
                  <div className={styles.formField}>
                    <label htmlFor="contact-name" className={styles.label}>Your Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                      placeholder="e.g. Kasun Perera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      autoComplete="name"
                    />
                    {errors.name && (
                      <p id="name-error" className={styles.errorMsg} role="alert">{errors.name}</p>
                    )}
                  </div>

                  <div className={styles.formField}>
                    <label htmlFor="contact-email" className={styles.label}>Email Address</label>
                    <input
                      id="contact-email"
                      type="email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p id="email-error" className={styles.errorMsg} role="alert">{errors.email}</p>
                    )}
                  </div>

                  <div className={styles.formField}>
                    <label htmlFor="contact-message" className={styles.label}>Message</label>
                    <textarea
                      id="contact-message"
                      className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                      placeholder="What's on your mind?"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className={styles.errorMsg} role="alert">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
                    id="contact-submit-btn"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? "Sending…" : "Send Message"}
                  </button>

                  {apiError && (
                    <p className={styles.errorMsg} role="alert" style={{ textAlign: "center" }}>
                      {apiError}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
