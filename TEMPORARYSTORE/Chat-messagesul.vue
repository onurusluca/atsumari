<ul class="chat__messages" ref="messagesContainerRef">
  <li
    v-for="(message, index) in spaceMessages"
    :key="index"
    class="messages__message"
    :class="
      message.user_id === authStore?.session?.user?.id ? 'messages__my-message' : ''
    "
    @mouseover="handleHoverMessage(index)"
  >
    <!-- Don't show the name if the previous message is from the same user -->
    <p class="message__top">
      <span class="top__user-name">
        {{ message.user_name }}
      </span>
      <!-- Sent time -->
      <!-- Don't show if the sent time between the previous message is under 1 minutes-->
      <span class="message__sent-time">
        {{ formattedMessageSentTime(message.created_at!) }}
      </span>
    </p>
    <p class="message__content">
      {{ message.message }}
    </p>

    <!-- message reactions -->
    <!--      <div class="message__message-reactions">
      <div
        v-for="(reactions, index) in messageReactionsByMessageId(message.id)"

        :key="index"
        class="message-reactions__reaction"
      >
        <span
          v-for="(reaction, index) in reactions"
          :key="index"
          class="reaction__emoji"
          >reactions:{{ reaction.emoji }}</span
        >
      </div>
    </div> -->

    <!-- React, edit and more -->

    <!--         <div
      v-show="messageActionsVisible && visibleMessageIndex === index"
      class="message__actions"
    >
      <button
        @click.stop="handleOpenMessageReactionEmojiMenu(message.id)"
        class="btn-no-style actions__icon"
      >
        <carbon:face-add />
      </button>
      <button class="btn-no-style actions__icon">
        <carbon:edit />
      </button>
      <button class="btn-no-style actions__icon">
        <carbon:overflow-menu-horizontal />
      </button>
    </div>
  </li>
  <div
    v-show="messageReactionMenuVisible"
    v-on-click-outside.bubble="clickOutsideHandlerMessageRactionEmojiPicker"
    class="message__message-reaction-emoji-picker"
  >
    <div class="messageReactionEmojiPickerContainerRef"></div>
  </div> -->
  </li></ul>
