import './scss/index.scss'

import {createApp} from 'vue'
import App from './App.vue'
import Utils from "./Utils";
import {
    ElAlert,
    ElButton,
    ElCheckbox,
    ElCol,
    ElContainer, ElDivider,
    ElForm,
    ElFormItem,
    ElInput,
    ElLink, ElPageHeader,
    ElRadio,
    ElRadioButton,
    ElRadioGroup,
    ElRow,
    ElScrollbar,
    ElSelect,
    ElTable,
    ElTag,
    ElTransfer
} from "element-plus";
import {createAppRouter} from "./Router";

const app = createApp(App)

// ElementPlus
app
    .use(ElContainer)
    .use(ElTable)
    .use(ElRow)
    .use(ElCol)
    .use(ElLink)
    .use(ElTag)
    .use(ElForm)
    .use(ElFormItem)
    .use(ElInput)
    .use(ElButton)
    .use(ElScrollbar)
    .use(ElAlert)
    .use(ElSelect)
    .use(ElRadio)
    .use(ElRadioGroup)
    .use(ElRadioButton)
    .use(ElCheckbox)
    .use(ElPageHeader)
    .use(ElDivider)
    .use(ElTransfer)

//app.use(createPinia())
app.use(createAppRouter())

app.use((app, options) => {
    app.config.globalProperties.$utils = Utils
    app.config.globalProperties.$openUrl = (url: string) => window.api.send('open:external:url', url)
})

app
    .mount('#app')
    .$nextTick(() => {
        postMessage({payload: 'removeLoading'}, '*')
    })