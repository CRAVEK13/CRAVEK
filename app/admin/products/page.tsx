"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./products.module.css";
import Image from "next/image";

const SPICE_LEVELS = [1, 2, 3, 4, 5];

const emptyForm = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  categoryId: "",
  spiceLevel: 3,
  available: true,
  featured: false,
  sortOrder: 0,
  portions: [{ label: "", weight: "", price: "" }],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/categories"),
    ]);
    setProducts(await prodRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, categoryId: categories[0]?.id || "" });
    setEditingProduct(null);
    setModal("add");
  };

  const openEdit = (product: any) => {
    setForm({ ...product, portions: product.portions.map((p: any) => ({ ...p })) });
    setEditingProduct(product);
    setModal("edit");
  };

  const closeModal = () => { setModal(null); setEditingProduct(null); };

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setForm((f: any) => ({ ...f, name: val, slug: modal === "add" ? slug : f.slug }));
  };

  const addPortion = () =>
    setForm((f: any) => ({ ...f, portions: [...f.portions, { label: "", weight: "", price: "" }] }));

  const removePortion = (idx: number) =>
    setForm((f: any) => ({ ...f, portions: f.portions.filter((_: any, i: number) => i !== idx) }));

  const updatePortion = (idx: number, key: string, val: string) =>
    setForm((f: any) => {
      const p = [...f.portions];
      p[idx] = { ...p[idx], [key]: val };
      return { ...f, portions: p };
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        spiceLevel: Number(form.spiceLevel),
        sortOrder: Number(form.sortOrder),
        portions: form.portions.map((p: any) => ({ ...p, price: Number(p.price) })),
      };
      const res = modal === "add"
        ? await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/admin/products/${editingProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { showToast(modal === "add" ? "Product created!" : "Product updated!"); closeModal(); fetchData(); }
      else { const d = await res.json(); showToast(d.error || "Save failed", "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) { showToast("Product deleted"); fetchData(); }
      else showToast("Delete failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setDeletingId(null); }
  };

  const handleImageUpload = async (productId: string, file: File) => {
    setUploading(productId);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`/api/admin/products/${productId}/image`, { method: "POST", body: formData });
      if (res.ok) { showToast("Image updated!"); fetchData(); }
      else { const d = await res.json(); showToast(d.error || "Upload failed", "error"); }
    } catch { showToast("Upload failed", "error"); }
    finally { setUploading(null); }
  };

  const toggleAvailable = async (product: any) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, available: !product.available }),
      });
      if (res.ok) fetchData();
      else showToast("Failed to toggle availability", "error");
    } catch { showToast("Network error", "error"); }
  };

  if (loading) return <div className={styles.loading}>Loading menu...</div>;

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Menu Management</h1>
          <p className={styles.subtitle}>{products.length} item{products.length !== 1 ? "s" : ""} in menu</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-product-btn">+ Add Item</button>
      </header>

      <div className={styles.productList}>
        {products.length === 0 && (
          <div className={styles.empty}>
            <p>No menu items yet.</p>
            <button className="btn btn-primary" onClick={openAdd}>Add your first item</button>
          </div>
        )}
        {products.map((product) => (
          <div key={product.id} className={`${styles.productCard} ${!product.available ? styles.unavailable : ""}`}>
            <div className={styles.productImageWrapper}>
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className={styles.image} unoptimized />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
              <label className={styles.imageUploadBtn} title="Upload image">
                {uploading === product.id ? "..." : "📷"}
                <input
                  type="file" accept="image/jpeg,image/png,image/webp" hidden
                  ref={(el) => { fileRefs.current[product.id] = el; }}
                  onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(product.id, e.target.files[0]); }}
                  disabled={uploading !== null}
                />
              </label>
            </div>

            <div className={styles.productInfo}>
              <div className={styles.topRow}>
                <div>
                  <h3 className={styles.name}>{product.name}</h3>
                  <span className={styles.category}>{product.category?.name}</span>
                </div>
                <div className={styles.badges}>
                  <span title={`Spice level ${product.spiceLevel}`}>{"🌶️".repeat(product.spiceLevel)}</span>
                  {product.featured && <span className={styles.featuredBadge}>⭐ Featured</span>}
                </div>
              </div>
              <p className={styles.tagline}>{product.tagline}</p>
              {product.description && <p className={styles.description}>{product.description}</p>}
              <div className={styles.portions}>
                {product.portions.map((p: any) => (
                  <span key={p.id} className={styles.portionBadge}>
                    {p.label}{p.weight ? ` (${p.weight})` : ""}: <strong>Rs.{p.price.toLocaleString()}</strong>
                  </span>
                ))}
              </div>
              <div className={styles.actions}>
                <button className="btn btn-outline" onClick={() => openEdit(product)} id={`edit-${product.id}`}>✏️ Edit</button>
                <button
                  className={`${styles.toggleBtn} ${product.available ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => toggleAvailable(product)}
                >
                  {product.available ? "✅ Available" : "⛔ Hidden"}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deletingId === product.id}
                  id={`delete-${product.id}`}
                >
                  {deletingId === product.id ? "Deleting…" : "🗑️ Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modal === "add" ? "Add New Menu Item" : `Edit: ${editingProduct?.name}`}
              </h2>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSave} className={styles.modalBody}>
              <div className={styles.formGrid2}>
                <div className={styles.field}>
                  <label htmlFor="f-name">Name *</label>
                  <input id="f-name" required value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Devilled Chicken" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="f-category">Category *</label>
                  <select id="f-category" required value={form.categoryId} onChange={(e) => setForm((f: any) => ({ ...f, categoryId: e.target.value }))}>
                    <option value="">Select category…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="f-slug">Slug * <span className={styles.hint}>(auto-generated; must be unique)</span></label>
                <input id="f-slug" required value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))} placeholder="devilled-chicken" />
              </div>

              <div className={styles.field}>
                <label htmlFor="f-tagline">Tagline * <span className={styles.hint}>(short, punchy one-liner)</span></label>
                <input id="f-tagline" required value={form.tagline} onChange={(e) => setForm((f: any) => ({ ...f, tagline: e.target.value }))} placeholder="Bold, spicy and unapologetic." />
              </div>

              <div className={styles.field}>
                <label htmlFor="f-desc">Description *</label>
                <textarea id="f-desc" required rows={3} value={form.description} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))} placeholder="Full description shown on the menu page…" />
              </div>

              <div className={styles.formGrid3}>
                <div className={styles.field}>
                  <label htmlFor="f-spice">Spice Level</label>
                  <select id="f-spice" value={form.spiceLevel} onChange={(e) => setForm((f: any) => ({ ...f, spiceLevel: Number(e.target.value) }))}>
                    {SPICE_LEVELS.map((l) => <option key={l} value={l}>{"🌶️".repeat(l)} — Level {l}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="f-sort">Sort Order <span className={styles.hint}>(lower = first)</span></label>
                  <input id="f-sort" type="number" value={form.sortOrder} onChange={(e) => setForm((f: any) => ({ ...f, sortOrder: e.target.value }))} />
                </div>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={form.available} onChange={(e) => setForm((f: any) => ({ ...f, available: e.target.checked }))} />
                    Visible on menu
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f: any) => ({ ...f, featured: e.target.checked }))} />
                    Featured on homepage
                  </label>
                </div>
              </div>

              <div className={styles.portionsSection}>
                <div className={styles.portionsHeader}>
                  <h4 className={styles.subhead}>Portions & Prices *</h4>
                  <button type="button" className={styles.addPortionBtn} onClick={addPortion}>+ Add Portion</button>
                </div>
                <div className={styles.portionLabels}>
                  <span>Label</span><span>Weight (optional)</span><span>Price (LKR)</span><span />
                </div>
                {form.portions.map((p: any, idx: number) => (
                  <div key={idx} className={styles.portionRow}>
                    <input placeholder="Small / Large" value={p.label} onChange={(e) => updatePortion(idx, "label", e.target.value)} required />
                    <input placeholder="250g" value={p.weight} onChange={(e) => updatePortion(idx, "weight", e.target.value)} />
                    <input type="number" placeholder="1200" value={p.price} onChange={(e) => updatePortion(idx, "price", e.target.value)} required min={0} />
                    {form.portions.length > 1 && (
                      <button type="button" className={styles.removePortionBtn} onClick={() => removePortion(idx)}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-product-btn">
                  {saving ? "Saving…" : modal === "add" ? "Create Item" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
