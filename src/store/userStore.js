import { defineStore } from 'pinia'
import { ref } from "vue"

export const useUserStore = defineStore('userStore', () => {
    const user = ref(null)
    function setUser(payload) {
        user.value = payload
    }
    return {
        user, setUser
    }
},{
    persist: true
})