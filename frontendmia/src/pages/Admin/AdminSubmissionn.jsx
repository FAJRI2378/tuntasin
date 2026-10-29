import React, { useState, useEffect } from "react";
import api from "../../js/api.js";
import { Flame } from "lucide-react";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Search, Status Filter (Checkbox/Checklist), dan Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(["pending"]); // Default checklist 'pending'
  const [sortBy, setSortBy] = useState("latest"); // Pilihan: 'latest', 'oldest', 'most_voted'

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

  // --- LOGIKA CHECKLIST STATUS ---
  const handleStatusCheckboxChange = (statusValue) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(statusValue)) {
        return prev.filter((s) => s !== statusValue);
      } else {
        return [...prev, statusValue];
      }
    });
    setCurrentPage(1);
  };

  // --- LOGIKA FILTER & SORTING ---
  const filteredSubmissions = submissions.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    
    // Filter Berdasarkan Pencarian Teks
    const matchesSearch = (
      item.label?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower) ||
      item.user?.name?.toLowerCase().includes(searchLower)
    );

    // Filter Berdasarkan Checklist Status
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Logika Pengurutan (Sorting)
    if (sortBy === "most_voted") {
      return (b.votes_count || 0) - (a.votes_count || 0);
    } else if (sortBy === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#f59e0b" },
    { value: "process", label: "Diproses", color: "#3b82f6" },
    { value: "invalid", label: "Invalid", color: "#ef4444" },
    { value: "completed", label: "Selesai", color: "#10b981" },
  ];

  return (
    <div style={{ color: "#fff", padding: "20px" }}>
      
      {/* Tambahkan style keyframes untuk animasi pulse (skeleton) jika belum ada di file CSS global */}
      <style>
        {`
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>

      <h2 style={{ fontSize: "24px", marginBottom: "20px", fontWeight: "bold" }}>Manajemen Laporan (Submission)</h2>

      {/* Baris Filter: Search, Status Checklist, & Sorting */}
      <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "15px", backgroundColor: "#1e293b", padding: "15px", borderRadius: "8px", border: "1px solid #334155" }}>
        
        {/* Atas: Search & Sorting */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
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
              backgroundColor: "#0f172a",
              color: "#fff",
              outline: "none"
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "white" }}>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #334155",
                backgroundColor: "#0f172a",
                color: "#fff",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="most_voted">Vote Paling Banyak</option>
            </select>
          </div>
        </div>

        {/* Bawah: Checklist Filter Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap", borderTop: "1px solid #334155", paddingTop: "10px" }}>
          <span style={{ fontSize: "14px", color: "white", fontWeight: "bold" }}>Filter Status:</span>
          {statusOptions.map((status) => (
            <label key={status.value} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status.value)}
                onChange={() => handleStatusCheckboxChange(status.value)}
                style={{ cursor: "pointer", accentColor: status.color, width: "16px", height: "16px" }}
              />
              <span style={{ color: status.color, fontWeight: "500" }}>{status.label}</span>
            </label>
          ))}
          <div style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "14px" }}>
            Total Data Ditampilkan: {filteredSubmissions.length}
          </div>
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
              /* --- SKELETON LOADING UI --- */
              Array.from({ length: itemsPerPage }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} style={{ borderBottom: "1px solid #334155" }}>
                  {Array.from({ length: 7 }).map((_, colIndex) => (
                    <td key={`col-${colIndex}`} style={{ padding: "12px 16px" }}>
                      <div 
                        style={{ 
                          height: "20px", 
                          backgroundColor: "#334155", 
                          borderRadius: "4px",
                          animation: "skeleton-pulse 1.5s infinite ease-in-out"
                        }}
                      ></div>
                    </td>
                  ))}
                </tr>
              ))
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

                  {/* Dropdown Interaktif untuk Ubah Status */}
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
                  Tidak ada laporan yang ditemukan dengan filter tersebut.
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