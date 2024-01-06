<template>
    <div class="watch-contener" ref="watchContener">
        <van-nav-bar title="一起看" left-text="返回" left-arrow fixed @click-left="router.push('videoList')" />
        <div style="position: sticky; top: 0; z-index: 100;">
            <Video :videoName="videoName" :videoTogether="true" ref="videotogether" />
            <van-tabs v-model:active="active" @click-tab="onClickTab">
                <van-tab title="房间号"></van-tab>
                <van-tab :badge="badge" title="聊天"></van-tab>
            </van-tabs>
        </div>
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component @scroll="scrollToTop" @updateMsg="updateWaiteMsgEvent" :is="Component" />
            </keep-alive>
        </router-view>

    </div>
</template>


<script setup>
import { useRoute, useRouter } from "vue-router"
import { ref, onUnmounted, computed } from "vue"
import Video from "../components/Video.vue"
import socketClass from "../utils/socket"
import { useRoomStore } from "../store/roomStore"
import axios from "axios";
import { useMessageStore } from "../store/ChatMessageStore"


const messageStore = useMessageStore();
let roomStore = useRoomStore()
let socket = socketClass.getInstance();
const watchContener = ref(null)

const badge = computed(() => {
    if (messageStore.newMsg > 0 && !messageStore.isEnterChatPage) {
        return messageStore.newMsg
    } else {
        return null
    }
})

const scrollToTop = (x) => {
    watchContener.value.scrollTop = x
}

socket.waitMessage("chat", (data) => {
    if (!messageStore.isEnterChatPage) {
        messageStore.addNewMsg()
    }
    let msg = data.message
    messageStore.addMsg(msg)
})

onUnmounted(() => {
    axios(`/api/user/leaveRoom?roomId=${roomStore.roomId}`)
    roomStore.setRoomId(null)
    socket.canclelWaitMsg("chat") 
    roomStore.setRoomUsers([])
    messageStore.resetChatList()
})
const router = useRouter()
const route = useRoute()
const videoName = route.query.videoName || localStorage.getItem("videoName")
const active = ref(0);
const videotogether = ref(null)

const updateWaiteMsgEvent = () => { 
    videotogether.value.waitMessage()
}
const onClickTab = ({ name }) => {
    if (name === 1) {
        messageStore.resetNewMsg()
        messageStore.setIsEnterChatPage(true)
        setTimeout(() => {
            watchContener.value.scrollTop = 10000            
        }, 500);
    } else {
        messageStore.setIsEnterChatPage(false)
        // setTimeout(() => {
        //     console.log(11111)
        //     watchContener.value.scrollTop = 10000
        // }, 500)
    }
    router.push({
        name: name === 0 ? "room" : "chatPanel",
        query: {
            videoName: videoName
        }
    })
};
</script>

<style scoped>
:deep(.van-badge__wrapper) {
    overflow: visible;
}

.watch-contener {
    padding-top: 50px;
    background-color: #F7F8FA;
    width: 100%;
    height: 100vh;
}

:deep(.van-tabs__content) {
    height: 100%;
}
</style>
