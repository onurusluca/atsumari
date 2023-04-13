<script setup lang="ts">
import { createPicker, NativeRenderer, i18n, lightTheme, darkTheme } from "picmo";
import { isDark } from "@/utils/dark";
import { vOnClickOutside } from "@vueuse/components";
import type { OnClickOutsideHandler } from "@vueuse/core";

import type { MessagesType } from "@/api/types";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();

// const route = useRouter();

const props = defineProps({
  chatOpened: {
    type: Boolean,
    required: true,
  },
});
let chatOpenedOnce = ref<boolean>(false);

let emojiPicker = ref<any>(null);
let messageReactionEmojiPicker = ref<any>(null);

onMounted(async () => {
  //await handleReadMessages();
  // Scroll to bottom of messagesContainerRef
  if ((y.value, messagesContainerRef.value)) {
    y.value = messagesContainerRef.value?.scrollHeight;
  }

  // Message input emoji picker
  const emojiPickerContainer = document.querySelector(".emojiPickerContainer");
  emojiPicker = createPicker({
    rootElement: emojiPickerContainer as HTMLElement,
    i18n: i18n as any,
    locale: locale.value === "en" ? "en" : "ja",
    theme: isDark.value ? darkTheme : lightTheme,
    renderer: new NativeRenderer(),
    className: "emoji-picker",
    animate: true,
    emojisPerRow: 8,
    emojiSize: "2rem",
    visibleRows: 6,
  });

  // Listen for emoji selection
  emojiPicker.addEventListener("emoji:select", (selection: any) => {
    message.value += selection.emoji;
    emojiPickerVisible.value = false;

    // Focus message input after emoji selection
    messageInputRef.value?.focus();
  });
  /*
  // message reaction emoji picker
  const messageReactionEmojiPickerContainer = document.querySelector(
    ".messageReactionEmojiPickerContainerRef"
  );
  console.log(
    "messageReactionEmojiPickerContainer: ",
    messageReactionEmojiPickerContainer
  );

  // Message reaction emoji picker
  messageReactionEmojiPicker = createPicker({
    rootElement: messageReactionEmojiPickerContainer as HTMLElement,
    i18n: i18n as any,
    locale: locale.value === "en" ? "en" : "ja",
    theme: isDark.value ? darkTheme : lightTheme,
    renderer: new NativeRenderer(),
    className: "emoji-picker",
    animate: true,
    emojisPerRow: 8,
    emojiSize: "2rem",
    visibleRows: 6,
  });

  // Listen for message reaction emoji selection
  messageReactionEmojiPicker.addEventListener(
    "emoji:select",
    async (selection: any) => {
      await handleAddmessageReaction(selection.emoji);
      //messageReactionMenuVisible.value = false;
    }
  ); */
});

let messagesContainerRef = ref<HTMLElement | null>(null);
const { y /* ,arrivedState,directions */ } = useScroll(messagesContainerRef, {});

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
watchEffect(async () => {
  if (props.chatOpened && !chatOpenedOnce.value) {
    chatOpenedOnce.value = true;
    await handleReadMessages();
    //await handleReadReactions();
  }
});

let message = ref<string>("");
let showMessageSendingLoading = ref<boolean>(false);

const handleSendMessage = async () => {
  showMessageSendingLoading.value = true;

  if (message.value !== "") {
    try {
      const { error } = await supabase.from("messages").insert([
        {
          message: message.value,
          user_id: authStore?.session?.user?.id,
          user_name: generalStore.userName || "onur",
          space_id: generalStore.spaceId,
        },
      ]);
      if (error) {
        throw error;
      } else {
        message.value = "";
        showMessageSendingLoading.value = false;

        // Focus message input after sending message
        messageInputRef.value?.focus();
      }
    } catch (error: any) {
      console.log("CREATE MESSAGE CATCH ERROR: ", error.message);
    }
  }
};

