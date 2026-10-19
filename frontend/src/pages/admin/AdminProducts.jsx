import { useState } from "react";
import { toast } from "react-toastify";
import { useShop } from "../../utils/ShopContext";
import { formatPrice } from "../../utils/index";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../utils/adminApi";
import ProductFormModal from "../../components/admin/ProductFormModal";

const AdminProducts = () => {
  const { products, categories, fetchProducts } = useShop();
  const [editing, setEditing] = useState(null); // product being edited
  const [creating, setCreating] = useState(false);

  const handleSave = async (form) => {
    // form.priceKes is in shillings; convert to cents for the API.
    const payload = {
      Title: form.Title,
      Brand: form.Brand,
      Description: form.Description,
      Price: Math.round(parseFloat(form.priceKes || 0) * 100),
      Size: form.Size,
      Concentration: form.Concentration,
      ScentNotes: form.ScentNotes,
      Image: form.Image,
      Featured: form.Featured,
      Shipping: form.Shipping,
    };

    let res;
    if (editing) {
      res = await updateProduct(editing.ID, payload);
    } else {
      res = await createProduct(form.CategoryID, payload);
    }

    if (res.ok) {
      toast.success(editing ? "Product updated" : "Product created");
      setEditing(null);
      setCreating(false);
      fetchProducts();
    } else {
      toast.error(res.data.error || "Failed to save product");
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.Title}"? This cannot be undone.`)) {
      return;
    }
    const res = await deleteProduct(product.ID);
    if (res.ok) {
      toast.success("Product deleted");
      fetchProducts();
    } else {
      toast.error(res.data.error || "Failed to delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="brand-heading text-2xl">Products</h2>
        <button
          className="brand-btn"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          + New product
        </button>
      </div>

      {/* LIST */}
      <div className="brand-card divide-y divide-graphite">
        {(products || []).length === 0 ? (
          <p className="p-6 text-ash">No products yet.</p>
        ) : (
          products.map((p) => (
            <div key={p.ID} className="flex items-center gap-4 p-4">
              <img
                src={p.Image}
                alt={p.Title}
                className="h-12 w-12 rounded-btn object-cover bg-graphite"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-fog truncate">{p.Title}</p>
                <p className="text-xs text-ash">
                  {p.Brand}
                  {p.featured ? " · Featured" : ""}
                </p>
              </div>
              <span className="text-sm text-platinum whitespace-nowrap">
                {formatPrice(p.Price)}
              </span>
              <div className="flex gap-2">
                <button
                  className="text-xs text-ash hover:text-platinum transition-colors"
                  onClick={() => {
                    setCreating(false);
                    setEditing(p);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-xs text-ash hover:text-error transition-colors"
                  onClick={() => handleDelete(p)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {(creating || editing) && (
        <ProductFormModal
          product={editing}
          categories={categories}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminProducts;
