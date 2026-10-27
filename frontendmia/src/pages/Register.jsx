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

  // INI ADALAH FUNGSI YANG SEBELUMNYA HILANG
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("register", {
        nik: nik,
        username: username,
        email: email,
        password: password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Registrasi berhasil!");
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
      <div className={styles.panel}>
        
        {/* Panel Kiri (Logo & Tombol Back) */}
        <div className={styles.panelLeft}>
          <div className={styles.logoWrapper}>
            <img src={icon} alt="Icon" className={styles.icon} />
            <img src={logo} alt="Tuntasin" className={styles.logo} />
          </div>
          <div className={styles.abtTitle}>
            Create Account
          </div>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'black', textDecoration: 'none', marginTop: '1rem' }}>
            <ArrowLeft size={20} />
            Back to Login
          </Link>
        </div>

        {/* Panel Kanan (Form Register) */}
        <div className={styles.panelRight}>
          <h2 className={styles.title}>Sign Up</h2>
          
          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.formInput}>
              <div>
                <label>NIK</label>
                <input
                  type="text"
                  placeholder="Enter your NIK"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
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
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          
          <div className={styles.addition}>
            Already have an account? 
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <span>Sign In</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}