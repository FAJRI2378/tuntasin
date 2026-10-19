import { Camera } from "lucide-react";
import styles from "../css/pages/Create.module.css";
import { useRef, useState } from "react";

export default function Create() {
  const imageRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);

  function handleUpload() {
    if (imageRef.current) {
      imageRef.current.click();
    }
  }

  function handleSelectedImage(e) {
    console.log(e.target.files);
    if (selectedFiles.length == 0) {
      setSelectedFiles(
        Object.values(e.target.files).map((file) => {
          return file;
        }),
      );
    } else {
      setSelectedFiles((prev) => [
        ...prev,
        ...Object.values(e.target.files).map((file) => {
          return file;
        }),
      ]);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>Create Submission</div>
        <div className={styles.form}>
          <div className={styles.subject}>
            <input type="text" placeholder="Input Subject" />
          </div>
          <div className={styles.image}>
            <div className={styles.imageInput} onClick={handleUpload}>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectedImage}
              />
              <Camera size={32} />
            </div>
            <div className={styles.imageWrapper}>
              <div className={styles.imageLong}>
                {selectedFiles.length > 0 &&(
                  console.log(selectedFiles),
                  selectedFiles.map((file) => {
                    const imageObjectURL = URL.createObjectURL(file);

                    return (
                      <div className={styles.imageItem}>
                        <img src={imageObjectURL} alt="" />
                      </div>
                    );
                  }))}
              </div>
            </div>
          </div>
          <div className={styles.description}>
            <textarea name="" id=""></textarea>
          </div>
          <div className={styles.location}>
            
          </div>
        </div>
      </div>
    </div>
  );
}
