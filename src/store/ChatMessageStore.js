import { defineStore } from "pinia"
import { ref } from 'vue'

export const useMessageStore = defineStore("messageStore", () => {
    const messageList = ref([])
    const isEnterChatPage = ref(false)
    const newMsg = ref(0)
    const addNewMsg = () => {
        newMsg.value++
    }
    const resetNewMsg = () => {
        newMsg.value = 0
    }
    const addMsg = (value) => {
        messageList.value.push(value)
    }
    const setIsEnterChatPage = (value) => {
        isEnterChatPage.value = value
    }
    const resetChatList=()=>{
        messageList.value = []
    }

    return {
        newMsg,
        addNewMsg,
        resetNewMsg,
        setIsEnterChatPage,
        isEnterChatPage,
        messageList,
        addMsg,
        resetChatList
    }
})