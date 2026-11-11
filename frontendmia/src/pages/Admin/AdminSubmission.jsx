import React, { useState, useEffect } from "react";
import api from "../../js/api.js";
import {
  Flame,
  MapPin,
  Tag,
  Clock,
  MessageSquare,
  Edit3,
  Trash2,
  FileText,
} from "lucide-react";
import styles from "../../css/pages/AdminSubmission.module.css";
import clsx from "clsx";
import LocationView from "../../components/LocationView.jsx";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Search, Status Filter (Checkbox), dan Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([
    "pending",
    "process",
    "completed",
  ]);
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
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus laporan ini sebagai Admin?",
    );
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
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item,
          ),
        );
      }
    } catch (error) {
      console.error("Gagal mengubah status:", error.response);
      alert(
        error.response?.data?.message || "Gagal memperbarui status laporan.",
      );
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
      const currentItem = submissions.find(
        (item) => item.id === selectedSubmissionId,
      );

      const formData = new FormData();
      formData.append("status", currentItem ? currentItem.status : "pending");
      formData.append("feedback", feedbackText);
      if (pdfFile) {
        formData.append("pdf_attachment", pdfFile);
      }

      const response = await api.post(
        `admin/submissions/${selectedSubmissionId}/status`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.status === 200) {
        fetchSubmissions();
        setShowFeedbackModal(false);
        setPdfFile(null);
        alert("Catatan feedback dan dokumen proyek berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Gagal menyimpan feedback:", error.response);
      alert(
        error.response?.data?.message || "Gagal memperbarui catatan feedback.",
      );
    }
  };

  // --- LOGIKA CHECKLIST STATUS ---
  const handleStatusCheckboxChange = (statusValue) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusValue)
        ? prev.filter((s) => s !== statusValue)
        : [...prev, statusValue],
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

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

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
  const currentItems = filteredSubmissions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  // --- HELPER MAPPING CSS CLASS BADGE & SELECT STATUS ---
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return styles.statusBadgePending;
      case "process":
        return styles.statusBadgeProcess;
      case "invalid":
        return styles.statusBadgeInvalid;
      case "completed":
        return styles.statusBadgeCompleted;
      default:
        return styles.statusBadgeDefault;
    }
  };

  const getStatusSelectClass = (status) => {
    switch (status) {
      case "pending":
        return styles.statusSelectPending;
      case "process":
        return styles.statusSelectProcess;
      case "invalid":
        return styles.statusSelectInvalid;
      case "completed":
        return styles.statusSelectCompleted;
      default:
        return styles.statusSelectDefault;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "process":
        return "Diproses";
      case "invalid":
        return "Invalid";
      case "completed":
        return "Selesai";
      default:
        return status;
    }
  };

  const getCheckboxTextClass = (status) => {
    switch (status) {
      case "pending":
        return styles.checkboxTextPending;
      case "process":
        return styles.checkboxTextProcess;
      case "invalid":
        return styles.checkboxTextInvalid;
      case "completed":
        return styles.checkboxTextCompleted;
      default:
        return "";
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "process", label: "Diproses" },
    { value: "invalid", label: "Invalid" },
    { value: "completed", label: "Selesai" },
  ];

  // --- HELPER URL UNTUK GAMBAR DAN PDF ---
  const getFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/^(public|storage)\//, "");
    return `https://tuntasin.epistura.web.id/storage/${cleanPath}`;
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Manajemen Laporan</h2>

      {/* Filter: Search, Status Checklist, & Sorting */}
      <div className={styles.filter}>
        <div className={styles.filterTop}>
          <input
            type="text"
            className={styles.search}
            placeholder="Cari judul, pelapor, atau lokasi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className={styles.sort}>
            <span className={styles.sortLabel}>Urutkan:</span>
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

        <div className={styles.filterBottom}>
          <span className={styles.filterStatusTitle}>Filter Status:</span>
          {statusOptions.map((status) => (
            <label key={status.value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status.value)}
                onChange={() => handleStatusCheckboxChange(status.value)}
                className={styles.checkboxInput}
              />
              <span className={getCheckboxTextClass(status.value)}>
                {status.label}
              </span>
            </label>
          ))}
          <div className={styles.total}>
            Total Data Ditampilkan: {filteredSubmissions.length}
          </div>
        </div>
      </div>

      {/* --- GRID KARTU LAPORAN ADMIN --- */}
      <div className={styles.grid}>
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, idx) => (
            <div key={idx} className={styles.skeletonCard}></div>
          ))
        ) : currentItems.length > 0 ? (
          currentItems.map((item) => {
            const badgeClass = getStatusBadgeClass(item.status);
            const selectClass = getStatusSelectClass(item.status);

            return (
              <div key={item.id} className={styles.card}>
                {/* Badge Status */}
                <div className={styles.statusBadgeContainer}>
                  <div className={badgeClass}>
                    {getStatusLabel(item.status)}
                  </div>
                </div>

                {/* Foto Laporan */}
                <div className={styles.imageSection}>
                  {item.images && item.images.length > 0 ? (
                    item.images.length === 1 ? (
                      <a
                        href={getFileUrl(item.images[0].url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Klik untuk memperbesar foto"
                        className={styles.singleImageLink}
                      >
                        <img
                          src={getFileUrl(item.images[0].url)}
                          alt="Lampiran Laporan"
                          className={styles.imageItem}
                        />
                      </a>
                    ) : (
                      <div className={styles.multiImageContainer}>
                        {item.images.map((img, index) => (
                          <a
                            key={index}
                            href={getFileUrl(img.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Lampiran ${index + 1} (Klik untuk memperbesar)`}
                            className={styles.multiImageLink}
                          >
                            <img
                              src={getFileUrl(img.url)}
                              alt={`Lampiran ${index + 1}`}
                              className={styles.imageItem}
                            />
                          </a>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className={styles.noImageContainer}>
                      Tidak ada foto
                    </div>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardBodyLeft}>
                    <div className={styles.reporterText}>
                      Pelapor:{" "}
                      <strong className={styles.reporterName}>
                        {item.user?.username || "Anonim"}
                      </strong>
                    </div>

                    <h3 className={styles.cardTitle}>{item.label}</h3>

                    <p className={styles.cardDescription}>{item.description}</p>
                    <div>
                      <div className={styles.locationRow}>
                        <MapPin
                          size={14}
                          color="#ef4444"
                          style={{ flexShrink: 0 }}
                        />
                        <LocationView locationString={item.location} />
                      </div>
                      {/* <iframe
                        title="Peta Lokasi"
                        width="100%"
                        height="70"
                        className={styles.mapFrame}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`}
                        allowFullScreen
                        loading="lazy"
                      ></iframe> */}
                    </div>
                  </div>

                  <div className={styles.cardBodyRight}>
                    {/* Kategori, Vote, & Tanggal */}
                    <div className={styles.meta}>
                      <span className={styles.metaItemVote}>
                        <Flame size={14} color="#ef4444" />{" "}
                        {item.votes_count || 0} Vote
                      </span>
                      <span className={styles.metaItemDate}>
                        <Clock size={12} />{" "}
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </span>
                      <span className={styles.metaItemCategory}>
                        <Tag size={14} /> {item.category?.name || "Umum"}
                      </span>
                    </div>

                    {/* Feedback & PDF */}
                    <div className={styles.feedbackBox}>
                      <div className={styles.feedbackTitle}>
                        <MessageSquare size={12} color="#3b82f6" />
                        Feedback:
                      </div>
                      <div
                        className={
                          item.feedback
                            ? styles.feedbackTextActive
                            : styles.feedbackTextEmpty
                        }
                      >
                        {item.feedback
                          ? item.feedback
                          : "Belum ada catatan feedback."}
                      </div>

                      {item.pdf_attachment && (
                        <a
                          href={getFileUrl(item.pdf_attachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.pdfDownloadLink}
                        >
                          <FileText size={12} /> Unduh Dokumen Proyek (PDF)
                        </a>
                      )}
                    </div>

                    <div className={styles.controls}>
                      <button
                        onClick={() =>
                          handleOpenFeedbackModal(item.id, item.feedback)
                        }
                        title="Edit Catatan Feedback & Lampiran"
                        className={styles.editButton}
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteSubmission(item.id)}
                        title="Hapus Laporan"
                        className={styles.deleteButton}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleDirectStatusChange(
                          item.id,
                          e.target.value,
                          item.feedback,
                        )
                      }
                      className={clsx(selectClass, styles.selectStatus)}
                    >
                      <option
                        value="pending"
                        className={styles.selectOptionDark}
                      >
                        Pending
                      </option>
                      <option
                        value="process"
                        className={styles.selectOptionDark}
                      >
                        Diproses
                      </option>
                      <option
                        value="invalid"
                        className={styles.selectOptionDark}
                      >
                        Invalid
                      </option>
                      <option
                        value="completed"
                        className={styles.selectOptionDark}
                      >
                        Selesai
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyGridMsg}>
            Tidak ada laporan yang ditemukan dengan filter tersebut.
          </div>
        )}
      </div>

      {/* --- MODAL FEEDBACK & UPLOAD PDF --- */}
      {showFeedbackModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              <MessageSquare
                size={20}
                color="#3b82f6"
                style={{ flexShrink: 0 }}
              />{" "}
              Catatan Feedback & Dokumen Proyek
            </h3>
            <p className={styles.modalDescription}>
              Tuliskan catatan progress penanganan dan lampirkan dokumen PDF
              resmi (RAB/Proposal) untuk transparansi publik.
            </p>

            <textarea
              rows="3"
              placeholder="Contoh: Tim sedang menuju ke lokasi perbaikan..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className={styles.modalTextarea}
            />

            <div className={styles.modalFileInputContainer}>
              <label className={styles.modalFileLabel}>
                📄 Lampirkan File PDF Proyek / RAB (Opsional):
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className={styles.modalFileInput}
              />
              {pdfFile && (
                <span className={styles.selectedFileName}>
                  Terpilih: {pdfFile.name}
                </span>
              )}
            </div>

            <div className={styles.modalButtonContainer}>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className={styles.modalCancelButton}
              >
                Batal
              </button>
              <button
                onClick={handleSaveFeedbackOnly}
                className={styles.modalSaveButton}
              >
                Simpan & Unggah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pager}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={
              currentPage === 1
                ? styles.pageButtonDisabled
                : styles.pageButtonActive
            }
          >
            Prev
          </button>

          <span className={styles.pageInfoText}>
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={
              currentPage === totalPages
                ? styles.pageButtonDisabled
                : styles.pageButtonActive
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
