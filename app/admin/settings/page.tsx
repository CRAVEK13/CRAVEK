"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../page.module.css";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<Date | null>(null);
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
            setEstimatedDeliveryTime(new Date(data.estimatedDeliveryTime));
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
          estimatedDeliveryTime:
            !deliveryAvailable && estimatedDeliveryTime
              ? estimatedDeliveryTime.toISOString()
              : null,
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

      <div
        style={{
          background: "#161616",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #2A2A2A",
          maxWidth: "600px",
        }}
      >
        <style>{`
          .react-datepicker-wrapper {
            width: 100%;
          }
          .react-datepicker__input-container input {
            width: 100%;
            padding: 10px 14px;
            border-radius: 6px;
            border: 1px solid #333;
            background: #000;
            color: #F5F0EA;
            font-size: 0.95rem;
            box-sizing: border-box;
            cursor: pointer;
            outline: none;
            transition: border-color 0.2s;
          }
          .react-datepicker__input-container input:focus {
            border-color: #FF5C1A;
          }
          .react-datepicker {
            background: #1a1a1a !important;
            border: 1px solid #333 !important;
            border-radius: 10px !important;
            font-family: inherit !important;
            color: #F5F0EA !important;
          }
          .react-datepicker__header {
            background: #111 !important;
            border-bottom: 1px solid #2A2A2A !important;
            border-radius: 10px 10px 0 0 !important;
          }
          .react-datepicker__current-month,
          .react-datepicker-time__header,
          .react-datepicker__day-name {
            color: #F5F0EA !important;
          }
          .react-datepicker__day {
            color: #C8BEB5 !important;
            border-radius: 50% !important;
          }
          .react-datepicker__day:hover {
            background: #FF5C1A !important;
            color: #fff !important;
          }
          .react-datepicker__day--selected,
          .react-datepicker__day--keyboard-selected {
            background: #FF5C1A !important;
            color: #fff !important;
          }
          .react-datepicker__day--disabled {
            color: #444 !important;
          }
          .react-datepicker__navigation-icon::before {
            border-color: #A89F96 !important;
          }
          .react-datepicker__time-container {
            border-left: 1px solid #2A2A2A !important;
          }
          .react-datepicker__time-container .react-datepicker__time {
            background: #1a1a1a !important;
          }
          .react-datepicker__time-container
            .react-datepicker__time
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item {
            color: #C8BEB5 !important;
          }
          .react-datepicker__time-container
            .react-datepicker__time
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item:hover {
            background: #FF5C1A !important;
            color: #fff !important;
          }
          .react-datepicker__time-container
            .react-datepicker__time
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item--selected {
            background: #FF5C1A !important;
            color: #fff !important;
          }
          .react-datepicker__triangle {
            display: none !important;
          }
        `}</style>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                color: "#F5F0EA",
                fontWeight: "bold",
              }}
            >
              <input
                type="checkbox"
                checked={deliveryAvailable}
                onChange={(e) => setDeliveryAvailable(e.target.checked)}
                style={{ width: "20px", height: "20px" }}
              />
              Delivery is currently available
            </label>
            <p
              style={{
                color: "#A89F96",
                fontSize: "0.85rem",
                marginTop: "8px",
              }}
            >
              Uncheck this to disable checkout. Users will still be able to add
              items to their cart.
            </p>
          </div>

          {!deliveryAvailable && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#F5F0EA",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Estimated Date and Time for Delivery Availability
              </label>
              <DatePicker
                selected={estimatedDeliveryTime}
                onChange={(date) => setEstimatedDeliveryTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select date & time"
                minDate={new Date()}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 20px",
              background: "#FF5C1A",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          {message && (
            <p
              style={{
                marginTop: "15px",
                color: message.includes("success") ? "#4ade80" : "#ef4444",
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
