"use client";
import { useState, useEffect } from "react";
import styles from "./contact.module.css";

export default function AdminContactPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/contact`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: !currentStatus }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading messages...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Messages</h1>
      </header>

      <div className={styles.messageList}>
        {messages.length === 0 ? (
          <p className={styles.empty}>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`${styles.messageCard} ${!msg.read ? styles.unread : ""}`}>
              <div className={styles.msgHeader}>
                <div className={styles.msgInfo}>
                  <h3 className={styles.name}>{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className={styles.email}>{msg.email}</a>
                </div>
                <div className={styles.msgMeta}>
                  <span className={styles.date}>
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    className={`btn ${msg.read ? "btn-outline" : "btn-primary"} ${styles.readBtn}`}
                    onClick={() => toggleReadStatus(msg.id, msg.read)}
                  >
                    {msg.read ? "Mark Unread" : "Mark Read"}
                  </button>
                </div>
              </div>
              <div className={styles.msgBody}>
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
