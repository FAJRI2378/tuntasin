import SideBar from '../components/Sidebar';
import styles from '../css/layouts/MainLayout.module.css'
import { Outlet } from "react-router-dom";

export default function MainLayout() {

  return (
    <div className={styles.container}>
      <SideBar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}