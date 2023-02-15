<script setup lang="ts">
import { supabase } from "@/lib/supabaseInit";
import { userSessionStore } from "@/stores/userSession";
const router = useRouter();

const userSession = userSessionStore();

const email = ref<string>("");
const password = ref<any>(null);

let dataChange = ref<any>(null);

onMounted(() => {
  try {
    const messages = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (messages) => {
          console.log("Change received!", messages);
        }
      )
      .subscribe();
  } catch (error: any) {
    alert(error.message);
  }
});

const messages = supabase
  .channel("custom-all-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "messages" },
    (messages) => {
      console.log("Change received!", messages);
    }
  )
  .subscribe();

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

let spaceName = ref<string>("");
let spaceLanguage = ref<string>("");

const addSpace = async () => {
  try {
    const { data, error } = await supabase
      .from("spaces")
      .insert({
        space_name: spaceName.value,
        language: spaceLanguage.value,
      })
      .select();
    if (error) throw error;
    console.log("data", data);
    return;
  } catch (error) {}
};
</script>

<template>
  <h1>Messages: {{ dataChange }}</h1>
  <router-link :to="{ name: 'Home' }">Home</router-link>
  <br />
  <router-link v-if="!userSession.session" :to="{ name: 'Register' }"
    >Register</router-link
  >
  <br />
  <router-link :to="{ name: 'Login' }">Login</router-link>
  <br />

  <router-link :to="{ name: 'Account' }">Account</router-link>

  <hr />
  <br />

  <form @submit.prevent="addSpace">
    <input
      class="inputField"
      type="text"
      placeholder="Space name"
      v-model="spaceName"
    />
    <input
      class="inputField"
      type="text"
      placeholder="Space language"
      v-model="spaceLanguage"
    />
    <button type="submit">Add Space</button>
  </form>

  <br />
  <hr />

  <div>
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

  <div>
    {{ userSession.session }}
  </div>
  <button
    className="p-4 bg-blue-400 text-white rounded-xl hover:bg-blue-500"
    @click="login"
    v-if="!userSession.session"
  >
    Sign In
  </button>
  <button
    className="p-4 bg-blue-400 text-white rounded-xl hover:bg-blue-500"
    @click="logOut"
    v-else
  >
    Sign Out
  </button>
</template>

<style scoped lang="scss"></style>
