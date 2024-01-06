<template>
    <div>
        <van-list>
            <van-cell v-for="item in props.userList" :key="item">
                <div class="user-info">
                    <div class="avatar">
                        <img :src="avatar(item.avatar)"/>
                    </div>
                    <div class="userId">
                        id：{{ item.id }}
                    </div>
                    <div class="userName">
                        {{ item.userName || "无名" }}
                    </div>
                </div>
            </van-cell>
        </van-list>
    </div>
</template>


<script setup>

const props = defineProps({
    userList:{
        default:[],
        type:Array
    }
})
let token = localStorage.getItem("token")
const avatar = (src) =>{
    if(!src){
        return '/avatar.png'
    }else{
        return `/api/user/${src}?authorization=${token}` 
    }
}
</script>


<style scoped lang="scss">
.user-info{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 50px;
    border-radius: 3px;
    background-color: #f1f1f1;
    padding: 5px;
    margin: 5px;
    .userId{
        margin-right: 10px;
    }
    .avatar{
        display: flex;
        justify-content: center;
        align-items: center;
        img{
            width:40px;
            height:40px;
            border-radius:50%;
            margin-right: 10px;
        }
    }
}
</style>