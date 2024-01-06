<template>
    <div style="height: 100vh; background-color: #f3f3f3;">
        <van-nav-bar title="已上传视频" left-text="返回" left-arrow fixed @click-left="router.push('home')" />
        <div style="padding-top: 60px;">
            <van-form @submit="onSubmit">
                <van-cell-group inset>
                    <van-field v-model="username" name="userName" label="用户名" placeholder="用户名" />
                    <van-field name="avatar" label="头像">
                        <template #input>
                            <van-uploader v-model="avatar" multiple :max-count="1" />
                        </template>
                    </van-field>
                </van-cell-group>
                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                        提交
                    </van-button>
                </div>
            </van-form>
        </div>


    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from "vue-router"
import { showToast } from 'vant';
import { useUserStore } from "../store/userStore"
import axios from "axios"


const userStore = useUserStore()
const router = useRouter()
const username = ref('');
const avatar = ref([]);

const onSubmit = async () => {
    if (!avatar.value[0] || !username.value) {
        showToast('请输入头像和用户名');
        return;
    };
    let f = avatar.value[0].file
    if(!f) {
        showToast('请上传头像');
        return;
    };
    let fd = new FormData();
    let hash = await caculateHash(f)
    let extenSion = f.name.substring(f.name.lastIndexOf("."));
    fd.append('avatarName', f.name);
    fd.append('avatarExtenSion', extenSion);
    fd.append('avatarHash', hash);
    fd.append('avatar', f);
    fd.append('userName', username.value);
    axios.post("/api/user/update", fd).then(res => {
        if (res.data.code !== 0) return;
        showToast('修改成功');
        userStore.setUser(res.data.data)
    })
};

function caculateHash(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = function (e) {
            let buffer = e.target.result;
            crypto.subtle.digest('SHA-1', new Uint8Array(buffer)).then(u8 => {
                let hash = Array.from(new Uint8Array(u8)).map(item => {
                    return item.toString(16).padStart(2, '0')
                }).join('')
                resolve(hash)
            })
        }
        reader.onerror = (error) => {
            reject(error)
        }
        reader.readAsArrayBuffer(file)
    })
}
</script>