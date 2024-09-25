import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export const useUserStore = create((set) => ({
  currentUser: null,
  loading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, loading: false });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), loading: false });
      } else {
        set({ currentUser: null, loading: false });
      }
    } catch (error) {
      console.log(error.message)
      return set({ currentUser: null, loading: false });
    }
  }
}))