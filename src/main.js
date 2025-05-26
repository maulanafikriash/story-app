import { initRouter } from "./router.js";
import { renderHeader } from "./components/header.js";
import { checkSubscriptionStatus } from "./utils/pushManager.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

const token = localStorage.getItem("token");

if (!token) {
  window.location.hash = "#login";
}

if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(async (swReg) => {
      console.log("Service Worker terdaftar:", swReg);

      if (token) {
        await checkSubscriptionStatus(swReg);
      }
    })
    .catch((error) => {
      console.error("Gagal register Service Worker:", error);
    });
}

renderHeader();
initRouter();
