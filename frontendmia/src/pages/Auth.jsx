import { useNavigate, useParams } from "react-router-dom";
import styles from "../css/pages/Auth.module.css";
import icon from "../assets/iconSimple.svg";
import logo from "../assets/icon.svg";
import { ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import { useState } from "react";
import api from "../js/api";

export default function Auth({ type }) {
  const [nik, setNik] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!["login", "register"].includes(type)) {
    return;
  }

  const isLogin = type == "login";

  const inputs = {
    login: [
      {
        id: "email",
        label: "email",
        placeholder: "Input Email",
        type: "email",
        value: email,
        setValue: setEmail,
      },
      {
        id: "password",
        label: "password",
        placeholder: "Input Pasword",
        type: "password",
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
        value: nik,
        setValue: setNik,
      },
      {
        id: "username",
        label: "username",
        placeholder: "Input Username",
        type: "text",
        value: username,
        setValue: setUsername,
      },
      {
        id: "email",
        label: "email",
        placeholder: "Input Email",
        type: "email",
        value: email,
        setValue: setEmail,
      },
      {
        id: "password",
        label: "password",
        placeholder: "Input Pasword",
        type: "password",
        value: password,
        setValue: setPassword,
      },
      {
        id: "confirmPassword",
        label: "confirm password",
        placeholder: "Input Confirm Passoword",
        type: "password",
        value: confirmPassword,
        setValue: setConfirmPassword,
      },
    ],
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("login", {
        email: email,
        password: password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      // ----------------------------------------------------
    } catch (error) {
      console.error("Login Error:", error.response);
      const errorMessage =
        error.response?.data?.message || "Email atau password salah!";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password != confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Confirm your password",
        text: "Password and Confirm Password doesn't match",
      });
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

      navigate("/");
    } catch (error) {
      console.error("Register Error:", error.response);
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : null) ||
        "Gagal melakukan registrasi!";
          if (password != confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage
      });
    }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.panelLeft}>
          <div className={styles.logoWrapper}>
            <div className={styles.icon}>
              <img src={icon} alt="" />
            </div>
            <div className={styles.logo}>
              <img src={logo} alt="" />
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
        </div>
        <div className={styles.panelRight}>
          <div className={styles.title}>
            {isLogin ? "Welcome Back" : "Create an Account"}
          </div>
          <div className={styles.form}>
            <div className={styles.formInput}>
              {inputs[type].map((item) => {
                return (
                  <div className={styles[item.id]}>
                    <label htmlFor={item.id}>{item.label}</label>
                    <input
                      type={item.type}
                      id={item.id}
                      placeholder={item.placeholder}
                      value={item.value}
                      onChange={(e) => item.setValue(e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
            <div
              className={styles.submitBtn}
              onClick={(e) => (isLogin ? handleLogin(e) : handleRegister(e))}
            >
              {isLogin ? "Login" : "Register"} <ArrowRight size={16} />
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