/*
// Read reactions of a message
let messageReactions = ref<any[]>([]);
const handleReadReactions = async () => {
  try {
    const { data: reactions, error } = await supabase
      .from("message_reactions")
      .select("*");
    if (reactions) {
      console.log("reactions: ", reactions);
      messageReactions.value = reactions;
    }
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.log("READ message REACTIONS CATCH ERROR: ", error.message);
  }
};

// message reactions by message id
 const messageReactionsByMessageId = (messageId: string) => {
  const messageRactionsById = messageReactions.value
    .filter((messageReaction) => messageReaction.id === messageId)
    .map((messageReaction) => messageReaction.reactions);

  return messageRactionsById;
};

// Add reaction to a message
const handleAddmessageReaction = async (emoji: string) => {
  try {
    const { error } = await supabase.from("message_reactions").insert([
      {
        id: messageIdToAddReaction.value,
        reactions: [
          {
            emoji,
            user_id: authStore?.session?.user?.id,
            user_name: generalStore.userName || "onur",
          },
        ],
      },
    ]);
    if (error) {
      throw error;
    } else {
      console.log("message reaction added!");
    }
  } catch (error: any) {
    console.log("CREATE message REACTION CATCH ERROR: ", error.message);
  }
}; */

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

/****************************************
 * UI
 ****************************************/

// Format message sent time
const formattedMessageSentTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

  const messages = {
    now: t("times.chatTime.now"),
    oneMinuteAgo: t("times.chatTime.oneMinuteAgo"),
    minutesAgo: t("times.chatTime.minutesAgo"),
    oneHourAgo: t("times.chatTime.oneHourAgo"),
    hoursAgo: t("times.chatTime.hoursAgo"),
    oneDayAgo: t("times.chatTime.oneDayAgo"),
  };

  switch (true) {
    case diffInMinutes < 1:
      return messages.now;
    case diffInMinutes === 1:
      return messages.oneMinuteAgo;
    case diffInMinutes < 60:
      return `${diffInMinutes} ${messages.minutesAgo}`;
    case diffInMinutes < 1440:
      const diffInHours = Math.floor(diffInMinutes / 60);
      return diffInHours === 1
        ? messages.oneHourAgo
        : `${diffInHours} ${messages.hoursAgo}`;
    case diffInMinutes < 10080:
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return diffInDays === 1 ? messages.oneDayAgo : date.toLocaleDateString();

    default:
      return date.toLocaleDateString();
  }
};

// Update sent time every minute
setInterval(() => {
  const messages = document.querySelectorAll(".message__sent-time");
  messages.forEach((message) => {
    const time = message.getAttribute("data-time");
    if (time) {
      message.innerHTML = formattedMessageSentTime(time);
    }
  });
}, 60000);

// Emoji picker
let emojiPickerVisible = ref<boolean>(false);
let messageInputRef = ref<HTMLElement | null>(null);

const clickOutsideHandlerEmojiPicker: OnClickOutsideHandler = () => {
  emojiPickerVisible.value = false;
};

const handleOpenSendMessageEmojiPicker = () => {
  emojiPickerVisible.value = !emojiPickerVisible.value;
};

// MESSAGE ACTIONS
let messageActionsVisible = ref<boolean>(false);
let visibleMessageIndex = ref<number>();
const handleHoverMessage = (index: number) => {
  visibleMessageIndex.value = index;
  messageActionsVisible.value = true;
};

// Group messages by user
const groupedMessages = computed(() => {
  const groups: any[] = [];
  let prevMessage: any;

  spaceMessages.value.forEach((message) => {
    if (
      prevMessage &&
      message.user_id === prevMessage.user_id &&
      Math.abs(
        new Date(message.created_at).getTime() -
          new Date(prevMessage.created_at).getTime()
      ) <=
        2 * 60 * 1000
    ) {
      groups[groups.length - 1].messages.push(message);
    } else {
      groups.push({
        userId: message.user_id,
        user: message.user_name,
        time: message.created_at,
        messages: [message],
      });
    }
    prevMessage = message;
  });

  return groups;
});
</script>

