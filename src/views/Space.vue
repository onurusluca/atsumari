<script setup lang="ts">
import { vOnClickOutside } from "@vueuse/components";
import { emitter } from "@/composables/useEmit";
import { createGame } from "@/game";
import { TileMap } from "@/types/canvasTypes";
import type { OnClickOutsideHandler } from "@vueuse/core";
import type { User } from "@/types/general";
import type { SpacesType, ProfilesType } from "@/api/types";

/****************************************
 * DECLARATIONS
 ****************************************/
const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const route = useRouter();
const spaceId = String(route.currentRoute.value.params.id);
const spaceName = String(route.currentRoute.value.params.name);
const userId = authStore.user?.id;

let users = reactive<Array<User>>([]);

let canvasLoaded = ref<boolean>(false);
let initialSetupCompleted = ref<boolean>(true);

let initialUserPosition = {
  x: 100,
  y: 100,
};

// TODO: add to database instead of localStorage
const canvasLocalStorage = useStorage("atsumari_canvas", {
  lastUserPosition: { x: 0, y: 0 },
});

let rightClickMenuIsEnabled = ref<boolean>(false);
let rightClickMenuPosition = ref<{ mouseX: number; mouseY: number }>({
  mouseX: 0,
  mouseY: 0,
});
let rightClickWorldPosition = ref<{ worldX: number; worldY: number }>({
  worldX: 0,
  worldY: 0,
});

onMounted(async () => {
  await initialPreparations();
});

const initialPreparations = async () => {
  // We need to do a lot of stuff in onMounted because we need to wait for the DOM to be ready because of canvas

  generalStore.spaceId = spaceId;
  generalStore.spaceName = spaceName;
  generalStore.userId = userId;
  generalStore.userName = userName.value;
  generalStore.users = users;

  await downloadSpaceMap();
  await downloadCharacterSpriteSheets();
  await handleAddSpaceToVisitedSpaces();

  createGame({
    users: users,
    myPlayerId: userId,
    gameMapJson: gameMapJson.value!,
    gameMapTileset: gameMapTileset.value!,
    initialSetupCompleted: initialSetupCompleted.value,
  });

  // Define helper function to update and broadcast user position
  const updateUserPositionAndBroadcast = async (
    user: User,
    position: { x: number; y: number; facingTo: string }
  ) => {
    Object.assign(user, position);
    sendUserAction(user.x, user.y, user.facingTo);
    canvasLocalStorage.value = { lastUserPosition: { x: user.x, y: user.y } };
  };

  // Find user by ID
  const findUserById = (userId: string) => users.find((user) => user.id === userId);

  // Listener to handle player move event
  emitter.on("playerMove", (myPlayer) => {
    const user = findUserById(userId);
    if (!user) return;
    updateUserPositionAndBroadcast(user, myPlayer);
  });

  // Listener to handle right click event
  emitter.on("rightClick", (positions) => {
    console.log("rightClick", positions);

    rightClickMenuPosition.value = positions.mousePos;
    rightClickWorldPosition.value = positions.worldPos;

    rightClickMenuIsEnabled.value = true;
  });

  // Sent from canvas, when user presses a key, close right click menu
  emitter.on("closeRightClickMenu", () => {
    rightClickMenuIsEnabled.value = false;
  });
};

/****************************************
 * INITIAL SETUPS
 ****************************************/
let userName = ref<string>("");
let characterSpriteName = ref<string>("");
const handleReadProfile = async () => {
  try {
    if (!userId) throw new Error("No user ID found in authStore session");

    const { data: profiles, error } = await supabase
      .from<ProfilesType>("profiles")
      .select("*")
      .eq("id", userId);

    if (error) throw error;
    if (!profiles || profiles.length === 0)
      throw new Error("No user profile found for the user");

    const fetchedUserProfile = profiles[0];
    const userNameForThisSpace = Object(
      fetchedUserProfile.user_name_for_each_space
    ).find((space: { [key: string]: string }) => space[spaceId]);

    if (userNameForThisSpace && fetchedUserProfile.character_sprite) {
      userName.value = userNameForThisSpace[spaceId];
      characterSpriteName.value = fetchedUserProfile.character_sprite;
      initialSetupCompleted.value = true;
    } else {
      initialSetupCompleted.value = false;
    }
  } catch (error: any) {
    console.log("READ PROFILES CATCH ERROR: ", error.message);
  }
};

