<script setup lang="ts">
import type { MessagesType } from "@/api/types";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const route = useRouter();

onMounted(async () => {
  await handleReadMessages();
  // Scroll to bottom of messagesContainerRef
  if ((y.value, messagesContainerRef.value)) {
    y.value = messagesContainerRef.value?.scrollHeight;
  }
});

let messagesContainerRef = ref<HTMLElement | null>(null);
const { arrivedState, y, directions } = useScroll(messagesContainerRef, {
  // Smooth scrolling
  behavior: "smooth",
  /* offset: { bottom: 100 } ,*/
});

/****************************************
 * API CALLS
 ****************************************/

let spaceMessages = ref<MessagesType[]>([]);

const handleReadMessages = async () => {
  try {
    let { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("space_id", generalStore.spaceId);
    if (messages) {
      spaceMessages.value = messages;
      // Scroll to bottom of messagesContainerRef
      setTimeout(() => {
        if ((y.value, messagesContainerRef.value)) {
          y.value = messagesContainerRef.value?.scrollHeight;
        }
      }, 0);

      console.log("messages: ", messages);
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("READ MESSAGE CATCH ERROR: ", error.message);
  }
};

// Realtime
supabase
  .channel("custom-all-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "messages" },
    async () => {
      console.log("Messages changed!");
      await handleReadMessages();
    }
  )
  .subscribe();

let message = ref<string>("");
let showMessageSendingLoading = ref<boolean>(false);

const handleCreateMessage = async () => {
  showMessageSendingLoading.value = true;

  try {
    const { data, error } = await supabase.from("messages").insert([
      {
        message: message.value,
        user_id: authStore?.session?.user?.id,
        user_name: generalStore.userName,
        space_id: generalStore.spaceId,
      },
    ]);
    if (error) {
      throw error;
    } else {
      message.value = "";
      showMessageSendingLoading.value = false;
    }
  } catch (error: any) {
    console.log("CREATE MESSAGE CATCH ERROR: ", error.message);
  }
};
</script>

<template>
  <div class="chat">
    <ul class="chat__messages" ref="messagesContainerRef">
      <li
        v-for="(message, index) in spaceMessages"
        :key="index"
        class="messages__message"
        :class="
          message.user_id === authStore?.session?.user?.id ? 'messages__my-message' : ''
        "
      >
        {{ message.user_name }}: {{ message.message }}</li
      >
    </ul>

    <div class="chat__send-message">
      <div class="send-message__input-container">
        <input
          type="text"
          v-model="message"
          placeholder="Type a message..."
          @keyup.enter="handleCreateMessage"
          class="input-container__input"
        />
        <button @click="handleCreateMessage" class="input-container__send-button">
          <carbon:send v-show="!showMessageSendingLoading" style="font-size: 1.8rem" />
          <svg-spinners:90-ring-with-bg
            style="font-size: 1.8rem"
            v-show="showMessageSendingLoading"
          />
        </button>
      </div> </div
  ></div>
</template>

<style scoped lang="scss">
.chat {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 4rem; // height of bottom control

  width: 25rem;
  background-color: var(--bg-300);
  border-left: 1px solid var(--border);
  box-shadow: 0px -20px 10px 3px rgba(0, 0, 0, 0.2);
  z-index: $space-sidebar-z-index;

  .chat__messages {
    overflow-y: auto;
    height: 95%;
    padding: 0.5rem;

    // Message bubble
    .messages__message {
      margin-bottom: 0.3rem;
      padding: 0.5rem 0.5rem 0.5rem 0.5rem;
      border-radius: 0.2rem;
      background-color: var(--bg-200);
      color: var(--f-color);
    }
    .messages__my-message {
      background-color: var(--brand-green);
    }
  }
  .chat__send-message {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    height: 3.5rem;
    padding: 0 0.2rem 0 0.1rem;
    background-color: var(--bg-300);
    border-top: 1px solid var(--border);

    .send-message__input-container {
      position: relative;

      width: 100%;
      height: 100%;
      .input-container__input {
        width: 86%;
        height: 100%;
        padding: 0 0.5rem;

        border: none;
        border-radius: 0.2rem;
        outline: 2px solid transparent;

        font-weight: 500;
        background-color: var(--text-input-bg);
        color: var(--f-color);

        &:focus {
          transition: 0.1s;
          outline: 2px solid var(--input-focus-border);
        }
      }

      .input-container__send-button {
        position: absolute;
        right: 0rem;
        top: 0em;

        height: 100%;
        width: 13%;

        color: var(--text-100);
        background-color: var(--shadow);
        border: none;
        font-size: 1.1rem;
        cursor: pointer;

        &:hover {
          background-color: var(--shadow-darker);
        }
      }
    }
  }
}
</style>
