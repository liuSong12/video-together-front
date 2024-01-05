import axios from "axios";
import { useProgressStore } from "../store/uploadStore"
const progressStore = useProgressStore()

const sliceSize = 1024 * 1024 * 10;
const maxRequest = 6;

function upload(file) {
    return new Promise(async (resolve, reject) => {
        try {

            //检查是否超过最大上传视频数
            let res = maxRequestCheck(file)
            if (!res.flag) {
                resolve(res)
                return;
            }
            //切片
            const chunks = siliceFile(file)
            //计算hash
            let hash = await caculateHash(chunks)
            //过滤已经上传的切片
            let preUpload = await filterRepeat(hash, file.name.substring(file.name.lastIndexOf(".")))
            if (!preUpload.needUpload) {
                resolve({
                    message: "已经上传过了",
                    type: 'danger',
                    hash: hash
                });
                return
            };
            //添加进度
            progressStore.addProgress({ filename: file.name, progress: 0, hash })
            //构造formdata
            let formDataArr = chunksToFormData(chunks, hash, preUpload)
            //并发上传
            await requestUpload(formDataArr, maxRequest, file, hash)
            //发起合并
            await requestMerge(hash, file)
            resolve({
                message: "切片上传成功,正在合并",
                type: 'success'
            })
        } catch (error) {
            reject({
                message: error,
                type: 'danger'
            })
        }
    })
}

function maxRequestCheck(file) {
    if (progressStore.progresses.length >= 2) {
        return {
            message: "正在上传两个视频，请稍后再上传",
            type: 'danger',
            flag: false
        };
    }
    let flag = false
    progressStore.progresses.forEach(item => {
        if (item.filename === file.name) {
            flag = true
        }
    });
    if (flag) {
        return {
            message: "视频正在上传",
            type: 'warn',
            flag: false
        };
    }
    return {
        flag: true
    }
}

function filterRepeat(hash, e) {
    return new Promise((resolve, reject) => {
        axios(`/api/filter?fileHash=${hash}&fileExtension=${e}`).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err)
        })
    })
}


function requestMerge(hash, file) {
    return new Promise((resolve, reject) => {
        axios.post("/api/merge", {
            fileHash: hash,
            fileName: file.name
        }).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err)
        })
    })
}

function requestUpload(formDataArr, maxRequest, file, hash) {
    return new Promise((resolve, reject) => {
        let resultArr = []
        let index = 0
        let count = 0
        async function request() {
            let i = index
            let formData = formDataArr[index]
            index++;
            try {
                let res = await axios.post("/api/upload", formData)
                resultArr[i] = res.data
            } catch (error) {
                resultArr[i] = error
            } finally {
                count++;
                let progress = (count / formDataArr.length * 100).toFixed(2)
                progressStore.addProgress({ filename: file.name, progress: progress, hash })
                if (count === formDataArr.length) {
                    resolve(resultArr)
                }
                if (index < formDataArr.length) {
                    request()
                }
            }
        }
        for (let index = 0; index < Math.min(maxRequest, formDataArr.length); index++) {
            request()
        }
    })
}

function chunksToFormData(chunks, hash, preUpload) {
    let formDataArr = chunks.map((item, index) => {
        let formData = new FormData()
        formData.append('fileChunk', item)
        formData.append('fileHash', hash)
        formData.append('fileHashIndex', hash + "-" + index)
        return formData
    })
        .filter(item => !preUpload?.fileChunks?.includes(item.get("fileHashIndex")))
    return formDataArr
}

function caculateHash(chunks) {
    return new Promise((resolve, reject) => {
        const caculateChunks = []
        chunks.forEach((blob, i) => {
            if (i === 0 || i === chunks.length - 1) {
                caculateChunks.push(blob)
            } else {
                caculateChunks.push(blob.slice(0, 2))
                caculateChunks.push(blob.slice(Math.max(0, blob.size - 2), blob.size))
            }
        });
        let newFile = new Blob(caculateChunks)
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
        reader.readAsArrayBuffer(newFile)
    })
}


function siliceFile(file) {
    let index = 0;
    let chunks = []
    while (index < file.size) {
        let chunk = file.slice(index, index + sliceSize)
        chunks.push(chunk)
        index += sliceSize;
    }
    return chunks
}

export default upload;