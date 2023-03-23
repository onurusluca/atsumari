<script setup lang="ts">
import type { MessagesType } from "@/api/types";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const route = useRouter();

onMounted(async () => {
  await handleReadMessages();
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
      .range(0, 9)
      .eq("space_id", generalStore.spaceId);
    if (messages) {
      spaceMessages.value = messages;
      // Hide loading placeholder
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
const handleCreateMessage = async () => {
  try {
    const { data, error } = await supabase.from("messages").insert([
      {
        message: message.value,
        user_id: authStore?.session?.user?.id,
        space_id: generalStore.spaceId,
      },
    ]);
    if (error) {
      throw error;
    } else {
    }
  } catch (error: any) {
    console.log("CREATE MESSAGE CATCH ERROR: ", error.message);
  }
};
</script>

<template>
  <div class="chat">
    <ul v-for="(message, index) in spaceMessages" :key="index">
      <li> {{ message.user_id.slice(0, 4) }}: {{ message.message }}</li>
    </ul>

    <div class="chat__input">
      <input
        type="text"
        v-model="message"
        placeholder="Type a message..."
        @keyup.enter="handleCreateMessage"
      />
    </div>
  </div>
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
  box-shadow: 0px 3px 8px var(--shadow);
}
</style>
