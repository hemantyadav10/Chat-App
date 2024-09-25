import { create } from "zustand";
import { useUserStore } from "./userStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  chatMessages: [],
  loadingMessages: true,
  showfullImage: false,
  imageUrl: '',
  fetchChatMessages: (chatId) => {
    if (chatId) {
      set({ chatMessages: null, loadingMessages: true })
      const unsub = onSnapshot(doc(db, "chats", chatId), (res) => {
        set({
          chatMessages: res.data(),
          loadingMessages: false,
        })
      });

      return unsub;
    }
  },
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // CHECK IF CURRENT USER IS BLOCKED
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }

    // CHECK IF RECEIVER IS BLOCKED
    else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
  openImageInFullScreen: (url) => {
    set({ showfullImage: true, imageUrl: url })
  },
  closeFullScreenImage: () => {
    set({ showfullImage: false, imageUrl: '' })
  }
}));