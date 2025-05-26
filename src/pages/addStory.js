import { addNewStory } from "../services/api.js";
import Swal from "sweetalert2";

export function renderAddStory(container) {
  container.innerHTML = `
    <div class="add-story-container">
      <h2>Add New Story</h2>
      <form id="add-story-form" class="add-story-form">
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description" rows="4" required></textarea>
        </div>

        <div class="form-group">
          <label for="photo">Photo:</label>
          <input type="file" id="photo" accept="image/*">
        </div>

        <div class="form-group camera-group">
          <label>Capture with Camera:</label>
          <div class="camera-container">
            <video id="video" autoplay></video>
            <canvas id="canvas" style="display:none;"></canvas>
            <div class="camera-buttons">
              <button type="button" id="start-camera">Start Camera</button>
              <button type="button" id="take-photo" disabled>Take Photo</button>
              <button type="button" id="stop-camera">Stop Camera</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Pick Location:</label>
          <div id="map" class="map-container"></div>
          <input type="hidden" id="lat">
          <input type="hidden" id="lon">
        </div>

        <div class="form-group">
          <button type="submit" class="submit-btn">Submit Story</button>
        </div>
      </form>
    </div>
  `;

  document.querySelector(".skip-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    setTimeout(() => document.getElementById("description")?.focus(), 0);
  });

  const map = L.map("map").setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  let marker;
  map.on("click", (e) => {
    const lat = e.latlng.lat.toFixed(6);
    const lon = e.latlng.lng.toFixed(6);
    document.getElementById("lat").value = lat;
    document.getElementById("lon").value = lon;
    if (marker) marker.setLatLng(e.latlng);
    else marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup(`Selected Location: ${lat}, ${lon}`).openPopup();
  });

  let stream;
  let photoBlob = null;
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const startBtn = document.getElementById("start-camera");
  const stopBtn = document.getElementById("stop-camera");
  const takeBtn = document.getElementById("take-photo");

  function stopCameraStream() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      takeBtn.disabled = true;
      video.srcObject = null;
    }
  }

  startBtn.addEventListener("click", async () => {
    if (navigator.mediaDevices?.getUserMedia) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      takeBtn.disabled = false;
    }
  });

  stopBtn.addEventListener("click", stopCameraStream);

  takeBtn.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      photoBlob = blob;

      let imgPreview = document.getElementById("photo-preview");
      if (!imgPreview) {
        imgPreview = document.createElement("img");
        imgPreview.id = "photo-preview";
        imgPreview.style.maxWidth = "100%";
        video.parentNode.appendChild(imgPreview);
      }
      imgPreview.src = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = imgPreview.src;
      a.download = "story-photo.jpg";
      a.click();
    }, "image/jpeg");
  });

  stopBtn.addEventListener("click", () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      takeBtn.disabled = true;
    }
  });

  function onHashChange() {
    if (window.location.hash !== "#addStory") {
      stopCameraStream();
    }
  }
  window.addEventListener("hashchange", onHashChange);

  // Handle form submit
  document
    .getElementById("add-story-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = document.getElementById("description").value;
      const latVal = document.getElementById("lat").value;
      const lonVal = document.getElementById("lon").value;
      const formData = new FormData();
      formData.append("description", description);
      if (photoBlob) formData.append("photo", photoBlob, "story-photo.jpg");
      else {
        const fileInput = document.getElementById("photo");
        if (fileInput.files[0]) formData.append("photo", fileInput.files[0]);
      }
      if (latVal) formData.append("lat", latVal);
      if (lonVal) formData.append("lon", lonVal);

      Swal.fire({
        title: "Uploading...",
        text: "Please wait while we upload your story.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const result = await addNewStory(formData);

      if (!result.error) {
        // Kirim subscription notifikasi
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          const payload = {
            endpoint: subscription.endpoint,
            keys: subscription.toJSON().keys,
          };
          const token = localStorage.getItem("token");
          await fetch(
            "https://story-api.dicoding.dev/v1/notifications/subscribe",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );
        }
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: result.message,
          confirmButtonText: "OK",
        }).then(() => (window.location.hash = "#home"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: result.message,
        });
      }
    });
}
