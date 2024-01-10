<template>
    <div>
        <div class="login-form">
            <van-form class="form" @submit="onSubmit">
                <van-field v-model="data.phone" name="phone" label="手机号" placeholder="手机号"
                    :rules="[{ required: true, message: '请填写手机号' }]" type="number" />
                <van-field v-model="data.code" center clearable label="短信验证码"
                    :rules="[{ required: true, message: '请填写验证码' }]" placeholder="请输入短信验证码">
                    <template #button>
                        <van-button @click="sendCode" size="small" type="primary">{{ td === 0 ? '发送验证码' : td }}</van-button>
                    </template>
                </van-field>
                <div style="margin: 16px;">
                    <van-button type="primary" block native-type="submit">登录</van-button>
                </div>
            </van-form>
        </div>
        <vue-particles id="tsparticles" :options="config" />

    </div>
</template>

<script setup>
import { reactive,ref,onMounted } from 'vue';
import axios from "axios"
import { useRouter } from "vue-router"
import { useUserStore } from '../store/userStore'
import { showToast } from "vant"


const userStore = useUserStore()
const td = ref(0)
const router = useRouter()
const data = reactive({
    phone: "",
    code: "",
})


onMounted(() => {
    document.addEventListener('plusready', function () {
        let time = null;
        var webview = window.plus.webview.currentWebview();
        window.plus.key.addEventListener('backbutton', function () {
            webview.canBack(function (e) {
                if (!time) {
                    time = new Date().getTime();
                    plus.nativeUI.toast("再按一次退出应用", {
                        duration: 'short'
                    });
                    setTimeout(function () {
                        time = null;
                    }, 1000);
                } else {
                    if (new Date().getTime() - time < 1000) {
                        window.plus.runtime.quit();
                        webview.close()
                    }
                }
            })
        });
    })
})

let t;


const sendCode = () => {
    if (data.phone === "") {
        showToast("请填写手机号")
        return
    }
    axios.post("/api/user/sendCode", { phone: data.phone }).then(res => {
        if (res.data.code !== 0) return;
        showToast("验证码已发送")
        if(t) return;
        td.value = 60;
        t = setInterval(() => {
            if (td.value > 0) {
                td.value--
            } else {
                clearInterval(t)
                t = null
                td.value = 0
            }
        }, 1000);
    })
}

function onSubmit() {
    axios.post("/api/user/login", data).then(res => {
        if (res.data.code !== 0) return;
        userStore.setUser(res.data.data)
        router.push("/")
    })
}