// Get space map
let gameMapJson = ref<TileMap>();
let gameMapTileset = ref<string>();
const downloadSpaceMap = async () => {
  try {
    const { data, error } = await supabase.storage
      .from("space-maps")
      .download("nature-map.json");

    if (data) {
      const text = await data.text(); // Convert the Blob into a string
      const jsonData = JSON.parse(text); // Parse the string as JSON

      gameMapJson.value = jsonData;
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("DOWNLOAD gameMapJson CATCH ERROR: ", error.message);
  }

  try {
    const { data, error } = await supabase.storage
      .from("space-maps")
      .download("tileset_nature-map.png");

    if (data) {
      // Get the URL of the image
      const url = URL.createObjectURL(data);
      gameMapTileset.value = url;
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("DOWNLOAD gameMapTileset CATCH ERROR: ", error.message);
  }
};

// Download user character sprite sheet
const downloadCharacterSpriteSheets = async () => {
  users.forEach(async (user) => {
    try {
      const { data, error } = await supabase.storage
        .from("character-sprites")
        .download(`characters/${user.characterSpriteName}`);

      if (data) {
        // Get the URL of the image
        const url = URL.createObjectURL(data);

        user.characterSprite = url;
      }
      if (error) throw error;
    } catch (error: any) {
      console.log("DOWNLOAD OTHER CHARACTERS SPRITE SHEET CATCH ERROR: ", error);
    }
  });
};

const handleAddSpaceToVisitedSpaces = async () => {
  try {
    const visitedSpaces = await getVisitedSpaces();

    // If space is not in visited spaces
    if (visitedSpaces.some((space: SpacesType) => space.id !== spaceId)) {
      const userSpaces = await getUserSpaces();

      // If user is not the owner of the space
      if (
        userSpaces.some((space: SpacesType) => space.user_id !== userId) ||
        userSpaces.length === 0
      ) {
        await addSpaceToVisitedSpaces();
      }
    }
  } catch (error) {
    console.error("Error in handleAddSpaceToVisitedSpaces: ", error);
  }
};

const getVisitedSpaces = async () => {
  const { data: spaces, error } = await supabase
    .from("visited_spaces")
    .select("*")
    .eq("visited_user_id", userId);

  if (error) throw error;
  return spaces || [];
};

const getUserSpaces = async () => {
  const { data: spaces, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("user_id", userId)
    .eq("name", spaceName);

  if (error) throw error;
  return spaces || [];
};

const addSpaceToVisitedSpaces = async () => {
  const { error } = await supabase.from("visited_spaces").insert({
    name: spaceName,
    id: spaceId,
    visited_user_id: userId,
  });

  if (error) throw error;
};

// After all the users are loaded, do the preparations
const handleInitiateDownloadsAfterUsersLoaded = async () => {
  await downloadCharacterSpriteSheets();
  await downloadSpaceMap();
};

// After all the initial setups are done in the modal, do the preparations
const handleInitialSetupCompleted = async () => {
  initialSetupCompleted.value = true;
  await handleReadProfile().then(async () => {
    await initialPreparations();
    doRealtimeStuff();
  });
};

// Update user position with the clicked position
const moveUserToRightClickedPosition = async () => {
  users.forEach(async (user) => {
    if (user.id === userId) {
      // Update user position
      user.x = rightClickWorldPosition.value.worldX;
      user.y = rightClickWorldPosition.value.worldY;
      // Set to default
      user.facingTo = "down";

      // Emit event to update canvas
      emitter.emit("rightClickPlayerMoveConfirmed", user);

      // Send user position in realtime
      sendUserAction(user.x, user.y, user.facingTo);

      // Save user position in localstorage
      canvasLocalStorage.value = {
        lastUserPosition: { x: user.x, y: user.y },
      };
    }
  });

  rightClickMenuIsEnabled.value = false;
};

/****************************************
 * REALTIME
 ****************************************/
const BROADCAST_CONFIG = {
  config: {
    broadcast: {
      self: false,
      ack: false,
    },
  },
};

const EVENT_JOIN = "join";
const EVENT_LEAVE = "leave";
const EVENT_SEND_USER_POSITION = "sendUserPositionEvent";
const BROADCAST_SUBSCRIBED_STATUS = "SUBSCRIBED";

const broadCastChannel = supabase.channel(spaceId, BROADCAST_CONFIG);

const getUserPayload = (x: number, y: number, facingTo: string) => ({
  id: userId,
  userName: userName.value,
  x,
  y,
  facingTo,
});

const sendUserAction = (x: number, y: number, facingTo: string) => {
  broadCastChannel.send({
    type: "broadcast",
    event: EVENT_SEND_USER_POSITION,
    payload: getUserPayload(x, y, facingTo),
  });
};

const handleJoinEvent = ({ newPresences }: { newPresences: User[] }) => {
  const { lastUserPosition = initialUserPosition } = canvasLocalStorage.value;
  sendUserAction(lastUserPosition.x, lastUserPosition.y, "down");

  const [newUser] = newPresences as User[];
  users.push({
    ...newUser,
    facingTo: "down",
    userStatus: generalStore.userStatus,
    userPersonalMessage: generalStore.userPersonalMessage,
  });

  handleInitiateDownloadsAfterUsersLoaded();
};

const handleLeaveEvent = ({ leftPresences }: { leftPresences: User[] }) => {
  const userIndex = users.findIndex(({ id }) => id === leftPresences[0].id);
  if (userIndex !== -1) users.splice(userIndex, 1);
};

const handleUserPositionBroadcast = ({ payload: userPayload }: { payload: User }) => {
  if (!userPayload) {
    console.error("Invalid payload received");
    return;
  }

  const user = users.find(({ id }) => id === userPayload.id);
  if (user) {
    Object.assign(user, userPayload);
  }
};

const doRealtimeStuff = () => {
  broadCastChannel
    .on("presence", { event: EVENT_JOIN }, handleJoinEvent)
    .on("presence", { event: EVENT_LEAVE }, handleLeaveEvent)
    .on("broadcast", { event: EVENT_SEND_USER_POSITION }, handleUserPositionBroadcast)
    .subscribe((status: string) => {
      if (status === BROADCAST_SUBSCRIBED_STATUS) {
        const lastPosition =
          canvasLocalStorage.value.lastUserPosition || initialUserPosition;
        broadCastChannel.track({
          ...getUserPayload(lastPosition.x, lastPosition.y, "down"),
          online_at: new Date().toISOString(),
          characterSpriteName: characterSpriteName.value,
          lastPosition,
        });
      }
    });
};

// Unsubscribe from channel when component is unmounted
onUnmounted(() => {
  broadCastChannel.unsubscribe();
});

/****************************************
 * UI
 ****************************************/

const chatMenuOpen = ref<Boolean>(false);
const onlineUsersMenuOpen = ref<Boolean>(false);

// Main menu
let mainMenuOpen = ref<Boolean>(false);
const mainMenuClickOutsideHandler: OnClickOutsideHandler = () => {
  mainMenuOpen.value = false;
};

const handleOnlineUsersMenuOpen = () => {
  chatMenuOpen.value = false;
  onlineUsersMenuOpen.value = !onlineUsersMenuOpen.value;
};
const handleChatMenuOpen = () => {
  onlineUsersMenuOpen.value = false;
  chatMenuOpen.value = !chatMenuOpen.value;
};
</script>

<template>
  <!-- Loading animation to show until app mount -->
  <!--   <section v-if="!canvasLoaded" class="route-loading-overlay">
    <span class="loader"></span>
  </section> -->

  <div class="space">
    <div class="canvas-container">
      <button
        @click="moveUserToRightClickedPosition"
        v-show="rightClickMenuIsEnabled"
        class="btn canvas-container__right-click-menu"
        :style="{
          left: rightClickMenuPosition.mouseX + 'px',
          top: rightClickMenuPosition.mouseY + 'px',
        }"
        >{{ t("space.userActions.moveHere") }}</button
      >
    </div>

    <!-- Bottom control -->
    <div class="bottom-control">
      <div class="bottom-control__left">
        <div class="left__main-menu">
          <button
            @click.stop="mainMenuOpen = !mainMenuOpen"
            class="btn-bottom-control main-menu__btn"
          >
            <img
              src="@/assets/images/icons/icon-64.png"
              alt="Atsumari 🍉"
              title="Atsumari 🍉"
              class="btn__icon"
            />
          </button>

          <!-- Main menu -->
          <Transition name="slide-up">
            <MainMenu
              v-if="mainMenuOpen"
              class="left__main-menu"
              ref="mainMenu"
              v-on-click-outside.bubble="mainMenuClickOutsideHandler"
            />
          </Transition>
        </div>
        <div class="left__user-menu"></div>
        <div class="left__media-sharing">
          <MicCameraScreen />
        </div>
        <div class="left__emotes"></div>
      </div>

      <div class="bottom-control__right">
        <!-- Chat -->
        <div class="right__chat">
          <button
            @click.stop="handleChatMenuOpen"
            class="btn-bottom-control"
            :title="t('chat.title')"
          >
            <ph:chats-circle class="bottom-control__icon" />
          </button>
          <Transition name="slide-left-fast">
            <Chat
              v-show="chatMenuOpen"
              :chat-opened="chatMenuOpen"
              class="chat__chat-menu"
            />
          </Transition>
        </div>
        <div class="right__user-list">
          <button
            @click.stop="handleOnlineUsersMenuOpen"
            class="btn-bottom-control"
            :title="t('onlineUsers.title')"
          >
            <ph:users-three class="bottom-control__icon" />
          </button>
          <Transition name="slide-left-fast">
            <OnlineUsers
              v-show="onlineUsersMenuOpen"
              :online-users="users"
              class="chat__chat-menu"
            />
          </Transition>
        </div>
      </div>
    </div>

    <!-- LiveKit Stuff -->
    <section class="space__webrtc">
      <Conference />
    </section>

    <!-- Joystick for mobile -->
    <Joystick />

    <!-- Initial setup modal -->
    <InitialCharacterSetupModal
      v-if="!initialSetupCompleted"
      :space-id="spaceId"
      @initial-setup-completed="handleInitialSetupCompleted"
    />
  </div>
</template>

<style scoped lang="scss">
.space {
  background-color: #222;
  .canvas-container {
    /*   width: 100%;
    height: 100vh; */

    .canvas-container__right-click-menu {
      position: absolute;
      z-index: 1000;
      background-color: var(--bg-300);
      color: var(--text-100);
      outline: 2px solid var(--border);

      &:hover {
        background-color: var(--soft-hover);
      }
    }
  }

  .bottom-control {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    justify-content: space-between;
    align-items: center;

    height: 3.5rem;
    margin: 0;
    padding: 0 1rem;

    background-color: var(--bg-300);
    border-top: 1px solid var(--border);

    z-index: $space-bottom-control-z-index;

    // create class names for each element with no styles
    .bottom-control__left {
      display: flex;
      align-items: center;
      gap: 1rem;
      .left__main-menu {
        .main-menu__btn {
          background-color: var(--primary-100);
          transition: background-color 50ms ease-in-out;

          width: 2.5rem;
          height: 2.5rem;
          &:hover {
            background-color: #3ecbf1;
          }
          .btn__icon {
            width: 2rem;
            height: 2rem;
            margin: 0.2rem 0;
          }
        }
      }
      /*    .left__user-menu {
      }
      .left__media-sharing {
      }
      .left__emotes {
      } */
    }

    .bottom-control__right {
      display: flex;
      align-items: center;
      /*      .right__chat {
        .chat__chat-menu {
        }
      } */
      .right__user-list {
        margin-left: 1rem;
      }
    }

    .btn-bottom-control {
      padding: 0.2rem 0.5rem;
      font-size: 0.9rem;
      .bottom-control__icon {
        width: 1.8rem;
        height: 1.8rem;
      }
    }
  }

  .space__webrtc {
    position: fixed;
    bottom: 5rem;
    border: 5px solid red;
  }
}
</style>
