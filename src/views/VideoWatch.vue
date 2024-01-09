<template>
    <div class="watch-contener" ref="watchContener">
        <!-- 添加弹幕 -->
        <!-- <span class="bullet-chat" :key="item.top" @animationend="animationend(item.msg)" :style="{ top: item.top + 'px' }" v-for="item in bulletChatList">
            {{ item.msg }}
        </span> -->
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
const bulletChatList = ref([])
const animationend = (msg) => {
    console.log(msg)
    bulletChatList.value = bulletChatList.value.filter(item => item.msg !== msg)
}
const badge = computed(() => {
    if (messageStore.newMsg > 0 && !messageStore.isEnterChatPage) {
        return messageStore.newMsg
    } else {
        return null
    }
})

const randomTop = () => {
    let max = window.innerHeight - window.innerHeight / 2
    let min = 50;
    return Math.floor(Math.random() * (max - min) + 1) + min
}

const scrollToTop = (x) => {
    watchContener.value.scrollTop = x
}

socket.waitMessage("chat", (data) => {
    if (messageStore.isFull) {
        //这里要弹幕
        bulletChatList.value.push({
            msg: data.message.message,
            top: randomTop()
        })
    }
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
        }, 200);
    } else {
        messageStore.setIsEnterChatPage(false)
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
.bullet-chat {
    position: absolute;
    top: 100;
    right: 0;
    color: white;
    animation: moveLeft 7s linear;
    white-space: nowrap;
    z-index: 9999999;
}

@keyframes moveLeft {
    from {
        left: 100%;
    }

    to {
        left: -50%;
    }
}

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
