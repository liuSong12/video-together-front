import { defineStore } from 'pinia'
import { ref } from "vue"

export const useRoomStore = defineStore('roomStore', () => {
    const roomId = ref(null)
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