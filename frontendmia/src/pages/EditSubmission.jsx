import { Camera, MapPin, Target, X } from "lucide-react";
import styles from "../css/pages/Create.module.css";
import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../js/api";
import Swal from "sweetalert2";
import MapLocation from "../components/Map";
import clsx from "clsx";
import { getAddressName } from "../components/LocationView";

export default function EditSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageRef = useRef(null);

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [userPosition, setUserPosition] = useState("");
  const [address, setAddress] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [adminCategories, setAdminCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [catRes, subRes] = await Promise.all([
          api.get("categories"),
          api.get(`submissions/${id}`),
        ]);

        const categories = catRes.data.data || catRes.data || [];
        const item = subRes.data.data || subRes.data;

        setAdminCategories(categories);

        setLabel(item.label || "");
        setDescription(item.description || "");
        setSelectedCategory(String(item.category_id || ""));

        // Lokasi laporan sebelumnya
        setLocation(item.location || "");

        // Ambil koordinat jika lokasi berupa string koordinat
        if (typeof item.location === "string") {
          setUserPosition(item.location);

          const parts = item.location.split(",");
          if (parts.length === 2) {
            const lat = Number(parts[0]);
            const lng = Number(parts[1]);

            if (!isNaN(lat) && !isNaN(lng)) {
              const locationName = await getAddressName(lat, lng);
              setAddress(locationName);
            }
          }
        }

        // Gambar yang sudah tersimpan
        setExistingImages(item.images || []);
      } catch (error) {
        console.error("Gagal memuat data:", error);

        Swal.fire({
          title: "Gagal!",
          text: "Laporan tidak ditemukan atau terjadi kesalahan.",
          icon: "error",
        });

        navigate("/home");
      } finally {
        setIsFetching(false);
      }
    }

    fetchInitialData();
  }, [id, navigate]);

  function handleUpload() {
    imageRef.current?.click();
  }

  function handleSelectedImage(e) {
    const files = Array.from(e.target.files);

    setSelectedFiles((prev) => [...prev, ...files]);

    e.target.value = "";
  }

  function handleRemoveImage(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleRemoveExistingImage(index) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!label || !description || !location || !selectedCategory) {
      Swal.fire({
        icon: "error",
        title: "Masih ada yang belum terisi!",
        text: "Harap isi Subject, Kategori, Deskripsi, dan Lokasi Peta!",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("label", label);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("category_id", selectedCategory);

      // Upload gambar baru
      selectedFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      // Kirim daftar gambar lama yang masih dipertahankan
      formData.append("existing_images", JSON.stringify(existingImages));

      await api.post(`submissions/${id}?_method=PUT`, formData);

      window.dispatchEvent(new Event("submissionUpdated"));

      await Swal.fire({
        title: "Berhasil!",
        text: "Laporan berhasil diperbarui!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/home");
    } catch (error) {
      console.error("Gagal memperbarui:", error.response || error);

      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui laporan.";

      Swal.fire({
        title: "Gagal!",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>
        Memuat Data...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>Edit Submission</div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formLeft}>
            <div className={styles.formLong}>
              {/* Subject / Label */}
              <div className={styles.subject}>
                <input
                  type="text"
                  placeholder="Judul Laporan"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>

              {/* Deskripsi */}
              <div className={styles.description}>
                <div className={styles.descriptionLabel}>
                  Masukkan Deskripsi
                </div>

                <textarea
                  placeholder="Ceritakan detail kronologi atau kondisi di lapangan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Kategori */}
              <div
                className={styles.subject}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <select
                  className={styles.categories}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    -- Pilih Kategori Laporan --
                  </option>

                  {adminCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Gambar */}
              <div className={styles.image}>
                <div className={styles.imageInput} onClick={handleUpload}>
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSelectedImage}
                    style={{ display: "none" }}
                  />

                  <Camera size={32} />
                </div>

                <div className={styles.imageWrapper}>
                  <div className={styles.imageLong}>
                    {/* Gambar lama */}
                    {existingImages.map((image, index) => (
                      <div key={`old-${index}`} className={styles.imageItem}>
                        <img
                          src={`https://tuntasin.epistura.web.id/storage/${
                            typeof image === "string" ? image : image.url
                          }`}
                          alt={`Gambar lama ${index}`}
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className={styles.removeBtn}
                        >
                          <X />
                        </button>
                      </div>
                    ))}

                    {/* Gambar baru */}
                    {selectedFiles.map((file, index) => {
                      const imageObjectURL = URL.createObjectURL(file);

                      return (
                        <div key={`new-${index}`} className={styles.imageItem}>
                          <img src={imageObjectURL} alt={`Preview ${index}`} />

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className={styles.removeBtn}
                          >
                            <X />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Lokasi Mobile */}
              <div className={clsx(styles.location, styles.locationMobile)}>
                <div className={styles.locationHead}>
                  <MapPin size={20} /> Lokasi Saat ini
                </div>

                <div className={styles.locationMaps}>
                  <MapLocation
                    onLocationSelect={(coords) => setLocation(coords)}
                  />
                </div>

                {(userPosition || address) && (
                  <div className={styles.locationFoot}>
                    <Target size={14} />
                    {address ? "Alamat" : "Koordinat"}:{" "}
                    {address || userPosition}
                  </div>
                )}
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
              >
                {isLoading ? "Saving..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>

          {/* Map Desktop */}
          <div className={styles.formRight}>
            <div className={styles.location}>
              <div className={styles.locationHead}>
                <MapPin size={20} /> Lokasi Saat ini
              </div>

              <div
                className={styles.locationMaps}
                style={{
                  borderRadius: userPosition
                    ? ".8rem 0 0 .8rem"
                    : ".8rem 0 0 0",
                  borderBottom: userPosition
                    ? "2px solid var(--electric)"
                    : "none",
                }}
              >
                <MapLocation
                  onLocationSelect={(coords) => setLocation(coords)}
                  height="100%"
                />
              </div>

              {(userPosition || address) && (
                <div className={styles.locationFoot}>
                  <Target size={14} />
                  {address ? "Alamat" : "Koordinat"}: {address || userPosition}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
