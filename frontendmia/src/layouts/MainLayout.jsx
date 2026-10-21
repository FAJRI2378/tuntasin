import SideBar from '../components/Sidebar';
import SplashIntro from '../components/SplashIntro';
import styles from '../css/layouts/MainLayout.module.css'
import { Outlet } from "react-router-dom";

export default function MainLayout() {

  return (
    <div className={styles.container}>
      <SplashIntro />
      <SideBar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}