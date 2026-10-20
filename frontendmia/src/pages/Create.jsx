import { Camera } from "lucide-react";
import styles from "../css/pages/Create.module.css";
import { useRef, useState } from "react";

export default function Create() {
  const imageRef = useRef(null);

  // State Form Input
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      formData.append("category_name", categoryName || "Umum");

      // Menambahkan array gambar
      selectedFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      const response = await fetch("http://127.0.0.1:8000/api/submissions", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Submission berhasil dibuat!");
        // Reset Form
        setLabel("");
        setDescription("");
        setLocation("");
        setCategoryName("");
        setSelectedFiles([]);
      } else {
        console.error("Error Validation:", result);
        alert(result.message || "Gagal membuat submission.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Gagal terhubung ke server Laravel!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>Create Submission</div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.subject}>
            <input
              type="text"
              placeholder="Input Subject"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          {/* Kategori */}
          <div className={styles.category}>
            <input
              type="text"
              placeholder="Input Kategori (Opsional)"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>

          {/* Input & Preview Gambar */}
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
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className={styles.description}>
            <textarea
              placeholder="Input Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Lokasi */}
          <div className={styles.location}>
            <input
              type="text"
              placeholder="Input Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}