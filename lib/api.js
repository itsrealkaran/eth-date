// API utility functions for ETGL integration

const API_BASE_URL = "https://arweave.tech/api/etgl";

// Get profile by URL
export async function getProfileByURL(url) {
  try {
    const encodedURL = encodeURIComponent(url);
    const response = await fetch(`${API_BASE_URL}/profile?url=${encodedURL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Profile fetch failed:", error);
    throw error;
  }
}

// Get profile by ID
export async function getProfileByID(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Profile fetch failed:", error);
    throw error;
  }
}

// Get profile by WorldID
export async function getProfileByWorldID(worldId) {
  try {
    const response = await fetch(`${API_BASE_URL}/id-by-worldid/${worldId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch profile by WorldID: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Profile fetch by WorldID failed:", error);
    throw error;
  }
}

// Set user gender with WorldID
export async function setUserGender(id, gender, worldId) {
  try {
    const response = await fetch(`${API_BASE_URL}/set-gender/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gender,
        worldid: worldId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set gender: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Set gender failed:", error);
    throw error;
  }
}
