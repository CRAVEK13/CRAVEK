"use client";
import { useState, useEffect } from "react";
import styles from "./categories.module.css";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setEditForm({ ...category });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        fetchCategories();
      } else {
        alert("Failed to save category");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading categories...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
      </header>

      <div className={styles.categoryList}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryCard}>
            {editingId === category.id ? (
              <form onSubmit={handleSave} className={styles.editForm}>
                <div className={styles.field}>
                  <label>Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Slug (URL)</label>
                  <input
                    value={editForm.slug}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editForm.available}
                      onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })}
                    />
                    Available
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editForm.comingSoon}
                      onChange={(e) => setEditForm({ ...editForm, comingSoon: e.target.checked })}
                    />
                    Coming Soon Tag
                  </label>
                </div>
                <div className={styles.actions}>
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className={styles.catInfo}>
                  <h3 className={styles.name}>{category.name}</h3>
                  <span className={styles.slug}>/{category.slug}</span>
                  <div className={styles.badges}>
                    {category.available ? (
                      <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeInactive}`}>Hidden</span>
                    )}
                    {category.comingSoon && (
                      <span className={`${styles.badge} ${styles.badgeComingSoon}`}>Coming Soon</span>
                    )}
                  </div>
                </div>
                <button className="btn btn-outline" onClick={() => handleEdit(category)}>Edit</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
