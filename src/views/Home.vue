<template>
    <div class="btn-container">
        <van-button class="btn" type="primary" size="small" @click='goto("videoList")'>看电影</van-button>
        <van-button class="btn" type="success" size="small" @click='goto("uploadvideo")'>上传电影</van-button>
        <van-button class="btn" type="default" size="small">通话</van-button>
    </div>
</template>


<script setup>
import {useRouter} from "vue-router"
let router = useRouter()
const goto = (route) => {
    router.push(route)
}
</script>

<style scoped>
.btn-container{
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
    padding-bottom: 250px;
}
.btn{
    overflow: hidden;
    width: 100px;
    margin-bottom: 20px;
}
</style>