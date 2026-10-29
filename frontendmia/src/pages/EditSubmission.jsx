import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../js/api";

export default function EditSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    label: "",
    description: "",
    location: "",
    category_id: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      // Ambil daftar kategori untuk dropdown
      const catRes = await api.get("categories");
      setCategories(catRes.data.data || []);

      // Ambil data detail laporan yang mau diedit
      const subRes = await api.get(`submissions/${id}`);
      const item = subRes.data.data || subRes.data;
      
      setFormData({
        label: item.label,
        description: item.description,
        location: item.location,
        category_id: item.category_id,
      });
    } catch (error) {
      console.error("Gagal memuat data:", error);
      alert("Laporan tidak ditemukan atau terjadi kesalahan.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`submissions/${id}`, formData);
      
      // Kirim sinyal agar sidebar langsung memperbarui data
      window.dispatchEvent(new Event("submissionUpdated"));
      
      alert("Laporan berhasil diperbarui!");
      navigate("/");
    } catch (error) {
      console.error("Gagal memperbarui:", error);
      alert("Gagal memperbarui laporan.");
    }
  };

  if (loading) return <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>Memuat Data...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", color: "#fff", backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155" }}>
      <h2 style={{ marginBottom: "20px", fontSize: "1.8rem" }}>Edit Laporan</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Judul Laporan</label>
          <input 
            type="text" name="label" value={formData.label} onChange={handleChange} required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#fff" }} 
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Kategori</label>
          <select 
            name="category_id" value={formData.category_id} onChange={handleChange} required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#fff" }}
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Lokasi</label>
          <input 
            type="text" name="location" value={formData.location} onChange={handleChange} required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#fff" }} 
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Deskripsi</label>
          <textarea 
            name="description" value={formData.description} onChange={handleChange} required rows="5"
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#fff", resize: "vertical" }} 
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="submit" style={{ flex: 1, padding: "12px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            Simpan Perubahan
          </button>
          <button type="button" onClick={() => navigate("/")} style={{ padding: "12px 20px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}