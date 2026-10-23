import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from "../css/pages/Auth.module.css";
import icon from "../assets/iconSimple.svg"; 
import logo from "../assets/icon.svg";
import api from "../js/api"; // Hubungkan dengan instance axios

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Kirim request login ke backend Laravel
      const response = await api.post("login", {
        email: email,
        password: password,
      });

      // 2. Ambil token dan data user dari respons Laravel
      const { token, user } = response.data;

      // 3. Simpan token dan data user ke localStorage agar terbaca oleh api.js
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Redirect ke halaman utama / dashboard
      navigate("/");
    } catch (error) {
      console.error("Login Error:", error.response);
      const errorMessage = error.response?.data?.message || "Email atau password salah!";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backBtn}>
        <ArrowLeft size={20} />
        Back
      </Link>

      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <img src={icon} alt="Icon" className={styles.logoIcon} />
          <img src={logo} alt="Tuntasin" className={styles.logoText} />
        </div>

        <h2 className={styles.title}>Welcome Back</h2>
        
        <form onSubmit={handleLogin}>
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className={styles.linkText}>
          Don't have an account? <Link to="/register" className={styles.link}>Register</Link>
        </div>
      </div>
    </div>
  );
}