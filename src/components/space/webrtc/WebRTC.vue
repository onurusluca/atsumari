<script setup lang="ts">
import { EnvVariables } from "@/envVariables";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

onMounted(() => {});

const LIVEKIT_API_KEY = EnvVariables.livekitApiKey;
const LIVEKIT_URL = EnvVariables.livekitUrl;

const defaultRoomName = "autumn-lake-181610-VC";
const isLoading = ref(false);
const formData = reactive({
  name: "",
  room: `${defaultRoomName}`,
});

const joinHmsRoom = async () => {
  try {
    isLoading.value = true;
    const authToken = await fetchToken(formData.name, formData.room);

    hmsActions.join({
      userName: formData.name,
      authToken: authToken,
      settings: {
        isAudioMuted: true, // Join with audio muted
      },
    });
  } catch (error) {
    alert(error);
  }

  isLoading.value = false;
};
</script>

<template>
  <div class="webrtc">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-10 px-5 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="joinHmsRoom">
          <div>
            <label for="name" class="block text-sm font-2xl text-gray-700">
              Name
            </label>
            <div class="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                autocomplete="username"
                required
                v-model="formData.name"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="room" class="block text-sm font-medium text-gray-700">
              Room
            </label>
            <div class="mt-1">
              <input
                id="room"
                name="room"
                type="text"
                required
                disabled
                v-model="formData.room"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="formData.name === '' || isLoading"
              :class="{ 'cursor-not-allowed': isLoading }"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                class="animate-spin mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                v-if="isLoading"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>

              {{ isLoading ? "Joining..." : "Join" }}
            </button>
          </div>
        </form>
      </div>
    </div></div
  >
</template>

<style scoped lang="scss">
.webrtc {
  .btn-danger {
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 6px 14px;
    background-color: #f44336;
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
