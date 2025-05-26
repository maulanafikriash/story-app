import { getStories } from "../services/api.js";
import {
  saveStories,
  getAllStories,
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../utils/indexedDB.js";

export function renderHome(container) {
  container.innerHTML = `
    <h2 class="stories-list">All Stories</h2>
    <div id="stories-list" class="stories-list"></div>
  `;

  const storiesList = document.getElementById("stories-list");

  async function displayStories(stories) {
    storiesList.innerHTML = "";

    if (stories.length === 0) {
      storiesList.innerHTML = `<p>No stories available.</p>`;
      return;
    }

    stories.forEach(async (story) => {
      const storyItem = document.createElement("div");
      storyItem.className = "story-item";

      const maxLength = 100;
      const shortDescription =
        story.description.length > maxLength
          ? story.description.substring(0, maxLength) + "..."
          : story.description;

      const isFav = await isFavorite(story.id);

      storyItem.innerHTML = `
        <div class="story-img-wrapper">
          <img src="${story.photoUrl}" alt="foto">
           <button class="favorite-btn" data-id="${
             story.id
           }">
          <i class="${
            isFav ? "fas" : "far"
          } fa-heart" style="color: #ff5e5e;"></i>
        </button>
        </div>
        <div class="story-info">
          <h3>${story.name}</h3>
          <p>${shortDescription}</p>
          <a href="#detail?id=${story.id}" class="view-detail">View Detail</a>
          
        </div>
      `;

      storiesList.appendChild(storyItem);
    });

    storiesList.addEventListener("click", async (e) => {
      if (e.target.closest(".favorite-btn")) {
        const btn = e.target.closest(".favorite-btn");
        const id = btn.getAttribute("data-id");
        const story = stories.find((s) => s.id === id);
        const fav = await isFavorite(id);

        if (fav) {
          await removeFavorite(id);
          btn.innerHTML = `<i class="far fa-heart" style="color: #ff5e5e;"></i>`;
        } else {
          await addFavorite(story);
          btn.innerHTML = `<i class="fas fa-heart" style="color: #ff5e5e;"></i>`;
        }
      }
    });

    document.querySelector(".skip-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      const firstDetailButton = document.querySelector(".view-detail");
      if (firstDetailButton) {
        firstDetailButton.focus();
      }
    });
  }

  async function loadStories() {
    try {
      const data = await getStories();
      if (!data.error) {
        await saveStories(data.listStory);
        displayStories(data.listStory);
      } else {
        const offlineStories = await getAllStories();
        displayStories(offlineStories);
      }
    } catch (error) {
      const offlineStories = await getAllStories();
      displayStories(offlineStories);
    }
  }

  loadStories();
}
