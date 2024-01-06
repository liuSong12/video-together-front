import { defineStore } from 'pinia'
import { ref } from "vue"

export const useEnterStore = defineStore('enterStore', () => {
    const isEnter = ref(false)
    const roomUsers = ref([])
    function setRoomId(id) {
        roomId.value = id
    }
    function setRoomUsers(users){
        roomUsers.value = users
    }
    return {
        roomUsers,
        setRoomUsers,
        setRoomId,
        roomId
    }
})