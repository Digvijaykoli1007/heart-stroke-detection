// src/services/firebaseApi.ts

const FIREBASE_URL = "https://heart-m-default-rtdb.asia-southeast1.firebasedatabase.app/data.json";

export const fetchLatestVitals = async () => {
  try {
    const response = await fetch(FIREBASE_URL);
    const data = await response.json();

    if (!data) return null;

    // Convert the Firebase JSON object into an array and filter out any broken data
    const values = Object.values(data).filter(
      (item: any) => typeof item === "object" && item !== null && item.heartRate
    );

    if (values.length === 0) return null;

    // Return only the most recent reading
    return values[values.length - 1] as { heartRate: number, spo2: number };
    
  } catch (error) {
    console.error("🔥 Error fetching from Firebase:", error);
    return null; // Return null so the app doesn't crash if the internet drops
  }
};
