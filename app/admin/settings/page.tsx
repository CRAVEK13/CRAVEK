"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setDeliveryAvailable(data.deliveryAvailable);
          if (data.estimatedDeliveryTime) {
            // Convert to local datetime string for input type="datetime-local"
            const date = new Date(data.estimatedDeliveryTime);
            // format: YYYY-MM-DDTHH:MM
            const formatted = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setEstimatedDeliveryTime(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAvailable,
          estimatedDeliveryTime: !deliveryAvailable && estimatedDeliveryTime ? new Date(estimatedDeliveryTime).toISOString() : null,
        }),
      });

      if (res.ok) {
        setMessage("Settings saved successfully.");
        router.refresh();
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (err) {
      setMessage("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading settings...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Store Settings</h1>
      </header>

      <div style={{ background: "#161616", padding: "24px", borderRadius: "12px", border: "1px solid #2A2A2A", maxWidth: "600px" }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#F5F0EA", fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={deliveryAvailable}
                onChange={(e) => setDeliveryAvailable(e.target.checked)}
                style={{ width: "20px", height: "20px" }}
              />
              Delivery is currently available
            </label>
            <p style={{ color: "#A89F96", fontSize: "0.85rem", marginTop: "8px" }}>
              Uncheck this to disable checkout. Users will still be able to add items to their cart.
            </p>
          </div>

          {!deliveryAvailable && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#F5F0EA", marginBottom: "8px", fontWeight: "bold" }}>
                Estimated Date and Time for Delivery Availability
              </label>
              <input
                type="datetime-local"
                value={estimatedDeliveryTime}
                onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #333", background: "#000", color: "#F5F0EA" }}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{ padding: "10px 20px", background: "#FF5C1A", color: "white", border: "none", borderRadius: "6px", cursor: saving ? "not-allowed" : "pointer", fontWeight: "bold" }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          {message && (
            <p style={{ marginTop: "15px", color: message.includes("success") ? "#4ade80" : "#ef4444" }}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
