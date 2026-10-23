import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from "../css/pages/Auth.module.css";
import icon from "../assets/iconSimple.svg"; 
import logo from "../assets/icon.svg";
import api from "../js/api";

export default function Register() {
  const [nik, setNik] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Kirim data registrasi ke backend Laravel
      const response = await api.post("register", {
        nik: nik,
        username: username,
        email: email,
        password: password,
      });

      // 2. Ambil token dan user dari respons Laravel
      const { token, user } = response.data;

      // 3. Simpan ke localStorage agar otomatis login
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Registrasi berhasil!");
      // 4. Redirect ke halaman utama
      navigate("/");
    } catch (error) {
      console.error("Register Error:", error.response);
      const errorMessage = error.response?.data?.message || 
                           (error.response?.data?.errors ? Object.values(error.response.data.errors)[0][0] : null) || 
                           "Gagal melakukan registrasi!";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/login" className={styles.backBtn}>
        <ArrowLeft size={20} />
        Back to Login
      </Link>

      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <img src={icon} alt="Icon" className={styles.logoIcon} />
          <img src={logo} alt="Tuntasin" className={styles.logoText} />
        </div>

        <h2 className={styles.title}>Create Account</h2>
        
        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label>NIK</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your NIK"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        
        <div className={styles.linkText}>
          Already have an account? <Link to="/login" className={styles.link}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}