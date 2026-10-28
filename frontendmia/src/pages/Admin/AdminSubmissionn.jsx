import React, { useState, useEffect } from "react";
import api from "../../js/api.js";
import { Flame } from "lucide-react";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get("submissions");
      setSubmissions(response.data.data || []); 
    } catch (error) {
      console.error("Gagal memuat data laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI UBAH STATUS KE SERVER ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`admin/submissions/${id}/status`, {
        status: newStatus
      });

      if (response.status === 200) {
        setSubmissions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (error) {
      console.error("Gagal mengubah status:", error.response);
      alert(error.response?.data?.message || "Gagal memperbarui status laporan.");
    }
  };

  // --- LOGIKA PENCARIAN (SEARCH) ---
  const filteredSubmissions = submissions.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.label?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower) ||
      item.user?.name?.toLowerCase().includes(searchLower)
    );
  });

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  return (
    <div style={{ color: "#fff", padding: "20px" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "20px", fontWeight: "bold" }}>Manajemen Laporan (Submission)</h2>

      {/* Baris Pencarian (Search Bar) */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
        <input
          type="text"
          placeholder="Cari judul, pelapor, atau lokasi..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); 
          }}
          style={{
            padding: "10px 15px",
            width: "300px",
            borderRadius: "8px",
            border: "1px solid #334155",
            backgroundColor: "#1e293b",
            color: "#fff",
            outline: "none"
          }}
        />
        <div style={{ alignSelf: "center", color: "#94a3b8" }}>
          Total Data: {filteredSubmissions.length}
        </div>
      </div>

      {/* Tabel Data */}
      <div style={{ overflowX: "auto", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #334155" }}>
            <tr>
              <th style={{ padding: "12px 16px" }}>ID</th>
              <th style={{ padding: "12px 16px" }}>Pelapor</th>
              <th style={{ padding: "12px 16px" }}>Judul Laporan</th>
              <th style={{ padding: "12px 16px" }}>Kategori</th>
              <th style={{ padding: "12px 16px" }}>Lokasi</th>
              <th style={{ padding: "12px 16px" }}>Dukungan (Vote)</th>
              <th style={{ padding: "12px 16px" }}>Status (Ubah)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>Memuat data...</td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #334155" }}>
                  <td style={{ padding: "12px 16px" }}>#{indexOfFirstItem + index + 1}</td>
                  <td style={{ padding: "12px 16px" }}>{item.user?.name || "Anonim"}</td>
                  <td style={{ padding: "12px 16px" }}>{item.label}</td>
                  <td style={{ padding: "12px 16px" }}>{item.category?.name || "-"}</td>
                  <td style={{ padding: "12px 16px" }}>{item.location}</td>
                  
                  {/* Tampilkan Jumlah Vote */}
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#fca5a5", fontWeight: "bold" }}>
                      <Flame size={16} color="#ef4444" /> {item.votes_count || 0}
                    </span>
                  </td>

                  {/* Dropdown Interaktif untuk Ubah Status (Lengkap dengan Opsi Invalid) */}
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #475569",
                        backgroundColor: 
                          item.status === "pending" ? "#f59e0b" :
                          item.status === "process" ? "#3b82f6" :
                          item.status === "invalid" ? "#ef4444" : "#10b981",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      <option value="pending" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Pending</option>
                      <option value="process" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Diproses</option>
                      <option value="invalid" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Invalid</option>
                      <option value="completed" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Selesai</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                  Tidak ada laporan yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Kontrol Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "20px", gap: "10px" }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              backgroundColor: currentPage === 1 ? "#334155" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer"
            }}
          >
            Prev
          </button>
          
          <span style={{ color: "#cbd5e1" }}>
            Halaman {currentPage} dari {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              backgroundColor: currentPage === totalPages ? "#334155" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer"
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}