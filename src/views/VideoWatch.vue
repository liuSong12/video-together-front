<template>
    <div class="watch-contener">
        <van-nav-bar title="一起看" left-text="返回" left-arrow fixed @click-left="router.push('videoList')" />
        <Video :videoName="videoName" :videoTogether="true" ref="videotogether" style="margin-top: 50px;" />
        <van-tabs v-model:active="active" @click-tab="onClickTab">
            <van-tab title="房间号">
                <router-view @updateMsg="updateWaiteMsgEvent"></router-view>
            </van-tab>
            <van-tab title="聊天">
                <router-view></router-view>
            </van-tab>
        </van-tabs>
    </div>
</template>


<script setup>
import { useRoute, useRouter } from "vue-router"
import { ref,onUnmounted } from "vue"
import Video from "../components/Video.vue"
import socketClass from "../utils/socket"
import {useRoomStore} from "../store/roomStore"
let roomStore = useRoomStore()
let socket = socketClass.getInstance();

onUnmounted(()=>{
    roomStore.setRoomId(null)
    roomStore.setRoomUsers([])
    socket.closeConnection()
})
const router = useRouter()
const route = useRoute()
const videoName = route.query.videoName
const active = ref(0);
const videotogether= ref(null)

const updateWaiteMsgEvent = ()=>{
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
    background-color: #F7F8FA;
    width: 100%;
    height: 100%;
}

:deep(.van-tabs__content) {
    height: 100%;
}
</style>
