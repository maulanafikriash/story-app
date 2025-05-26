import { getStoryDetail } from "../services/api.js";
import { saveStories, getStoryById } from "../utils/indexedDB.js";

export function renderDetailStory(container, id) {
  container.innerHTML = `
    <div class="detail-story">
      <h2>Story Detail</h2>
      <div id="story-detail"></div>
    </div>
  `;
  const detailContainer = document.getElementById("story-detail");

  async function loadDetail() {
    try {
      const data = await getStoryDetail(id);
      if (!data.error) {
        const story = data.story;

        detailContainer.innerHTML = `
          <div class="story-content">
            <div class="story-image">
              <img src="${story.photoUrl}" alt="foto">
            </div>
            <div class="story-info">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              <p class="story-date">Created at: ${new Date(
                story.createdAt
              ).toLocaleString()}</p>
            </div>
          </div>
          <div id="detail-map" class="story-map"></div>
        `;

        await saveStories([story]);

        if (story.lat && story.lon) {
          if (window.L) {
            const map = L.map("detail-map").setView([story.lat, story.lon], 13);
            L.tileLayer(
              "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ).addTo(map);
            L.marker([story.lat, story.lon])
              .addTo(map)
              .bindPopup(`<b>${story.name}</b>`)
              .openPopup();
          } else {
            console.error("Leaflet.js belum dimuat.");
          }
        } else {
          document.getElementById(
            "detail-map"
          ).innerHTML = `<p class="no-location">Lokasi story tidak ada.</p>`;
        }
      } else {
        throw new Error("Error fetching story details from API");
      }
    } catch (error) {
      console.warn(
        "Gagal mengambil data dari API, mencoba ambil data offline:",
        error
      );
      const offlineStory = await getStoryById(id);
      if (offlineStory) {
        detailContainer.innerHTML = `
          <div class="story-content">
            <div class="story-image">
              <img src="${offlineStory.photoUrl}" alt="${
          offlineStory.description
        }">
            </div>
            <div class="story-info">
              <h3>${offlineStory.name}</h3>
              <p>${offlineStory.description}</p>
              <p class="story-date">Created at: ${new Date(
                offlineStory.createdAt
              ).toLocaleString()}</p>
            </div>
          </div>
          <div id="detail-map" class="story-map"></div>
        `;

        if (offlineStory.lat && offlineStory.lon) {
          if (window.L) {
            const map = L.map("detail-map").setView(
              [offlineStory.lat, offlineStory.lon],
              13
            );
            L.tileLayer(
              "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ).addTo(map);
            L.marker([offlineStory.lat, offlineStory.lon])
              .addTo(map)
              .bindPopup(`<b>${offlineStory.name}</b>`)
              .openPopup();
          } else {
            console.error("Leaflet.js belum dimuat.");
          }
        } else {
          document.getElementById(
            "detail-map"
          ).innerHTML = `<p class="no-location">Lokasi story tidak ada.</p>`;
        }
      } else {
        detailContainer.innerHTML = `<p>Error fetching story details, dan data offline tidak tersedia.</p>`;
      }
    }
  }

  loadDetail();
}