const config = {
    "autoPlay": true,
    "background": {
        "color": {
            "value": "#ffffff"
        },
        "image": "url('https://particles.js.org/images/background3.jpg')",
        "position": "50% 50%",
        "repeat": "no-repeat",
        "size": "cover",
        "opacity": 1
    },
    "backgroundMask": {
        "composite": "destination-out",
        "cover": {
            "color": {
                "value": {
                    "r": 255,
                    "g": 255,
                    "b": 255
                }
            },
            "opacity": 1
        },
        "enable": true
    },
    "clear": true,
    "defaultThemes": {},
    "delay": 0,
    "fullScreen": {
        "enable": true,
        "zIndex": 0
    },
    "detectRetina": true,
    "duration": 0,
    "fpsLimit": 120,
    "interactivity": {
        "detectsOn": "window",
        "events": {
            "onClick": {
                "enable": true,
                "mode": "push"
            },
            "onDiv": {
                "selectors": [],
                "enable": false,
                "mode": [],
                "type": "circle"
            },
            "onHover": {
                "enable": true,
                "mode": "bubble",
                "parallax": {
                    "enable": false,
                    "force": 2,
                    "smooth": 10
                }
            },
            "resize": {
                "delay": 0.5,
                "enable": true
            }
        },
        "modes": {
            "trail": {
                "delay": 1,
                "pauseOnStop": false,
                "quantity": 1
            },
            "attract": {
                "distance": 200,
                "duration": 0.4,
                "easing": "ease-out-quad",
                "factor": 1,
                "maxSpeed": 50,
                "speed": 1
            },
            "bounce": {
                "distance": 200
            },
            "bubble": {
                "distance": 400,
                "duration": 2,
                "mix": false,
                "opacity": 1,
                "size": 100,
                "divs": {
                    "distance": 200,
                    "duration": 0.4,
                    "mix": false,
                    "selectors": []
                }
            },
            "connect": {
                "distance": 80,
                "links": {
                    "opacity": 0.5
                },
                "radius": 60
            },
            "grab": {
                "distance": 100,
                "links": {
                    "blink": false,
                    "consent": false,
                    "opacity": 1
                }
            },
            "push": {
                "default": true,
                "groups": [],
                "quantity": 4
            },
            "remove": {
                "quantity": 2
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4,
                "factor": 100,
                "speed": 1,
                "maxSpeed": 50,
                "easing": "ease-out-quad",
                "divs": {
                    "distance": 200,
                    "duration": 0.4,
                    "factor": 100,
                    "speed": 1,
                    "maxSpeed": 50,
                    "easing": "ease-out-quad",
                    "selectors": []
                }
            },
            "slow": {
                "factor": 3,
                "radius": 200
            },
            "light": {
                "area": {
                    "gradient": {
                        "start": {
                            "value": "#ffffff"
                        },
                        "stop": {
                            "value": "#000000"
                        }
                    },
                    "radius": 1000
                },
                "shadow": {
                    "color": {
                        "value": "#000000"
                    },
                    "length": 2000
                }
            }
        }
    },
    "manualParticles": [],
    "particles": {
        "bounce": {
            "horizontal": {
                "value": 1
            },
            "vertical": {
                "value": 1
            }
        },
        "collisions": {
            "absorb": {
                "speed": 2
            },
            "bounce": {
                "horizontal": {
                    "value": 1
                },
                "vertical": {
                    "value": 1
                }
            },
            "enable": false,
            "maxSpeed": 50,
            "mode": "bounce",
            "overlap": {
                "enable": true,
                "retries": 0
            }
        },
        "color": {
            "value": "#ffffff",
            "animation": {
                "h": {
                    "count": 0,
                    "enable": false,
                    "speed": 1,
                    "decay": 0,
                    "delay": 0,
                    "sync": true,
                    "offset": 0
                },
                "s": {
                    "count": 0,
                    "enable": false,
                    "speed": 1,
                    "decay": 0,
                    "delay": 0,
                    "sync": true,
                    "offset": 0
                },
                "l": {
                    "count": 0,
                    "enable": false,
                    "speed": 1,
                    "decay": 0,
                    "delay": 0,
                    "sync": true,
                    "offset": 0
                }
            }
        },
        "effect": {
            "close": true,
            "fill": true,
            "options": {},
            "type": []
        },
        "groups": {},
        "move": {
            "angle": {
                "offset": 0,
                "value": 90
            },
            "attract": {
                "distance": 200,
                "enable": false,
                "rotate": {
                    "x": 3000,
                    "y": 3000
                }
            },
            "center": {
                "x": 50,
                "y": 50,
                "mode": "percent",
                "radius": 0
            },
            "decay": 0,
            "distance": {},
            "direction": "none",
            "drift": 0,
            "enable": true,
            "gravity": {
                "acceleration": 9.81,
                "enable": false,
                "inverse": false,
                "maxSpeed": 50
            },
            "path": {
                "clamp": true,
                "delay": {
                    "value": 0
                },
                "enable": false,
                "options": {}
            },
            "outModes": {
                "default": "out",
                "bottom": "out",
                "left": "out",
                "right": "out",
                "top": "out"
            },
            "random": false,
            "size": false,
            "speed": 2,
            "spin": {
                "acceleration": 0,
                "enable": false
            },
            "straight": false,
            "trail": {
                "enable": false,
                "length": 10,
                "fill": {}
            },
            "vibrate": false,
            "warp": false
        },
        "number": {
            "density": {
                "enable": true,
                "width": 1920,
                "height": 1080
            },
            "limit": {
                "mode": "delete",
                "value": 0
            },
            "value": 80
        },
        "opacity": {
            "value": 1,
            "animation": {
                "count": 0,
                "enable": false,
                "speed": 2,
                "decay": 0,
                "delay": 0,
                "sync": false,
                "mode": "auto",
                "startValue": "random",
                "destroy": "none"
            }
        },
        "reduceDuplicates": false,
        "shadow": {
            "blur": 0,
            "color": {
                "value": "#000"
            },
            "enable": false,
            "offset": {
                "x": 0,
                "y": 0
            }
        },
        "shape": {
            "close": true,
            "fill": true,
            "options": {},
            "type": "circle"
        },
        "size": {
            "value": {
                "min": 1,
                "max": 30
            },
            "animation": {
                "count": 0,
                "enable": false,
                "speed": 5,
                "decay": 0,
                "delay": 0,
                "sync": false,
                "mode": "auto",
                "startValue": "random",
                "destroy": "none"
            }
        },
        "stroke": {
            "width": 0
        },
        "zIndex": {
            "value": 0,
            "opacityRate": 1,
            "sizeRate": 1,
            "velocityRate": 1
        },
        "destroy": {
            "bounds": {},
            "mode": "none",
            "split": {
                "count": 1,
                "factor": {
                    "value": 3
                },
                "rate": {
                    "value": {
                        "min": 4,
                        "max": 9
                    }
                },
                "sizeOffset": true,
                "particles": {}
            }
        },
        "roll": {
            "darken": {
                "enable": false,
                "value": 0
            },
            "enable": false,
            "enlighten": {
                "enable": false,
                "value": 0
            },
            "mode": "vertical",
            "speed": 25
        },
        "tilt": {
            "value": 0,
            "animation": {
                "enable": false,
                "speed": 0,
                "decay": 0,
                "sync": false
            },
            "direction": "clockwise",
            "enable": false
        },
        "twinkle": {
            "lines": {
                "enable": false,
                "frequency": 0.05,
                "opacity": 1
            },
            "particles": {
                "enable": false,
                "frequency": 0.05,
                "opacity": 1
            }
        },
        "wobble": {
            "distance": 5,
            "enable": false,
            "speed": {
                "angle": 50,
                "move": 10
            }
        },
        "life": {
            "count": 0,
            "delay": {
                "value": 0,
                "sync": false
            },
            "duration": {
                "value": 0,
                "sync": false
            }
        },
        "rotate": {
            "value": 0,
            "animation": {
                "enable": false,
                "speed": 0,
                "decay": 0,
                "sync": false
            },
            "direction": "clockwise",
            "path": false
        },
        "orbit": {
            "animation": {
                "count": 0,
                "enable": false,
                "speed": 1,
                "decay": 0,
                "delay": 0,
                "sync": false
            },
            "enable": false,
            "opacity": 1,
            "rotation": {
                "value": 45
            },
            "width": 1
        },
        "links": {
            "blink": false,
            "color": {
                "value": "#ffffff"
            },
            "consent": false,
            "distance": 150,
            "enable": true,
            "frequency": 1,
            "opacity": 1,
            "shadow": {
                "blur": 5,
                "color": {
                    "value": "#000"
                },
                "enable": false
            },
            "triangles": {
                "enable": false,
                "frequency": 1
            },
            "width": 1,
            "warp": false
        },
        "repulse": {
            "value": 0,
            "enabled": false,
            "distance": 1,
            "duration": 1,
            "factor": 1,
            "speed": 1
        }
    },
    "pauseOnBlur": true,
    "pauseOnOutsideViewport": true,
    "responsive": [],
    "smooth": false,
    "style": {},
    "themes": [],
    "zLayers": 100,
    "name": "Background Mask",
    "motion": {
        "disable": false,
        "reduce": {
            "factor": 4,
            "value": true
        }
    }
}
</script>


<style scoped lang="scss">
:deep(.login-form) {
    position: absolute;
    inset: 0;
    z-index: 100;

    .form {
        margin: auto 10px;
        border-radius: 5px;
        padding: 5px;
        background-color: rgb(255, 255, 255);
        border: 2px solid #9b96ca;
        margin-top: 120px;
    }
}
</style>