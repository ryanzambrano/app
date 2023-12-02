import http from "k6/http";
import { check, sleep, group } from "k6";

export const options = {
  vus: 500,
  duration: "30s",
};

export default function () {
  const params = {
    headers: {
      apikey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ2MDM4MzUsImV4cCI6MjAwMDE3OTgzNX0.ng3kxKK2ZGkWtl2xkbaFoTqclkeTFNCr_Ca3e4O1tGc",
      // If you need to authenticate as a specific user, use the `Authorization` header instead
      // 'Authorization': 'Bearer YOUR_SUPABASE_JWT',
    },
  };
  // "https://jaupbyhwvfulpvkfxmgm.supabase.co/rest/v1/UGC",

  // Make sure you use the correct endpoint for your table, and include any query parameters you need
  group("Batch Requests", () => {
    // Execute several requests in a batch
    const responses = http.batch([
      [
        "GET",
        `https://jaupbyhwvfulpvkfxmgm.supabase.co/rest/v1/UGC`,
        null,
        params,
      ],
      [
        "GET",
        `https://jaupbyhwvfulpvkfxmgm.supabase.co/rest/v1/UGC`,
        null,
        params,
      ],
      [
        "GET",
        `https://jaupbyhwvfulpvkfxmgm.supabase.co/rest/v1/profile`,
        null,
        params,
      ],
      // Add more requests as needed
    ]);

    // Check each response
    for (let i = 0; i < responses.length; i++) {
      check(responses[i], {
        [`is status 200 for request ${i + 1}`]: (r) => r.status === 200,
        [`is not error for request ${i + 1}`]: (r) => !r.body.includes("error"),
      });
    }
  });

  sleep(1); // Sleep for 1 second between iterations
}
