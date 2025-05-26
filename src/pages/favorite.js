import { getAllFavorites, removeFavorite } from "../utils/indexedDB.js";

export function renderFavorite(container) {
  container.innerHTML = `
    <h2 class="stories-list">Favorite Stories</h2>
    <div id="favorites-list" class="favorites-list"></div>
  `;

  const favoritesList = document.getElementById("favorites-list");

  async function displayFavorites() {
    const favorites = await getAllFavorites();
    favoritesList.innerHTML = "";

    if (favorites.length === 0) {
      favoritesList.innerHTML = `<p>No favorite stories yet.</p>`;
      return;
    }

    favorites.forEach((story) => {
      const storyItem = document.createElement("div");
      storyItem.className = "story-item-fav";

      const maxLength = 100;
      const shortDescription =
        story.description.length > maxLength
          ? story.description.substring(0, maxLength) + "..."
          : story.description;

      storyItem.innerHTML = `
        <div class="story-img-wrapper" style="position: relative;">
          <img src="${story.photoUrl}" alt="${story.description}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
          <button class="remove-favorite-btn" data-id="${story.id}">
            <i class="fas fa-trash" style="color: #ff5e5e;"></i>
          </button>
        </div>
        <div class="story-info" style="padding: 10px;">
          <h3 style="margin: 0 0 10px 0;">${story.name}</h3>
          <p style="font-size: 14px; color: #555;">${shortDescription}</p>
          <a href="#detail?id=${story.id}" class="view-detail" style="display: inline-block; margin-top: 8px; color: #007bff;">View Detail</a>
        </div>
      `;

      favoritesList.appendChild(storyItem);
    });

    favoritesList.addEventListener("click", async (e) => {
      if (e.target.closest(".remove-favorite-btn")) {
        const btn = e.target.closest(".remove-favorite-btn");
        const id = btn.getAttribute("data-id");
        await removeFavorite(id);
        displayFavorites();
      }
    });
  }

  displayFavorites();
}
