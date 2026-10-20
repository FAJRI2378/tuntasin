import { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import SplashIntro from "./components/SplashIntro";

export default function App() {
  // Set selalu true agar setiap Ctrl + R / refresh video selalu diputar ulang
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro ? (
        <SplashIntro onFinish={() => setShowIntro(false)} />
      ) : (
        <RouterProvider router={routes} />
      )}
    </>
  );
}