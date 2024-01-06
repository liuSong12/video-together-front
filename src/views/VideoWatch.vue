<template>
    <div class="watch-contener" ref="watchContener">
        <van-nav-bar title="一起看" left-text="返回" left-arrow fixed @click-left="router.push('videoList')" />
        <div style="position: sticky; top: 0; z-index: 100;">
            <Video :videoName="videoName" :videoTogether="true" ref="videotogether" />
            <van-tabs v-model:active="active" @click-tab="onClickTab">
                <van-tab title="房间号"></van-tab>
                <van-tab title="聊天"></van-tab>
            </van-tabs>
        </div>
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component ref="chatChild" @scroll="scrollToTop" @updateMsg="updateWaiteMsgEvent" :is="Component" />
            </keep-alive>
        </router-view>

    </div>
</template>


<script setup>
import { useRoute, useRouter } from "vue-router"
import { ref, onUnmounted } from "vue"
import Video from "../components/Video.vue"
import socketClass from "../utils/socket"
import { useRoomStore } from "../store/roomStore"
import axios from "axios";
let roomStore = useRoomStore()
let socket = socketClass.getInstance();
const watchContener = ref(null)
const chatChild = ref(null)

const scrollToTop = (x) => {
    watchContener.value.scrollTop = x
}

socket.waitMessage("chat", (data) => {
    let list = localStorage.getItem("newMssage", data.videoName)
    if(list){
        let listInfo = JSON.parse(list)
        listInfo = listInfo.push(data.message)
        localStorage.setItem("newMssage", JSON.stringify(listInfo))
    }else{
        let newInfo = [JSON.stringify(data.message)]
        localStorage.setItem("newMssage", newInfo)
    }
})

onUnmounted(() => {
    axios(`/api/user/leaveRoom?roomId=${roomStore.roomId}`)
    roomStore.setRoomId(null)
    socket.canclelWaitMsg("chat")
    roomStore.setRoomUsers([])
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
    router.push({
        name: name === 0 ? "room" : "chatPanel",
        query: {
            videoName: videoName
        }
    })
};
</script>

<style scoped>
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
