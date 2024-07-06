import axios from "axios";
import store from "../store";
import router from "../router";

const api = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
    withCredentials: true
  });
  
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        // Clear local storage or Vuex state and redirect to login
        store.dispatch("logout").then(() => {
          router.push({ name: "Login" });
        });
      }
      return Promise.reject(error);
    }
  );

export default api;