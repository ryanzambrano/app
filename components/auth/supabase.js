import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key, value) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key) => {
    SecureStore.deleteItemAsync(key);
  },
};
const supabaseUrl = "https://jaupbyhwvfulpvkfxmgm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ2MDM4MzUsImV4cCI6MjAwMDE3OTgzNX0.ng3kxKK2ZGkWtl2xkbaFoTqclkeTFNCr_Ca3e4O1tGc";

export const supabase = createClient(
  "https://jaupbyhwvfulpvkfxmgm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ2MDM4MzUsImV4cCI6MjAwMDE3OTgzNX0.ng3kxKK2ZGkWtl2xkbaFoTqclkeTFNCr_Ca3e4O1tGc",
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export const picURL =
  "https://jaupbyhwvfulpvkfxmgm.supabase.co/storage/v1/object/public/user_pictures/";
