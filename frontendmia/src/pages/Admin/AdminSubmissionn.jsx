import React, { useState, useEffect } from "react";
import api from "../../js/api.js";
import { Flame, MapPin, Tag, Clock, MessageSquare, Edit3, Trash2 } from "lucide-react";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Search, Status Filter (Checkbox), dan Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(["pending"]); 
  const [sortBy, setSortBy] = useState("latest"); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // --- STATE UNTUK MODAL FEEDBACK ---
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");

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

  // --- FUNGSI HAPUS LAPORAN OLEH ADMIN ---
  const handleDeleteSubmission = async (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus laporan ini sebagai Admin?");
    if (!confirmDelete) return;

    try {
      await api.delete(`submissions/${id}`);
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      alert("Laporan berhasil dihapus oleh admin.");
    } catch (error) {
      console.error("Gagal menghapus laporan:", error);
      alert("Gagal menghapus laporan.");
    }
  };

  // --- FUNGSI LANGSUNG UBAH STATUS TANPA MODAL ---
  const handleDirectStatusChange = async (id, newStatus, currentFeedback) => {
    try {
      const response = await api.put(`admin/submissions/${id}/status`, {
        status: newStatus,
        feedback: currentFeedback || "" // Pertahankan feedback yang sudah ada
      });

      if (response.status === 200) {
        setSubmissions((prev) =>
          prev.map((item) => 
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (error) {
      console.error("Gagal mengubah status:", error.response);
      alert(error.response?.data?.message || "Gagal memperbarui status laporan.");
    }
  };

  // --- MEMBUKA MODAL KHUSUS UNTUK EDIT/ISI FEEDBACK ---
  const handleOpenFeedbackModal = (id, currentFeedback) => {
    setSelectedSubmissionId(id);
    setFeedbackText(currentFeedback || ""); 
    setShowFeedbackModal(true);
  };

  // --- FUNGSI KIRIM FEEDBACK BARU KE SERVER ---
  const handleSaveFeedbackOnly = async () => {
    try {
      // Cari status saat ini dari submission yang dipilih agar tidak berubah
      const currentItem = submissions.find(item => item.id === selectedSubmissionId);

      const response = await api.put(`admin/submissions/${selectedSubmissionId}/status`, {
        status: currentItem ? currentItem.status : "pending",
        feedback: feedbackText
      });

      if (response.status === 200) {
        setSubmissions((prev) =>
          prev.map((item) => 
            item.id === selectedSubmissionId 
              ? { ...item, feedback: feedbackText } 
              : item
          )
        );
        setShowFeedbackModal(false);
        alert("Catatan feedback berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Gagal menyimpan feedback:", error.response);
      alert("Gagal memperbarui catatan feedback.");
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
    
    const matchesSearch = (
      item.label?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower) ||
      item.user?.name?.toLowerCase().includes(searchLower)
    );

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
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

  // --- HELPER BADGE STATUS ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return { label: "Pending", bg: "#f59e0b" };
      case "process": return { label: "Diproses", bg: "#3b82f6" };
      case "invalid": return { label: "Invalid", bg: "#ef4444" };
      case "completed": return { label: "Selesai", bg: "#10b981" };
      default: return { label: status, bg: "#6b7280" };
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#f59e0b" },
    { value: "process", label: "Diproses", color: "#3b82f6" },
    { value: "invalid", label: "Invalid", color: "#ef4444" },
    { value: "completed", label: "Selesai", color: "#10b981" },
  ];

  return (
    <div style={{ color: "#fff", padding: "20px", position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
      
      <style>
        {`
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .skeleton-card {
            background-color: #1e293b;
            border-radius: 12px;
            height: 420px;
            animation: skeleton-pulse 1.5s infinite ease-in-out;
            border: 1px solid #334155;
          }
        `}
      </style>

      <h2 style={{ fontSize: "24px", marginBottom: "20px", fontWeight: "bold" }}>Manajemen Laporan (Admin Dashboard)</h2>

      {/* Baris Filter: Search, Status Checklist, & Sorting */}
      <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "15px", backgroundColor: "#1e293b", padding: "15px", borderRadius: "8px", border: "1px solid #334155" }}>
        
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

      {/* --- GRID KARTU LAPORAN ADMIN --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, idx) => (
            <div key={idx} className="skeleton-card"></div>
          ))
        ) : currentItems.length > 0 ? (
          currentItems.map((item) => {
            const statusInfo = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "10px",
                  border: "1px solid #334155",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                }}
              >
                {/* Badge Status di Pojok Kanan Atas */}
                <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}>
                  <div style={{ backgroundColor: statusInfo.bg, color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" }}>
                    {statusInfo.label}
                  </div>
                </div>

                {/* Foto Laporan */}
                <div style={{ height: "150px", backgroundColor: "#0f172a", overflow: "hidden" }}>
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={`http://localhost:8000/storage/${item.images[0].url}`}
                      alt="Laporan"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "0.85rem" }}>
                      Tidak ada foto
                    </div>
                  )}
                </div>

                <div style={{ padding: "15px", flex: 1, display: "flex", flexDirection: "column" }}>
                  
                  {/* Info Pelapor */}
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                    Pelapor: <strong style={{ color: "#cbd5e1" }}>{item.user?.name || "Anonim"}</strong>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 8px 0", color: "#f8fafc", lineHeight: "1.3" }}>
                    {item.label}
                  </h3>

                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.4", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>

                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", color: "#cbd5e1" }}>
                    
                    {/* Embedded Map Locator Kecil */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                         <MapPin size={14} color="#ef4444" /> {item.location}
                      </div>
                      <iframe
                        title="Peta Lokasi"
                        width="100%"
                        height="70"
                        frameBorder="0"
                        style={{ border: 0, borderRadius: "6px", opacity: 0.8 }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`}
                        allowFullScreen
                        loading="lazy"
                      ></iframe>
                    </div>

                    {/* Kategori, Tanggal, & Vote */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #334155", paddingTop: "8px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#3b82f6" }}>
                        <Tag size={14} /> {item.category?.name || "Umum"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#fca5a5", fontWeight: "bold" }}>
                        <Flame size={14} color="#ef4444" /> {item.votes_count || 0} Vote
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} /> {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    {/* Kotak Menampilkan Catatan Feedback */}
                    <div style={{ 
                      backgroundColor: "#0f172a", 
                      padding: "8px", 
                      borderRadius: "6px", 
                      border: "1px dashed #475569",
                      marginTop: "4px"
                    }}>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MessageSquare size={12} color="#3b82f6" /> Catatan Feedback untuk Warga:
                      </div>
                      <div style={{ fontSize: "0.8rem", color: item.feedback ? "#e2e8f0" : "#64748b", fontStyle: item.feedback ? "normal" : "italic" }}>
                        {item.feedback ? item.feedback : "Belum ada catatan feedback."}
                      </div>
                    </div>

                    {/* Bagian Kontrol Admin: Ubah Status Langsung, Edit Feedback, & Hapus */}
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        value={item.status}
                        onChange={(e) => handleDirectStatusChange(item.id, e.target.value, item.feedback)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #475569",
                          backgroundColor: statusInfo.bg,
                          color: "#fff",
                          fontWeight: "bold",
                          cursor: "pointer",
                          outline: "none",
                          fontSize: "0.85rem"
                        }}
                      >
                        <option value="pending" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Pending</option>
                        <option value="process" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Diproses</option>
                        <option value="invalid" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Invalid</option>
                        <option value="completed" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Selesai</option>
                      </select>

                      <button
                        onClick={() => handleOpenFeedbackModal(item.id, item.feedback)}
                        title="Edit Catatan Feedback"
                        style={{
                          padding: "8px 10px",
                          backgroundColor: "#334155",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.85rem",
                          fontWeight: "bold"
                        }}
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteSubmission(item.id)}
                        title="Hapus Laporan"
                        style={{
                          padding: "8px 10px",
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#94a3b8", backgroundColor: "#1e293b", borderRadius: "10px" }}>
            Tidak ada laporan yang ditemukan dengan filter tersebut.
          </div>
        )}
      </div>

      {/* --- MODAL POPUP INPUT FEEDBACK ADMIN --- */}
      {showFeedbackModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.7)", display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "#1e293b", padding: "25px", borderRadius: "10px",
            width: "450px", border: "1px solid #334155", boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ marginBottom: "15px", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
              <MessageSquare size={20} color="#3b82f6" /> Berikan Catatan / Feedback Admin
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px" }}>
              Tuliskan alasan perubahan status atau progress penanganan laporan agar dapat dibaca langsung oleh pelapor di halaman mereka.
            </p>
            
            <textarea
              rows="4"
              placeholder="Contoh: Foto lokasi kurang jelas, atau tim sedang menuju ke lokasi..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              style={{
                width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #475569",
                backgroundColor: "#0f172a", color: "#fff", resize: "vertical", outline: "none", marginBottom: "20px"
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  padding: "8px 16px", backgroundColor: "#334155", color: "#fff",
                  border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500"
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveFeedbackOnly}
                style={{
                  padding: "8px 16px", backgroundColor: "#3b82f6", color: "#fff",
                  border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                }}
              >
                Simpan Feedback
              </button>
            </div>
          </div>
        </div>
      )}

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