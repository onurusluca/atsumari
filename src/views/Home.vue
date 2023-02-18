<script setup lang="ts">
import { supabase } from "@/lib/supabaseInit";
import { userSessionStore } from "@/stores/userSession";
const router = useRouter();

const userSession = userSessionStore();

const email = ref<string>("");
const password = ref<any>(null);

let allMessages = ref<Array<object>>([]);
let message = ref<string>("");
const messagesRef = ref("messagesRef");

onMounted(async () => {
  await getSpaces().then(() => listenToChanges());
});

onDeactivated(async () => {
  supabase.removeChannel("messages");
});

async function getSpaces() {
  try {
    let { data: messages, error } = await supabase.from("messages").select("*");
    messages?.forEach((message) => {
      allMessages.value?.push({
        message: message.message,
        user_id: message.user_id,
      });
    });
    console.log("messages", messages);

    // go to bottom of ref messages
    if (messages) {
      setTimeout(() => {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
      }, 1000);
    }
    if (error) throw error;
  } catch (error: any) {
    alert(error.message);
  }
}

// login function
const login = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
  } catch (error: any) {
    alert(error.message);
  }
};
// logout function
const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut().then(router.push("/"));
    if (error) throw error;
  } catch (error: any) {
    alert(error.message);
  }
};

const addMessage = async () => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        message: message.value,
        user_id: userSession.session.user.id,
      })
      .select();
    message.value = "";
    if (error) throw error;
    console.log("data", data);
    return;
  } catch (error) {}
};

function listenToChanges() {
  supabase
    .channel("custom-all-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      (payload) => {
        console.log("Change received!", payload);
        allMessages.value?.push({
          message: payload.new.message,
          user_id: payload.new.user_id,
        });
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
      }
    )
    .subscribe();
}
</script>

<template>
  <router-link :to="{ name: 'Home' }">Home</router-link>
  <br />
  <router-link v-if="!userSession.session" :to="{ name: 'Register' }"
    >Register</router-link
  >
  <br />
  <router-link v-if="!userSession.session" :to="{ name: 'Login' }"
    >Login</router-link
  >
  <button
    className="p-4 bg-blue-400 text-white rounded-xl hover:bg-blue-500"
    @click="logOut"
    v-else
  >
    Sign Out
  </button>
  <hr />
  <br />

  <ul
    v-if="allMessages"
    ref="messagesRef"
    style="
      padding: 2rem;
      list-style: none;
      display: flex;
      flex-direction: column;
      max-height: 50vh;
      overflow-y: scroll;
    "
  >
    <li
      v-for="(item, index) in allMessages"
      :key="index"
      :style="
        item.user_id === userSession.session.user.id
          ? 'align-self: end; margin-bottom:.3rem; color: aqua'
          : 'margin-bottom:.3rem; color: orange'
      "
    >
      {{ item.message }}
    </li>
  </ul>

  <form @submit.prevent="addMessage">
    <input
      class="inputField"
      type="text"
      placeholder="Your message"
      v-model="message"
    />
    <button type="submit">Send</button>
  </form>

  <br />
  <hr />

  <div v-if="!userSession.session">
    <div>
      <input
        class="inputField"
        type="email"
        placeholder="Your email"
        v-model="email"
        autocomplete="email"
      />
    </div>
    <div>
      <input type="password" placeholder="Your password" v-model="password" />
    </div>
  </div>
  <div v-else>
    {{ userSession.session.user.email }}
  </div>
  <button
    className="p-4 bg-blue-400 text-white rounded-xl hover:bg-blue-500"
    @click="login"
    v-if="!userSession.session"
  >
    Sign In
  </button>
</template>

<style scoped lang="scss"></style>
