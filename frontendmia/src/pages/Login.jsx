import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from "../css/pages/Auth.module.css";
import icon from "../assets/iconSimple.svg"; 
import logo from "../assets/icon.svg";
import api from "../js/api"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("login", {
        email: email,
        password: password,
      });

      // Ambil token dan data user dari respons Laravel
      const { token, user } = response.data;

      // Simpan token dan data user ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ----------------------------------------------------
      // PERBAIKAN: Redirect berdasarkan ROLE user
      // ----------------------------------------------------
      if (user.role === 'admin') {
        navigate("/admin"); // Jika admin, arahkan ke dashboard admin
      } else {
        navigate("/");      // Jika warga biasa, arahkan ke halaman utama
      }
      // ----------------------------------------------------

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
      <div className={styles.panel}>
        
        {/* Panel Kiri (Logo & Tombol Back) */}
        <div className={styles.panelLeft}>
          <div className={styles.logoWrapper}>
            <img src={icon} alt="Icon" className={styles.icon} />
            <img src={logo} alt="Tuntasin" className={styles.logo} />
          </div>
          <div className={styles.abtTitle}>
            Welcome Back
          </div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'black', textDecoration: 'none', marginTop: '1rem' }}>
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        {/* Panel Kanan (Form Login) */}
        <div className={styles.panelRight}>
          <h2 className={styles.title}>Sign In</h2>
          
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.formInput}>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <div className={styles.addition}>
            Don't have an account? 
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <span>Register</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}