"use client";
import { useState, useEffect } from "react";
import styles from "./products.module.css";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  
  // Image upload
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/categories")
    ]);
    const prodData = await prodRes.json();
    const catData = await catRes.json();
    setProducts(prodData);
    setCategories(catData);
    setLoading(false);
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/products/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        fetchData();
      } else {
        alert("Failed to save");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (productId: string, file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`/api/admin/products/${productId}/image`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchData(); // Reload to get new image URL
      } else {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading menu...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Menu Management</h1>
      </header>

      <div className={styles.productList}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            {editingId === product.id ? (
              <form onSubmit={handleSave} className={styles.editForm}>
                <div className={styles.field}>
                  <label>Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Tagline</label>
                  <input
                    value={editForm.tagline}
                    onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Category</label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <h4 className={styles.subhead}>Portions & Prices</h4>
                {editForm.portions.map((p: any, idx: number) => (
                  <div key={p.id || idx} className={styles.portionRow}>
                    <input
                      placeholder="Label"
                      value={p.label}
                      onChange={(e) => {
                        const newP = [...editForm.portions];
                        newP[idx].label = e.target.value;
                        setEditForm({ ...editForm, portions: newP });
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Price (LKR)"
                      value={p.price}
                      onChange={(e) => {
                        const newP = [...editForm.portions];
                        newP[idx].price = parseInt(e.target.value);
                        setEditForm({ ...editForm, portions: newP });
                      }}
                    />
                  </div>
                ))}
                
                <div className={styles.actions}>
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className={styles.productImageWrapper}>
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className={styles.image} unoptimized />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                  <label className={styles.imageUploadBtn}>
                    {uploading ? "..." : "📷"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(product.id, e.target.files[0]);
                      }}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.topRow}>
                    <h3 className={styles.name}>{product.name}</h3>
                    <span className={styles.category}>{product.category.name}</span>
                  </div>
                  <p className={styles.tagline}>{product.tagline}</p>
                  
                  <div className={styles.portions}>
                    {product.portions.map((p: any) => (
                      <span key={p.id} className={styles.portionBadge}>
                        {p.label}: Rs.{p.price}
                      </span>
                    ))}
                  </div>
                  
                  <div className={styles.actions}>
                    <button className="btn btn-outline" onClick={() => handleEdit(product)}>Edit Details</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
