import { useNavigate } from "react-router-dom";
import styles from "../css/pages/Auth.module.css";
import icon from "../assets/iconSimple.svg";
import logo from "../assets/icon.svg";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Hash,
  ShieldCheck,
  MapPin,
  ThumbsUp,
  Activity,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import api from "../js/api";

const features = [
  // { icon: MapPin, text: "Report damage with an exact location" },
  // { icon: ThumbsUp, text: "Vote to decide what gets fixed first" },
  // { icon: Activity, text: "Track every repair in real-time" },
];

export default function Auth({ type }) {
  const [nik, setNik] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isValidType = ["login", "register"].includes(type);
  const safeType = isValidType ? type : "login";
  const isLogin = safeType === "login";

  useEffect(() => {
    if (!isValidType) navigate("/login", { replace: true });
  }, [isValidType, navigate]);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await api.get("/check");
        const data = response.data;

        if (data.valid) {
          // JIKA SUDAH LOGIN: Arahkan admin ke /admin, user biasa ke /home
          navigate(data.is_admin ? "/admin" : "/home");
        }
      } catch (error) {
        // belum login, tetap di halaman ini
      }
    };

    verify();
  }, []);

  const inputs = {
    login: [
      {
        id: "email",
        label: "email",
        placeholder: "Input Email",
        type: "email",
        icon: Mail,
        autoComplete: "email",
        value: email,
        setValue: setEmail,
      },
      {
        id: "password",
        label: "password",
        placeholder: "Input Password",
        type: "password",
        icon: Lock,
        autoComplete: "current-password",
        value: password,
        setValue: setPassword,
      },
    ],
    register: [
      {
        id: "nik",
        label: "NIK",
        placeholder: "Input NIK",
        type: "text",
        icon: Hash,
        autoComplete: "off",
        value: nik,
        setValue: setNik,
      },
      {
        id: "username",
        label: "username",
        placeholder: "Input Username",
        type: "text",
        icon: User,
        autoComplete: "username",
        value: username,
        setValue: setUsername,
      },
      {
        id: "email",
        label: "email",
        placeholder: "Input Email",
        type: "email",
        icon: Mail,
        autoComplete: "email",
        value: email,
        setValue: setEmail,
      },
      {
        id: "password",
        label: "password",
        placeholder: "Input Password",
        type: "password",
        icon: Lock,
        autoComplete: "new-password",
        value: password,
        setValue: setPassword,
      },
      {
        id: "confirmPassword",
        label: "confirm password",
        placeholder: "Input Confirm Password",
        type: "password",
        icon: ShieldCheck,
        autoComplete: "new-password",
        value: confirmPassword,
        setValue: setConfirmPassword,
      },
    ],
  };

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const response = await api.post("login", {
        email: email,
        password: password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // SETELAH KLIK LOGIN: Arahkan admin ke /admin, user biasa ke /home
      navigate(user.role === "admin" ? "/admin" : "/home");
    } catch (error) {
      console.error("Login Error:", error.response);
      const errorMessage =
        error.response?.data?.message || "Email atau password salah!";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password != confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Confirm your password",
        text: "Password dan Confirm Password tidak sama",
      });
      return;
    }

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

      // SETELAH REGISTER: Arahkan langsung ke halaman /home
      navigate("/home");
    } catch (error) {
      console.error("Register Error:", error.response);
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : null) ||
        "Gagal melakukan registrasi!";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    isLogin ? handleLogin() : handleRegister();
  };

  return (
    <div className={styles.container}>
      <div className={styles.blobA} />
      <div className={styles.blobB} />

      <div className={styles.panel}>
        {/* ---------- LEFT ---------- */}
        <div className={styles.panelLeft}>
          <div className={styles.logoWrapper}>
            <div className={styles.icon}>
              <img src={icon} alt="" />
            </div>
            <div className={styles.logo}>
              <img src={logo} alt="tuntasin" />
            </div>
          </div>

          <div className={styles.about}>
            <div className={styles.abtTitle}>
              Report Local Issues, <span>Resolved</span> Faster.
            </div>
            <div className={styles.abtDescription}>
              Empowering citizens to submit infrastructure complaints, track
              public service repairs in real-time, and hold local government
              departments accountable.
            </div>
          </div>

          <ul className={styles.features}>
            {features.map((f) => (
              <li key={f.text}>
                <span className={styles.featureIcon}>
                  <f.icon size={16} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- RIGHT ---------- */}
        <div className={styles.panelRight}>
          <div className={styles.headWrap}>
            <div className={styles.title}>
              {isLogin ? "Welcome Back" : "Create an Account"}
            </div>
            <div className={styles.subtitle}>
              {isLogin
                ? "Sign in to continue tracking your reports."
                : "Join your community and start reporting."}
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formInput}>
              {inputs[safeType].map((item) => {
                const isPasswordInput =
                  item.id === "password" || item.id === "confirmPassword";
                const Icon = item.icon;

                return (
                  <div key={item.id} className={styles.field}>
                    <label htmlFor={item.id}>{item.label}</label>
                    <div className={styles.inputWrap}>
                      <Icon size={16} className={styles.leftIcon} />
                      <input
                        type={
                          isPasswordInput
                            ? showPassword
                              ? "text"
                              : "password"
                            : item.type
                        }
                        id={item.id}
                        placeholder={item.placeholder}
                        autoComplete={item.autoComplete}
                        value={item.value}
                        onChange={(e) => item.setValue(e.target.value)}
                        className={isPasswordInput ? styles.hasRight : ""}
                      />
                      {isPasswordInput && (
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className={styles.spin} /> Please wait...
                </>
              ) : (
                <>
                  {isLogin ? "Login" : "Register"} <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className={styles.addition}>
              {isLogin
                ? "Doesn't have an account?"
                : "Already have an account?"}
              <span
                onClick={() => navigate(`/${isLogin ? "register" : "login"}`)}
              >
                {isLogin ? " Register" : " Login"}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}