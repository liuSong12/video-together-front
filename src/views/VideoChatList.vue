<template>
    <div>
        <van-nav-bar title="视频通话" left-text="返回" left-arrow fixed @click-left="router.push('home')" />
        <UserList style="padding-top: 50px;" :userList="userList"/>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { ref,onMounted } from "vue"
import axios from "axios"
import UserList from "../components/UserList.vue";
import socketClass from "../utils/socket"

let socket = socketClass.getInstance();
const userList = ref([])



socket.waitMessage("online",(data)=>{
    let users = JSON.parse(data.message)
    userList.value = users
})


axios("/api/user/allUser").then(res=>{
    if(res.data.code!==0) return;
    userList.value = res.data.data
})

const router = useRouter()

onMounted(() => {
    document.addEventListener('plusready', function () {
        var webview = window.plus.webview.currentWebview();
        window.plus.key.addEventListener('backbutton', function () {
            webview.canBack(function (e) {
                router.push("home")
            })
        });
    })
})

</script>


<style scoped>
.van-list{
    padding-top: 70px;
}
</style>