import { useEffect, useState } from "react";
import api from "../../js/api.js";
import { Trash, Edit, Plus } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await api.get("categories");
      // Ambil bagian array di dalam respons .data.data
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) return;

    try {
      if (editingId) {
        await api.put(`categories/${editingId}`, { name });
      } else {
        await api.post("categories", { name });
      }
      setName("");
      setEditingId(null);
      fetchCategories();
    } catch (error) {
    }
  }

  function handleEdit(cat) {
    setEditingId(cat.id);
    setName(cat.name);
  }

  async function handleDelete(id) {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await api.delete(`categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert("Gagal menghapus kategori!");
    }
  }

  return (
    <div style={{ padding: "24px", color: "#fff" }}>
      <h2>Manajemen Kategori</h2>

      {/* Form Add / Edit */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Nama Kategori Baru"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #334155", background: "#1e293b", color: "#fff", flex: 1 }}
        />
        <button type="submit" style={{ padding: "10px 16px", background: "#2563eb", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" }}>
          {editingId ? "Update" : "Tambah"}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setName(""); }} style={{ padding: "10px 16px", background: "#475569", border: "none", color: "#fff", borderRadius: "6px" }}>
            Batal
          </button>
        )}
      </form>

      {/* Tabel Kategori */}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#0f172a" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #334155", textAlign: "left" }}>
            <th style={{ padding: "12px" }}>ID</th>
            <th style={{ padding: "12px" }}>Nama Kategori</th>
            <th style={{ padding: "12px", textAlign: "right" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} style={{ borderBottom: "1px solid #1e293b" }}>
              <td style={{ padding: "12px" }}>{cat.id}</td>
              <td style={{ padding: "12px" }}>{cat.name}</td>
              <td style={{ padding: "12px", textAlign: "right" }}>
                <button onClick={() => handleEdit(cat)} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", marginRight: "12px" }}>
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(cat.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}