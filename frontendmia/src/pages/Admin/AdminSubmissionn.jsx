import React, { useState, useEffect } from "react";
import api from "../../js/api.js";
import { Flame, MapPin, Tag, Clock, MessageSquare, Edit3, Trash2, FileText } from "lucide-react";

// Seluruh gaya layout & responsif dipusatkan di sini
const responsiveCss = `
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

  .as-wrap {
    color: #fff;
    padding: 20px;
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
    width: 100%;
  }
  .as-title { font-size: 24px; margin-bottom: 20px; font-weight: bold; }

  /* Panel filter */
  .as-filter {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    background-color: #1e293b;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #334155;
    box-sizing: border-box;
  }
  .as-filter-top {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }
  .as-search {
    padding: 10px 15px;
    flex: 1 1 260px;
    max-width: 300px;
    min-width: 0;
    border-radius: 8px;
    border: 1px solid #334155;
    background-color: #0f172a;
    color: #fff;
    outline: none;
    box-sizing: border-box;
  }
  .as-sort { display: flex; align-items: center; gap: 10px; }
  .as-sort select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #334155;
    background-color: #0f172a;
    color: #fff;
    outline: none;
    cursor: pointer;
  }
  .as-filter-bottom {
    display: flex;
    align-items: center;
    gap: 10px 15px;
    flex-wrap: wrap;
    border-top: 1px solid #334155;
    padding-top: 10px;
  }
  .as-total { margin-left: auto; color: #94a3b8; font-size: 14px; }

  /* Grid kartu: min() mencegah overflow di layar < 320px */
  .as-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
    gap: 20px;
  }
  .as-grid > * { min-width: 0; }

  .as-card {
    background-color: #1e293b;
    border-radius: 10px;
    border: 1px solid #334155;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  }
  .as-card-body { padding: 15px; flex: 1; display: flex; flex-direction: column; }
  .as-card-title { font-size: 1.1rem; margin: 0 0 8px 0; color: #f8fafc; line-height: 1.3; overflow-wrap: anywhere; }
  .as-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 12px;
    border-top: 1px solid #334155;
    padding-top: 8px;
  }
  .as-feedback-text { overflow-wrap: anywhere; }
  .as-controls { margin-top: 8px; display: flex; align-items: center; gap: 8px; }
  .as-controls select { flex: 1; min-width: 0; }

  /* Modal */
  .as-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
    box-sizing: border-box;
    z-index: 9999;
  }
  .as-modal {
    background-color: #1e293b;
    padding: 25px;
    border-radius: 10px;
    width: 100%;
    max-width: 450px;
    max-height: 90vh;
    overflow-y: auto;
    box-sizing: border-box;
    border: 1px solid #334155;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  }
  .as-modal textarea,
  .as-modal input[type="file"] { box-sizing: border-box; max-width: 100%; }

  /* Pagination */
  .as-pager {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 20px;
    gap: 10px;
  }

  /* ---------- Tablet (<= 800px): sidebar tertutup ---------- */
  @media screen and (max-width: 800px) {
    .as-wrap {
      padding: 10px;
      margin-left: 50px;               /* lebar sidebar tertutup */
      width: auto;
      max-width: calc(100vw - 55px);
      overflow-x: hidden;
    }
    .as-title { font-size: 1.3rem; }
    .as-search { max-width: none; flex-basis: 100%; }
    .as-sort { width: 100%; }
    .as-sort select { flex: 1; }
  }

  /* ---------- HP kecil (<= 480px) ---------- */
  @media screen and (max-width: 480px) {
    .as-filter { padding: 12px; }
    .as-total { margin-left: 0; width: 100%; }
    .as-grid { gap: 15px; }
    .as-modal { padding: 18px; }
    .as-pager { justify-content: center; }
  }
`;

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Search, Status Filter (Checkbox), dan Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(["pending"]);
  const [sortBy, setSortBy] = useState("latest");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- STATE UNTUK MODAL FEEDBACK & PDF ---
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

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
     await api.delete(`admin/submissions/${id}`);
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      alert("Laporan berhasil dihapus oleh admin.");
    } catch (error) {
      console.error("Gagal menghapus laporan:", error);
      alert("Gagal menghapus laporan.");
    }
  };

  const handleDirectStatusChange = async (id, newStatus, currentFeedback) => {
    try {
      const response = await api.post(`admin/submissions/${id}/status`, {
        status: newStatus,
        feedback: currentFeedback || "",
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

  // --- MEMBUKA MODAL KHUSUS UNTUK EDIT/ISI FEEDBACK ---
  const handleOpenFeedbackModal = (id, currentFeedback) => {
    setSelectedSubmissionId(id);
    setFeedbackText(currentFeedback || "");
    setPdfFile(null);
    setShowFeedbackModal(true);
  };

  // --- FUNGSI KIRIM FEEDBACK & PDF KE SERVER ---
  const handleSaveFeedbackOnly = async () => {
    try {
      const currentItem = submissions.find((item) => item.id === selectedSubmissionId);

      const formData = new FormData();
      formData.append("status", currentItem ? currentItem.status : "pending");
      formData.append("feedback", feedbackText);
      if (pdfFile) {
        formData.append("pdf_attachment", pdfFile);
      }

      const response = await api.post(`admin/submissions/${selectedSubmissionId}/status`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        fetchSubmissions();
        setShowFeedbackModal(false);
        setPdfFile(null);
        alert("Catatan feedback dan dokumen proyek berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Gagal menyimpan feedback:", error.response);
      alert(error.response?.data?.message || "Gagal memperbarui catatan feedback.");
    }
  };

  // --- LOGIKA CHECKLIST STATUS ---
  const handleStatusCheckboxChange = (statusValue) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusValue) ? prev.filter((s) => s !== statusValue) : [...prev, statusValue]
    );
    setCurrentPage(1);
  };

  // --- LOGIKA FILTER & SORTING ---
  const filteredSubmissions = submissions
    .filter((item) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        item.label?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.user?.name?.toLowerCase().includes(searchLower);

      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
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

  // --- HELPER URL UNTUK GAMBAR DAN PDF (MENGATASI BROKEN LINK) ---
  const getFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    // Membersihkan awalan public/ atau storage/ jika ada
    const cleanPath = path.replace(/^(public|storage)\//, "");
    return `https://tuntasin-web.epistura.web.id/storage/${cleanPath}`;
  };

  return (
    <div className="as-wrap">
      <style>{responsiveCss}</style>

      <h2 className="as-title">Manajemen Laporan (Admin Dashboard)</h2>

      {/* Filter: Search, Status Checklist, & Sorting */}
      <div className="as-filter">
        <div className="as-filter-top">
          <input
            type="text"
            className="as-search"
            placeholder="Cari judul, pelapor, atau lokasi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="as-sort">
            <span style={{ fontSize: "14px", color: "white" }}>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="most_voted">Vote Paling Banyak</option>
            </select>
          </div>
        </div>

        <div className="as-filter-bottom">
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
          <div className="as-total">Total Data Ditampilkan: {filteredSubmissions.length}</div>
        </div>
      </div>

      {/* --- GRID KARTU LAPORAN ADMIN --- */}
      <div className="as-grid">
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, idx) => <div key={idx} className="skeleton-card"></div>)
        ) : currentItems.length > 0 ? (
          currentItems.map((item) => {
            const statusInfo = getStatusBadge(item.status);

            return (
              <div key={item.id} className="as-card">
                {/* Badge Status */}
                <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}>
                  <div style={{ backgroundColor: statusInfo.bg, color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" }}>
                    {statusInfo.label}
                  </div>
                </div>

                {/* Foto Laporan - MENGGUNAKAN HELPER getFileUrl */}
                <div style={{ backgroundColor: "#0f172a", padding: "8px" }}>
                  {item.images && item.images.length > 0 ? (
                    item.images.length === 1 ? (
                      <a
                        href={getFileUrl(item.images[0].url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Klik untuk memperbesar foto"
                        style={{ display: "block", height: "160px", borderRadius: "6px", overflow: "hidden", border: "1px solid #334155" }}
                      >
                        <img
                          src={getFileUrl(item.images[0].url)}
                          alt="Lampiran Laporan"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </a>
                    ) : (
                      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", maxHeight: "170px" }}>
                        {item.images.map((img, index) => (
                          <a
                            key={index}
                            href={getFileUrl(img.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Lampiran ${index + 1} (Klik untuk memperbesar)`}
                            style={{ minWidth: "130px", height: "150px", borderRadius: "6px", overflow: "hidden", display: "block", border: "1px solid #334155", flexShrink: 0 }}
                          >
                            <img
                              src={getFileUrl(img.url)}
                              alt={`Lampiran ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </a>
                        ))}
                      </div>
                    )
                  ) : (
                    <div style={{ width: "100%", height: "120px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "0.85rem" }}>
                      Tidak ada foto
                    </div>
                  )}
                </div>

                <div className="as-card-body">
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                    Pelapor: <strong style={{ color: "#cbd5e1" }}>{item.user?.name || "Anonim"}</strong>
                  </div>

                  <h3 className="as-card-title">{item.label}</h3>

                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.4", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>

                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", color: "#cbd5e1" }}>
                    {/* Peta kecil */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                        <MapPin size={14} color="#ef4444" style={{ flexShrink: 0 }} /> <span style={{ overflowWrap: "anywhere" }}>{item.location}</span>
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

                    {/* Kategori, Vote, & Tanggal */}
                    <div className="as-meta">
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

                    {/* Feedback & PDF - MENGGUNAKAN HELPER getFileUrl */}
                    <div style={{ backgroundColor: "#0f172a", padding: "8px", borderRadius: "6px", border: "1px dashed #475569", marginTop: "4px" }}>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MessageSquare size={12} color="#3b82f6" /> Catatan Feedback untuk Warga:
                      </div>
                      <div
                        className="as-feedback-text"
                        style={{ fontSize: "0.8rem", color: item.feedback ? "#e2e8f0" : "#64748b", fontStyle: item.feedback ? "normal" : "italic", marginBottom: "6px" }}
                      >
                        {item.feedback ? item.feedback : "Belum ada catatan feedback."}
                      </div>

                      {item.pdf_attachment && (
                        <a
                          href={getFileUrl(item.pdf_attachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: "#2563eb", color: "#fff", borderRadius: "4px", textDecoration: "none", fontSize: "0.75rem", fontWeight: "bold" }}
                        >
                          <FileText size={12} /> Unduh Dokumen Proyek (PDF)
                        </a>
                      )}
                    </div>

                    {/* Kontrol Admin */}
                    <div className="as-controls">
                      <select
                        value={item.status}
                        onChange={(e) => handleDirectStatusChange(item.id, e.target.value, item.feedback)}
                        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #475569", backgroundColor: statusInfo.bg, color: "#fff", fontWeight: "bold", cursor: "pointer", outline: "none", fontSize: "0.85rem" }}
                      >
                        <option value="pending" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Pending</option>
                        <option value="process" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Diproses</option>
                        <option value="invalid" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Invalid</option>
                        <option value="completed" style={{ backgroundColor: "#1e293b", color: "#fff" }}>Selesai</option>
                      </select>

                      <button
                        onClick={() => handleOpenFeedbackModal(item.id, item.feedback)}
                        title="Edit Catatan Feedback & Lampiran"
                        style={{ padding: "8px 10px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", fontWeight: "bold", flexShrink: 0 }}
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteSubmission(item.id)}
                        title="Hapus Laporan"
                        style={{ padding: "8px 10px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
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

      {/* --- MODAL FEEDBACK & UPLOAD PDF --- */}
      {showFeedbackModal && (
        <div className="as-overlay">
          <div className="as-modal">
            <h3 style={{ marginBottom: "15px", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
              <MessageSquare size={20} color="#3b82f6" style={{ flexShrink: 0 }} /> Catatan Feedback & Dokumen Proyek
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px" }}>
              Tuliskan catatan progress penanganan dan lampirkan dokumen PDF resmi (RAB/Proposal) untuk transparansi publik.
            </p>

            <textarea
              rows="3"
              placeholder="Contoh: Tim sedang menuju ke lokasi perbaikan..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#fff", resize: "vertical", outline: "none", marginBottom: "15px" }}
            />

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                📄 Lampirkan File PDF Proyek / RAB (Opsional):
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#fff", fontSize: "0.85rem" }}
              />
              {pdfFile && (
                <span style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "4px", display: "block", overflowWrap: "anywhere" }}>
                  Terpilih: {pdfFile.name}
                </span>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{ padding: "8px 16px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveFeedbackOnly}
                style={{ padding: "8px 16px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
              >
                Simpan & Unggah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="as-pager">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: "8px 12px", backgroundColor: currentPage === 1 ? "#334155" : "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            Prev
          </button>

          <span style={{ color: "#cbd5e1" }}>
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ padding: "8px 12px", backgroundColor: currentPage === totalPages ? "#334155" : "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}