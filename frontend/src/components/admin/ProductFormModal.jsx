import { useState } from "react";

const CONCENTRATIONS = [
  "Parfum",
  "Eau de Parfum",
  "Eau de Toilette",
  "Eau de Cologne",
];

// Build initial form state from an existing product (edit) or blanks (create).
const initialState = (product, categories) => ({
  Title: product?.Title || "",
  Brand: product?.Brand || "",
  Description: product?.description || "",
  // Price is stored in cents; show it to the admin in KES.
  priceKes: product?.Price ? (product.Price / 100).toString() : "",
  Size: product?.size || "",
  Concentration: product?.concentration || "",
  ScentNotes: product?.scent_notes || "",
  Image: product?.Image || "",
  Featured: product?.featured || false,
  Shipping: product?.Shipping ?? true,
  CategoryID: product?.CategoryID || categories?.[0]?.ID || "",
});

const inputClass =
  "w-full rounded-btn bg-ink border border-graphite px-4 py-2.5 text-sm text-fog placeholder-ash focus:border-platinum focus:outline-none transition-colors";

const ProductFormModal = ({ product, categories, onClose, onSave }) => {
  const [form, setForm] = useState(() => initialState(product, categories));
  const isEdit = Boolean(product);

  const set = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
      <div className="brand-card w-full max-w-2xl my-8 p-8">
        <h3 className="brand-heading text-xl mb-6">
          {isEdit ? "Edit product" : "New product"}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="brand-eyebrow block mb-2">Title</label>
            <input className={inputClass} value={form.Title} onChange={set("Title")} required />
          </div>

          <div>
            <label className="brand-eyebrow block mb-2">Brand</label>
            <input className={inputClass} value={form.Brand} onChange={set("Brand")} required />
          </div>

          <div>
            <label className="brand-eyebrow block mb-2">Price (KES)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.priceKes}
              onChange={set("priceKes")}
              required
            />
          </div>

          <div>
            <label className="brand-eyebrow block mb-2">Category</label>
            <select
              className={inputClass}
              value={form.CategoryID}
              onChange={set("CategoryID")}
              required
              disabled={isEdit}
            >
              {(categories || []).map((c) => (
                <option key={c.ID} value={c.ID}>
                  {c.Title}
                </option>
              ))}
            </select>
            {isEdit && (
              <p className="mt-1 text-xs text-ash">Category can't be changed on edit.</p>
            )}
          </div>

          <div>
            <label className="brand-eyebrow block mb-2">Size</label>
            <input
              className={inputClass}
              value={form.Size}
              onChange={set("Size")}
              placeholder="e.g. 100ml"
            />
          </div>

          <div>
            <label className="brand-eyebrow block mb-2">Concentration</label>
            <select className={inputClass} value={form.Concentration} onChange={set("Concentration")}>
              <option value="">—</option>
              {CONCENTRATIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="brand-eyebrow block mb-2">Image URL</label>
            <input
              className={inputClass}
              value={form.Image}
              onChange={set("Image")}
              placeholder="https://…"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="brand-eyebrow block mb-2">Description</label>
            <textarea className={inputClass} rows={2} value={form.Description} onChange={set("Description")} />
          </div>

          <div className="sm:col-span-2">
            <label className="brand-eyebrow block mb-2">Scent notes</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.ScentNotes}
              onChange={set("ScentNotes")}
              placeholder="Top: … Heart: … Base: …"
            />
          </div>

          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-fog">
              <input type="checkbox" checked={form.Featured} onChange={set("Featured")} className="checkbox checkbox-sm" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-fog">
              <input type="checkbox" checked={form.Shipping} onChange={set("Shipping")} className="checkbox checkbox-sm" />
              Shipping available
            </label>
          </div>

          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button type="submit" className="brand-btn flex-1">
              {isEdit ? "Save changes" : "Create product"}
            </button>
            <button type="button" onClick={onClose} className="brand-btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
