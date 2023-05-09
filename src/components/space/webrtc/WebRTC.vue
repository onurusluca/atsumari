<script setup lang="ts">
import { EnvVariables } from "@/envVariables";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

const webrtcLocalStorage = useStorage("atsumari_webrtc", {
  userAuthToken: "",
  userAuthTokenExpiry: "",
});

onMounted(() => {});

let isJoined = ref<boolean>(false);
emitter.on("playerInRoom", (data: any) => {
  if (data === true && !isJoined.value) {
    isJoined.value = true;

    console.log("joining room", data);
    handleJoinRoom();
  } else if (data === false && isJoined.value) {
    isJoined.value = false;

    console.log("leaving room", data);
  }
});

let roomName = ref<string>("");
let roomDescription = ref<string>("my room");
let roomTemplateId = ref<string>("64490b580ca9b196e73dadbf");
let roomRegion = ref<string>("us");
const isLoading = ref(false);
const formData = reactive({
  name: "",
  room: roomName,
});

const handleCreateRoom = async () => {
  try {
    const roomRes = await createRoom(
      roomName.value,
      roomRegion.value,
      roomDescription.value,
      roomTemplateId.value
    );
    console.log(roomRes);
  } catch (error) {
    console.log(error);

    //alert(error);
  }
};

const handleJoinRoom = async () => {
  isLoading.value = true;

  let authToken: {
    msg: string;
    success: boolean;
    token: string;
  } = {
    msg: "",
    success: false,
    token: "",
  };

  // Delete the auth token from local storage if it is non-existent or expired or the auth token is not present
  if (
    !webrtcLocalStorage.value.userAuthTokenExpiry ||
    new Date(webrtcLocalStorage.value.userAuthTokenExpiry) < new Date() ||
    !webrtcLocalStorage.value.userAuthToken ||
    webrtcLocalStorage.value.userAuthToken === ""
  ) {
    console.log(
      "there is no token expiration in local storage or it is expired or there is no token in local storage "
    );

    webrtcLocalStorage.value.userAuthToken = "";
    webrtcLocalStorage.value.userAuthTokenExpiry = "";

    // Create a new auth token
    authToken = await generateAuthToken(
      "644f705b6fe6e1cc9d167ee4",
      generalStore.userId,
      "host"
      // role: 'host'
    );

    // Set the auth token in local storage
    webrtcLocalStorage.value.userAuthToken = authToken.token;

    // Set the expiry of the auth token to 23 hours from now
    webrtcLocalStorage.value.userAuthTokenExpiry = new Date(
      new Date().getTime() + 23 * 60 * 60 * 1000
    ).toISOString(); // 23 hours from creation

    // Else, use the one present in local storage
  } else {
    console.log("the token is not expired");

    authToken.token = webrtcLocalStorage.value.userAuthToken;

    if (authToken.token !== "") {
      console.log("there is a token expiration in local storage and it is not expired");
      try {
        console.log("trying to join room");

        hmsActions.join({
          userName: formData.name,
          authToken: authToken.token,
          settings: {
            isAudioMuted: true, // Join with audio muted
            isVideoMuted: true, // Join with video muted
          },
        });
      } catch (error) {
        console.log("error joining room", error);

        // If the auth token is expired, generate a new one, and then join the room
        if (error?.message! === "token is expired") {
          console.log("token is expired");

          authToken = await generateAuthToken(
            "644f705b6fe6e1cc9d167ee4",
            generalStore.userId,
            "host"
            // role: 'host'
          );

          console.log("authToken", authToken);

          webrtcLocalStorage.value.userAuthToken = authToken.token;

          hmsActions.join({
            userName: formData.name,
            authToken: authToken.token,
            settings: {
              isAudioMuted: true, // Join with audio muted
              isVideoMuted: true, // Join with video muted
            },
          });
        } else {
          alert(error);
        }
      }
    }
  }

  isLoading.value = false;
};

const tokentest = async () => {
  let authToken = {
    token: "",
  };
  try {
    authToken = await generateAuthToken(
      "644f705b6fe6e1cc9d167ee4",
      generalStore.userId,
      "normal-room"
      // role: 'host'
    );

    console.log("authToken", authToken);
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div class="webrtc"> <button @click="handleJoinRoom">JOIN ROOM</button> </div>
</template>

<style scoped lang="scss">
.webrtc {
  background-color: var(--bg-300);
  .btn-danger {
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 6px 14px;
    color: white;
    font-family: inherit;
    font-size: 14px;
  }

  .hide {
    display: none !important;
  }

  form {
    max-width: 450px;
    margin: 30px auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    padding: 20px;
  }

  input {
    display: block;
    width: 100%;
    border-radius: 8px;
    border: 2px solid transparent;
    height: 34px;
    padding: 5px;
    background: #37474f;
    color: inherit;
    font-family: inherit;
  }

  input::placeholder {
    color: #aaa;
  }

  .input-container {
    margin-bottom: 20px;
  }

  .btn-primary {
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 6px 14px;
    background-color: #1565c0;
    color: white;
    font-family: inherit;
    font-size: 14px;
  }

  form h2,
  .conference-section h2 {
    margin-bottom: 20px;
  }

  .conference-section {
    padding: 20px 30px;
    max-width: 960px;
    margin: 0 auto;
  }

  .conference-section h2 {
    text-align: center;
    font-size: 32px;
    padding-bottom: 10px;
    border-bottom: 1px solid #546e7a;
  }

  #peers-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(min-content, 1fr));
    place-items: center;
    grid-gap: 10px;
  }

  .peer-video {
    height: 250px;
    width: 250px;
    border-radius: 40%;
    object-fit: cover;
    margin-bottom: 10px;
  }

  .local.peer-video {
    transform: scaleX(-1);
  }

  .peer-name {
    font-size: 14px;
    text-align: center;
  }

  .peer-tile {
    padding: 10px;
  }

  .control-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 15px;
    justify-content: center;
    z-index: 10;
  }

  .control-bar > *:not(:first-child) {
    margin-left: 8px;
  }

  .btn-control {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: 2px solid #37474f;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    text-align: center;
    background-color: #607d8b;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
    color: white;
  }
}
</style>
