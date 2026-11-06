import { Camera, MapPin, Target, X } from "lucide-react";
import styles from "../css/pages/Create.module.css";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import api from "../js/api";
import Swal from "sweetalert2";
import MapLocation from "../components/Map";
import clsx from "clsx";

export default function Create() {
  const imageRef = useRef(null);
  const navigate = useNavigate(); // 2. Inisialisasi navigate

  // State Form Input Utama
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [userPosition, setUserPosition] = useState([-6.1753924, 106.8271528]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State Khusus Kategori
  const [adminCategories, setAdminCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await api.get("/check");
        const data = response.data;

        if (!data.valid) {
          navigate("/login");
        }
      } catch (error) {
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
    fetchCategories();
  }, []);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "Upss",
        text: "Browser kamu tidak mendukung Geolocation.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log([lat, lng]);
        setUserPosition([lat, lng]);
      },
      (error) => {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Upss",
          text: "Gagal mendapatkan lokasi. Pastikan GPS diizinkan di browser yaa!",
        });
      },
      { enableHighAccuracy: true },
    );
  }

  async function fetchCategories() {
    try {
      const response = await api.get("categories");
      setAdminCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    }
  }

  function handleUpload() {
    if (imageRef.current) {
      imageRef.current.click();
    }
  }

  function handleSelectedImage(e) {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  }

  function handleRemoveImage(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Submit Handler ke API Laravel
  // Submit Handler ke API Laravel
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

    if (selectedCategory === "other" && !customCategory.trim()) {
      Swal.fire({
        icon: "error",
        title: "Masih ada yang belum terisi!",
        text: "Harap ketik nama kategori baru Anda!",
      });
      return;
    }

    setIsLoading(true);

    try {
      let categoryIdToSubmit = selectedCategory;

      // Logika jika user memilih "Lainnya" dan mengetik kategori sendiri
      if (selectedCategory === "other") {
        const inputCategoryName = customCategory.trim();

        // 1. CEK VALIDASI: Apakah kategori yg diketik ternyata sudah dibuat Admin?
        const existingCat = adminCategories.find(
          (cat) => cat.name.toLowerCase() === inputCategoryName.toLowerCase(),
        );
        console.log(existingCat);

        if (existingCat) {
          categoryIdToSubmit = existingCat.id;
          setSelectedCategory(existingCat.id);
        }

        // 2. Jika benar-benar baru, buat kategorinya ke database dulu via API
        try {
          const catRes = await api.post("categories", {
            name: inputCategoryName,
          });

          // AMBIL ID DENGAN AMAN DI SINI:
          categoryIdToSubmit = catRes.data.id || catRes.data.data?.id;

          if (!categoryIdToSubmit) {
            throw new Error("ID kategori baru tidak valid dari server.");
          }
        } catch (catError) {
          console.error("Gagal membuat kategori baru:", catError);
          alert("Gagal menambahkan kategori baru ke server.");
          setIsLoading(false);
          return;
        }
      }

      // Siapkan data submission
      const formData = new FormData();
      formData.append("label", label);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("category_id", categoryIdToSubmit);

      selectedFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      // Mengirim laporan (submission)
      const response = await api.post("submissions", formData);

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Submission berhasil dibuat!",
        });
        navigate("/home");
      }
    } catch (error) {
      console.error("Detail Error:", error.response);
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : null) ||
        "Gagal terhubung ke server Laravel!";
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>Create Submission</div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formLeft}>
            <div className={styles.formLong}>
              {/* Subject / Label */}
              <div className={styles.subject}>
                <input
                  type="text"
                  placeholder="Input Subject / Judul Laporan"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>

              <div
                className={clsx(styles.description, styles.descriptionMobile)}
              >
                <div className={styles.descriptionLabel}>Input Description</div>
                <textarea
                  placeholder="Ceritakan detail kronologi atau kondisi di lapangan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Kategori Berbasis Admin Data */}
              <div
                className={styles.subject}
                style={{
                  marginTop: "15px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (e.target.value !== "other") setCustomCategory("");
                  }}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    outline: "none",
                    backgroundColor: "#1e293b",
                    color: "#fff",
                  }}
                >
                  <option value="" disabled>
                    -- Pilih Kategori Laporan --
                  </option>
                  {adminCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="other">Lainnya</option>
                </select>

                {/* Input tambahan jika memilih "Lainnya" */}
                {selectedCategory === "other" && (
                  <input
                    type="text"
                    placeholder="Ketik kategori baru (Misal: Tiang Listrik)"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Upload Gambar */}
              <div className={styles.image} style={{ marginTop: "15px" }}>
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
                    {selectedFiles.map((file, index) => {
                      const imageObjectURL = URL.createObjectURL(file);
                      return (
                        <div key={index} className={styles.imageItem}>
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

              {/* Lokasi Peta */}
              <div className={styles.location}>
                <div
                  className={styles.locationHead}
                  onClick={getCurrentLocation}
                >
                  <Target size={20} /> Gunakan Lokasi Saat ini
                </div>
                <div className={styles.locationMaps}>
                  <MapLocation
                    onLocationSelect={(coords) => setLocation(coords)}
                    currentCord={userPosition}
                  />
                </div>
                {location && (
                  <div className={styles.locationFoot}>
                    <MapPin size={14} /> Lokasi Terpilih: {location}
                  </div>
                )}
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
              >
                {isLoading ? "Submitting..." : "Submit Laporan"}
              </button>
            </div>
          </div>

          <div className={styles.formRight}>
            {/* Deskripsi */}
            <div className={styles.description}>
              <div className={styles.descriptionLabel}>Input Description</div>
              <textarea
                placeholder="Ceritakan detail kronologi atau kondisi di lapangan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
