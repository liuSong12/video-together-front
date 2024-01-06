<template>
    <div>
        <van-nav-bar title="视频通话" left-text="返回" left-arrow fixed @click-left="router.push('home')" />
        <van-list class="van-list">
            <van-cell>小明</van-cell>
            <van-cell>上传电影</van-cell>
            <van-cell>视频通话</van-cell>
        </van-list>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { ref } from "vue"
import axios from "axios"


const userList = ref([])
axios("/api/user/allUser").then(res=>{
    if(res.data.code!==0) return;
    console.log(res.data)
})











const router = useRouter()

</script>