<template>
  <div class="chat">
    <ul class="chat__message-groups" ref="messagesContainerRef">
      <!-- Chat groups(to show the messages, from the same user sent in a minute, in the same container) -->
      <li
        v-for="(group, groupIndex) in groupedMessages"
        :key="groupIndex"
        class="message-groups__group"
        :class="group.userId === authStore?.session?.user?.id ? 'groups__my-group' : ''"
      >
        <p class="group__top">
          <span class="top__user-name">{{ group.user }}</span>
          <span class="message__sent-time">{{
            formattedMessageSentTime(group.time)
          }}</span>
        </p>
        <ul class="group__messages">
          <!-- Single chat group -->
          <li
            v-for="(message, messageIndex) in group.messages"
            :key="messageIndex"
            class="messages__message"
            @mouseover="handleHoverMessage(messageIndex)"
          >
            <p class="message__content">{{ message.message }}</p>
          </li>
        </ul>
      </li>
    </ul>

    <div class="chat__send-message">
      <div class="send-message__input-container">
        <!-- @input is for mobile(v-model won't update until input loses focus): https://github.com/vuejs/vue/issues/8231 -->

        <input
          type="text"
          v-model="message"
          @input="(e: Event ) => (message = e.target?.value)"
          ref="messageInputRef"
          :placeholder="t('chat.typeAMessage')"
          @keypress.enter="handleSendMessage"
          class="input-container__input"
        />

        <!-- Emoji button -->
        <button
          @click.stop="handleOpenSendMessageEmojiPicker"
          class="btn btn-no-style input-container__icon input-container__icon--emoji"
        >
          <carbon:face-add />
        </button>

        <!-- Send button(show on mobile only) -->
        <button
          @click.stop="handleSendMessage"
          class="btn btn-no-style input-container__icon input-container__icon--send"
        >
          <carbon:send />
        </button>

        <!-- Emoji Picker -->
        <div
          v-show="emojiPickerVisible"
          v-on-click-outside.bubble="clickOutsideHandlerEmojiPicker"
          class="input-container__emoji-picker"
        >
          <div class="emojiPickerContainer"></div>
        </div>
      </div> </div
  ></div>
</template>

<style scoped lang="scss">
.chat {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 3.5rem; // height of bottom control

  width: 25rem;
  background-color: var(--bg-200);
  border-left: 1px solid var(--border);
  box-shadow: 0px -20px 10px 3px rgba(0, 0, 0, 0.2);
  z-index: $space-sidebar-z-index;

  .chat__message-groups {
    overflow-y: auto;
    height: 94%;
    padding: 0.5rem;

    // Message bubble
    .message-groups__group {
      margin-bottom: 1rem;
      padding: 0.2rem 1rem;
      width: max-content;
      max-width: 100%;

      border-radius: 0.2rem;
      background-color: var(--others-message-bg);
      line-break: anywhere;

      &:hover {
        background-color: var(--others-message-hover-bg);
      }
      .group__top {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        .top__user-name {
          //color: var(--pale-font);
          font-weight: 600;
          line-height: 0;
        }

        .message__sent-time {
          font-size: 0.7rem;
          color: var(--paler-font);
        }
      }

      // Single chat group
      .group__messages {
        .messages__message {
          .message__content {
            color: var(--f-color);
          }
        }
      }
    }

    // My message bubble
    .groups__my-group {
      background-color: var(--my-message-bg);
      text-align: right;
      margin-left: auto;

      &:hover {
        background-color: var(--my-message-hover-bg);
      }
      .group__top {
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-start;
      }
    }
  }
  .chat__send-message {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    height: 3.2rem;
    padding: 0 0.2rem 0 0.1rem;
    background-color: var(--bg-300);
    border-top: 1px solid var(--border);

    .send-message__input-container {
      position: relative;

      width: 100%;
      height: 100%;
      .input-container__input {
        width: 100%;
        height: 100%;
        padding: 0 3.2rem 0 0.5rem;

        border: none;
        border-radius: 0.2rem;
        outline: 2px solid transparent;

        font-weight: 500;
        background-color: var(--text-input-bg);
        color: var(--f-color);
      }
      .input-container__icon {
        position: absolute;
        right: 0.5rem;
        top: calc(3.2rem - 2.6rem);

        svg {
          width: 1.5rem;
          height: 1.5rem;
        }
      }
      .input-container__icon--send {
        display: none;
      }

      .input-container__emoji-picker {
        position: absolute;
        bottom: 3.5rem;
        right: 0.5rem;

        border-radius: 0.5rem;
        box-shadow: 0px 2px 15px 5px var(--shadow-darker);

        z-index: 100;
      }
    }
  }

  @include s-576 {
    width: 100vw;

    .chat__send-message {
      .send-message__input-container {
        .input-container__input {
          padding-right: 6rem;
        }
        .input-container__icon--send {
          display: block;
        }
        .input-container__icon--emoji {
          right: 3rem;
        }
      }
    }
  }
}
</style>
