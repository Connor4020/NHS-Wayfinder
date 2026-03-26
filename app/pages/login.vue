<script setup>
import { ref } from "vue";
import useAuth from "../../server/api/use-auth";

const router = useRouter();
const username = ref("");
const password = ref("");
const message = ref("");
const isError = ref(false);
const showPassword = ref(false);

const { fetchUserData } = useAuth();

const loginUser = async () => {
  message.value = "";
  isError.value = false;
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    if (!res.ok) {
      message.value =
        "Login failed: Incorrect username or password, please try again";
      isError.value = true;
      password.value = "";
      return;
    }

    const data = await res.json();
    try {
      await fetchUserData();
    } catch (_) {}
    isError.value = false;
    router.push("/admin/dashboard");
  } catch (err) {
    message.value =
      "Login failed: Incorrect username or password, please try again";
    isError.value = true;
    password.value = "";
  }
};
</script>

<template>
  <main>
    <h1>Log in to your NHS Wayfinder account</h1>
    <form @submit.prevent="loginUser()">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          v-model="username"
          type="text"
          id="username"
          name="username"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          id="password"
          name="password"
          required
        />
      </div>
      <div>
        <input v-model="showPassword" type="checkbox" id="show-password" />
        <label for="show-password">Show password</label>
      </div>

      <button type="submit" id="textbox-enter">Login</button>
    </form>
    <div class="message" :class="{ 'login-error': isError }" v-if="message">
      {{ message }}
    </div>
  </main>
</template>

<style scoped>
.message {
  margin-top: 12px;
}

.login-error {
  color: #d32f2f;
  font-size: 16px;
}
</style>
