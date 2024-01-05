<template>
    <div style="width: 100%; height: 100vh;">
        <van-nav-bar title="已上传视频" left-text="返回" left-arrow fixed @click-left="onClickLeft" />
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                <van-cell v-for="item in list" :key="item">
                    <van-cell-group :border="false">
                        <div class="content"  @click="onClick(item)">
                            <div class="title">
                                {{ item }}
                            </div>
                            <van-image class="van-image" fit="contain" :src="getImg(item)" />
                        </div>
                    </van-cell-group>

                </van-cell>
            </van-list>
        </van-pull-refresh>
    </div>
</template>


<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from "vue-router"


const router = useRouter()
const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);


let token = localStorage.getItem("token")
const getImg = (item) => {
    item.substring(0, item.lastIndexOf('.'))
    return `/api/getPoster?posterName=${item}&authorization=${token}`
}

const onClick = (item)=>{
    router.push({
        name: 'videoWatch',
        query: {
            videoName: item
        }
    })
}
const onClickLeft = () => {
    router.push("/")
}
const onLoad = async () => {
    let videoList = await axios("/api/getVideoList")
    list.value = videoList.data;
    loading.value = false;
    finished.value = true;
    refreshing.value = false;

};
onLoad()

const onRefresh = () => {
    // 清空列表数据
    finished.value = false;

    // 重新加载数据
    // 将 loading 设置为 true，表示处于加载状态
    loading.value = true;
    onLoad();
};
</script>

<style scoped lang="less">
.pull-refresh {
    width: 100%;
    height: 100vh;
    padding-top: 50px;
}

.content {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 10px;

    .title {
        position: absolute;
        bottom: 10px;
        left: 20px;
        z-index: 1;
        color: white;
        font-size: 25px;
        width: 80%;
        overflow: hidden;
        text-wrap: nowrap;
        text-overflow: ellipsis;
    }

    :deep(.van-image){
        width: 100%;
        height: 100%;

    }
    :deep(.van-image img){
        object-fit:cover !important;
        //居中
    }
}</style>