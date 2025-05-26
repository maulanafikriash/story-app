import {
  subscribeToPushNotification,
  unsubscribeFromPushNotification,
} from "../services/api.js";
import Swal from "sweetalert2";

const vapidPublicKey =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function checkSubscriptionStatus(swReg) {
  const existingSubscription = await swReg.pushManager.getSubscription();
  if (Notification.permission !== "granted" || !existingSubscription) {
    localStorage.setItem("isSubscribedToPush", "false");
  } else {
    localStorage.setItem("isSubscribedToPush", "true");
  }
}

export async function handlePushSubscription(swReg) {
  try {
    const existingSubscription = await swReg.pushManager.getSubscription();

    if (existingSubscription) {
      console.log("Sudah memiliki subscription aktif.");

      const isAlreadySynced =
        localStorage.getItem("isSubscribedToPush") === "true";
      if (!isAlreadySynced) {
        const response = await subscribeToPushNotification(
          existingSubscription
        );
        console.log("Sync ulang ke server:", response);
        localStorage.setItem("isSubscribedToPush", "true");

        Swal.fire({
          icon: "success",
          title: "Notifikasi diaktifkan!",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      }

      return;
    }

    // Jika tidak ada subscription → baru minta izin
    const permission = await Notification.requestPermission();
    console.log("Status permission:", permission);

    if (permission !== "granted") {
      console.log("Izin notifikasi tidak diberikan.");
      localStorage.setItem("isSubscribedToPush", "false");
      return;
    }

    // Jika permission diberikan, buat subscription baru
    const newSubscription = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const response = await subscribeToPushNotification(newSubscription);
    console.log("Berhasil subscribe notifikasi push:", response);
    localStorage.setItem("isSubscribedToPush", "true");

    Swal.fire({
      icon: "success",
      title: "Notifikasi diaktifkan!",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  } catch (err) {
    console.error("Gagal subscribe notifikasi:", err);
  }
}

export async function handlePushUnsubscription(swReg) {
  try {
    const existingSubscription = await swReg.pushManager.getSubscription();

    if (!existingSubscription) {
      console.log("Tidak ada subscription yang aktif.");
      return;
    }

    const unsubscribed = await existingSubscription.unsubscribe();

    if (unsubscribed) {
      const response = await unsubscribeFromPushNotification(
        existingSubscription.endpoint
      );
      console.log("Berhasil unsubscribe notifikasi push:", response);
      localStorage.setItem("isSubscribedToPush", "false");

      Swal.fire({
        icon: "info",
        title: "Notifikasi dimatikan",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } else {
      console.log("Gagal unsubscribe dari push manager.");
    }
  } catch (err) {
    console.error("Gagal unsubscribe notifikasi:", err);
  }
}
