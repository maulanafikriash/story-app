import { renderHeader } from "../components/header.js";
const BASE_URL = "https://story-api.dicoding.dev/v1";

export async function registerUser(name, email, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!data.error) {
    localStorage.setItem("token", data.loginResult.token);

    renderHeader();

    window.location.hash = "#home";
  }

  return data;
}

export async function getStories() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/stories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getStoryDetail(id) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/stories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function addNewStory(formData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/stories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}

// Section-------
export async function subscribeToPushNotification(subscription) {
  const token = localStorage.getItem("token");

  const payload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.toJSON().keys.p256dh,
      auth: subscription.toJSON().keys.auth,
    },
  };

  const res = await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function unsubscribeFromPushNotification(endpoint) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });

  return res.json();
}
