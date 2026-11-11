import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  UserRound,
  Tag,
  Pencil,
  Image as ImageIcon,
  ExternalLink,
  MessageSquareText,
} from "lucide-react";

import api from "../js/api";
import Swal from "sweetalert2";
import styles from "../css/pages/ViewSubmission.module.css";
import { getAddressName } from "../components/LocationView";

export default function ViewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  async function fetchSubmission() {
    try {
      const response = await api.get(`submissions/${id}`);
      const item = response.data.data || response.data;

      setSubmission(item);

      const parts = item.location.replace(/\s+/g, "").split(",");
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      const shortAddress = await getAddressName(lat, lng);
      setAddress(shortAddress);

    } catch (error) {
      console.error("Gagal mengambil laporan:", error);

      Swal.fire({
        title: "Gagal!",
        text: "Laporan tidak ditemukan atau terjadi kesalahan.",
        icon: "error",
      });

      navigate("/home");
    } finally {
      setIsLoading(false);
    }
  }

  // Mengubah path storage menjadi URL gambar
  function getImageUrl(image) {
    const path = typeof image === "string" ? image : image?.url;

    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const baseURL = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
    const cleanPath = path.replace(/^\/+/, "").replace(/^storage\//, "");

    return `${baseURL}/storage/${cleanPath}`;
  }

  // Format tanggal
  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Status laporan
  function getStatus(status) {
    const statusMap = {
      pending: {
        label: "Menunggu Verifikasi",
        className: styles.pending,
      },
      process: {
        label: "Disetujui",
        className: styles.approved,
      },
      invalid: {
        label: "Ditolak",
        className: styles.rejected,
      },
      completed: {
        label: "Selesai",
        className: styles.completed,
      },
    };

    return (
      statusMap[status?.toLowerCase()] || {
        label: status || "Tidak diketahui",
        className: styles.defaultStatus,
      }
    );
  }

  // Link Google Maps
  function getMapUrl(location) {
    if (!location) return null;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }

  if (isLoading) {
    return <div className={styles.loading}>Memuat Detail Laporan...</div>;
  }

  if (!submission) return null;

  const status = getStatus(submission.status);
  const images = submission.images || [];
  const categoryName = submission.category?.name || "Kategori tidak tersedia";

  // Feedback hanya ditampilkan jika admin memberikan isi feedback
  const feedback = submission.feedback?.trim();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.title}>Detail Submission</div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.layout}>
          {/* Informasi Laporan */}
          <div className={styles.main}>
            <div className={styles.card}>
              <div className={styles.sectionLabel}>INFORMASI LAPORAN</div>

              <h1 className={styles.subject}>{submission.label}</h1>

              <div className={styles.metadata}>
                <div className={styles.metaItem}>
                  <Tag size={17} />
                  <span>{categoryName}</span>
                </div>

                <div className={styles.metaItem}>
                  <CalendarDays size={17} />
                  <span>{formatDate(submission.created_at)}</span>
                </div>

                {submission.user?.name && (
                  <div className={styles.metaItem}>
                    <UserRound size={17} />
                    <span>{submission.user.name}</span>
                  </div>
                )}
              </div>

              <div className={styles.divider} />

              <div className={styles.descriptionSection}>
                <h3>Deskripsi Laporan</h3>
                <p>{submission.description}</p>
              </div>
            </div>

            {/* Feedback Admin */}
            {feedback && (
              <div className={styles.card}>
                <div className={styles.feedbackHeader}>
                  <div className={styles.sidebarTitle}>
                    <MessageSquareText size={20} />
                    Feedback Admin
                  </div>

                  <span className={styles.feedbackBadge}>Tanggapan</span>
                </div>

                <div className={styles.feedbackContent}>
                  <p>{feedback}</p>
                </div>
              </div>
            )}

            {/* Galeri Gambar */}
            <div className={styles.card}>
              <div className={styles.galleryHeader}>
                <div>
                  <h3>Dokumentasi Laporan</h3>
                  <p>{images.length} gambar terlampir</p>
                </div>

                <ImageIcon size={22} />
              </div>

              {images.length > 0 ? (
                <div className={styles.gallery}>
                  {images.map((image, index) => (
                    <div
                      key={image.id || index}
                      className={styles.imageItem}
                      onClick={() => setSelectedImage(getImageUrl(image))}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Dokumentasi ${index + 1}`}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyImages}>
                  <ImageIcon size={35} />
                  <span>Belum ada gambar dokumentasi.</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Lokasi */}
            <div className={styles.card}>
              <div className={styles.sidebarTitle}>
                <MapPin size={19} />
                Lokasi Laporan
              </div>

              <div className={styles.locationValue}>
                {address || "Lokasi tidak tersedia"}
              </div>

              {submission.location && (
                <a
                  href={getMapUrl(submission.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapLink}
                >
                  Lihat di Google Maps
                  <ExternalLink size={15} />
                </a>
              )}
            </div>

            {/* Status */}
            <div className={styles.card}>
              <div className={styles.sidebarTitle}>Status Laporan</div>

              <div className={`${styles.statusLarge} ${status.className}`}>
                {status.label}
              </div>

              <p className={styles.statusDescription}>
                Status terkini dari laporan yang kamu kirimkan.
              </p>
            </div>

            {/* Action */}
            <div className={styles.actionCard}>
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => navigate(`/edit/${submission.id}`)}
              >
                <Pencil size={17} />
                Edit Laporan
              </button>

              <button
                type="button"
                className={styles.backActionBtn}
                onClick={() => navigate("/home")}
              >
                <ArrowLeft size={17} />
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className={styles.imageModal}
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className={styles.closeModal}
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>

          <img
            src={selectedImage}
            alt="Preview dokumentasi"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
