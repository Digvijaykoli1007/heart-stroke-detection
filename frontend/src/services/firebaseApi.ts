// src/services/firebaseApi.ts

const FIREBASE_URL = import.meta.env.VITE_FIREBASE_URL || "https://heart-m-default-rtdb.asia-southeast1.firebasedatabase.app/data.json";

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

    // Return the most recent reading, but only if it's fresh (last 15 seconds)
    const latest = values[values.length - 1] as { heartRate: number, spo2: number, time?: string };
    
    if (latest.time) {
      const dataTime = new Date(latest.time).getTime();
      const now = Date.now();
      
      // If data is older than 15 seconds, return null (waiting for ESP32)
      if (now - dataTime > 15000) {
        return null;
      }
    }

    return { heartRate: latest.heartRate, spo2: latest.spo2, time: latest.time };
    
  } catch (error) {
    console.error("🔥 Error fetching from Firebase:", error);
    return null; // Return null so the app doesn't crash if the internet drops
  }
};
