import { useNavigate, useParams } from "react-router-dom";
import styles from "../css/pages/Auth.module.css";
import icon from "../assets/iconSimple.svg"
import logo from "../assets/icon.svg"

export default function Auth() {
  const { type } = useParams();
  const navigate = useNavigate();

  if (!["login", "register"].includes(type)) {
    return;
  }

  const isLogin = type == "login";

  const inputs = {
    login: [
      {
        label: "username",
        label: "username",
        placeholder: "Input Username or NIK",
        type: "text",
      },
      {
        label: "password",
        label: "password",
        placeholder: "Input Pasword",
        type: "password",
      },
      {
        label: "confirmPassword",
        label: "confirm password",
        placeholder: "Input Confirm Passoword",
        type: "password",
      },
    ],
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
        </div>
        <div className={styles.panelRight}>
          <div className={styles.title}>{isLogin ? "Login" : "Register"}</div>
          <div className={styles.form}>
            <div className={styles.formInput}>
              {inputs[type].map((item) => {
                return (
                  <div className={styles[item.id]}>
                    <label htmlFor={item.id}>{item.label}</label>
                    <input type={item.type} id={item.id} placeholder={item.placeholder} />
                  </div>
                );
              })}
            </div>
            <div className={styles.submitBtn}>
              {isLogin ? "Login" : "Register"}
            </div>
            <div className={styles.addition}>
              {isLogin
                ? "Doesn't have an account?"
                : "Already have an account?"}
              <span
                onClick={() =>
                  navigate(`/auth/${isLogin ? "register" : "login"}`)
                }
              >
                {isLogin ? " Create an account" : " Login"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
