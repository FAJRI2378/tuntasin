import { Camera, X } from "lucide-react";
import styles from "../css/pages/Create.module.css";
import { useRef, useState } from "react";
import api from "../js/api";
import MapLocation from "../components/Map";

export default function Create() {
  const imageRef = useRef(null);
  const categoryRef = useRef(null);

  // State Form Input
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleUpload() {
    if (imageRef.current) {
      imageRef.current.click();
    }
  }

  function handleAddCategory(e, category) {
    if (e.key == "Enter" && categoryRef.current && category.length > 0) {
      if (!categories.includes(category)) {
        setCategories((prev) => [...prev, category]);
      }

      setTimeout(() => {
        categoryRef.current.focus();
      }, 0);
    }
  }

  function handleRemoveCategory(index) {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSelectedImage(e) {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  }

  function handleRemoveImage(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Submit Handler ke API Laravel menggunakan Axios
  async function handleSubmit(e) {
    e.preventDefault();

    if (!label || !description || !location) {
      alert("Harap isi Subject/Label, Deskripsi, dan Lokasi!");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("label", label);
      formData.append("description", description);
      formData.append("location", location);
      formData.append(
        "categories",
        categories.length > 0 ? categories.join(",") : "Umum",
      );

      selectedFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      // Mengirim data menggunakan Axios instance
      const response = await api.post("submissions", formData);

      // Axios otomatis mengembalikan status sukses di range 2xx
      if (response.status === 200 || response.status === 201) {
        alert("Submission berhasil dibuat!");
        // Reset Form
        setLabel("");
        setDescription("");
        setLocation("");
        setCategories([]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error("Detail Error:", error.response);
      // Mengambil pesan error yang akurat dari validasi Laravel (jika ada)
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : null) ||
        "Gagal terhubung ke server Laravel!";
      alert(errorMessage);
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
              <div className={styles.subject}>
                <input
                  type="text"
                  placeholder="Input Subject"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className={styles.categories}>
                <input
                  ref={categoryRef}
                  type="text"
                  placeholder="Add Category (Opsional)"
                  onKeyDown={(e) => handleAddCategory(e, e.target.value)}
                  className={styles.addCategory}
                />
                <div className={styles.categoryWrapper}>
                  <div className={styles.categoryLong}>
                    {categories.map((category, index) => {
                      return (
                        <div className={styles.category}>
                          <div>{category}</div>
                          <div
                            className={styles.removeCategory}
                            onClick={() => handleRemoveCategory(index)}
                          >
                            <X size={12} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

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

              <div className={styles.location}>
                <MapLocation />
                {/* <input
                  type="text"
                  placeholder="Input Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                /> */}
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
          <div className={styles.formRight}>
            {/* Description */}
            <div className={styles.description}>
              <div className={styles.descriptionLabel}>Input Description</div>
              <textarea
                placeholder="Explain "
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
