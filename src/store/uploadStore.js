import { defineStore } from 'pinia'
import { ref } from "vue"

// useStore 可以是 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的唯一 id
export const useProgressStore = defineStore('progressStore', () => {
    const progresses = ref([])
    function addProgress(payload) {
        let flag = false
        progresses.value.forEach((item) => {
            if (item.hash === payload.hash) {
                item.progress = payload.progress
                flag = true
            }
        })
        if (!flag) {
            progresses.value.push(payload)
        }
        // {filename,progress,hash}
    }
    function removeProgress(hash) {
        progresses.value = progresses.value.filter((item) => item.hash !== hash)
    }
    return {
        addProgress,
        removeProgress,
        progresses
    }
})