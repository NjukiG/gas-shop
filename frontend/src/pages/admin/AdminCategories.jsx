import { useState } from "react";
import { toast } from "react-toastify";
import { useShop } from "../../utils/ShopContext";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../utils/adminApi";

const AdminCategories = () => {
  const { categories, fetchCategories } = useShop();
  const [newTitle, setNewTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await createCategory(newTitle.trim());
    if (res.ok) {
      toast.success("Category created");
      setNewTitle("");
      fetchCategories();
    } else {
      toast.error(res.data.error || "Failed to create category");
    }
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim()) return;
    const res = await updateCategory(id, editTitle.trim());
    if (res.ok) {
      toast.success("Category updated");
      setEditId(null);
      fetchCategories();
    } else {
      toast.error(res.data.error || "Failed to update category");
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.Title}"?`)) return;
    const res = await deleteCategory(cat.ID);
    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error(res.data.error || "Failed to delete category");
    }
  };

  return (
    <div>
      <h2 className="brand-heading text-2xl mb-6">Categories</h2>

      {/* CREATE */}
      <form onSubmit={handleCreate} className="brand-card p-5 flex gap-3 mb-6">
        <input
          className="flex-1 rounded-btn bg-ink border border-graphite px-4 py-2.5 text-sm text-fog placeholder-ash focus:border-platinum focus:outline-none"
          placeholder="New category title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" className="brand-btn">
          Add
        </button>
      </form>

      {/* LIST */}
      <div className="brand-card divide-y divide-graphite">
        {(categories || []).length === 0 ? (
          <p className="p-6 text-ash">No categories yet.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.ID} className="flex items-center gap-4 p-4">
              {editId === cat.ID ? (
                <>
                  <input
                    className="flex-1 rounded-btn bg-ink border border-graphite px-3 py-2 text-sm text-fog focus:border-platinum focus:outline-none"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <button
                    className="text-xs text-platinum"
                    onClick={() => handleUpdate(cat.ID)}
                  >
                    Save
                  </button>
                  <button
                    className="text-xs text-ash"
                    onClick={() => setEditId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-fog">{cat.Title}</span>
                  <span className="text-xs text-ash">
                    {(cat.Products || []).length} products
                  </span>
                  <button
                    className="text-xs text-ash hover:text-platinum transition-colors"
                    onClick={() => {
                      setEditId(cat.ID);
                      setEditTitle(cat.Title);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-ash hover:text-error transition-colors"
                    onClick={() => handleDelete(cat)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
