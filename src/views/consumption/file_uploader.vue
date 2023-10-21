<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'

const file = ref(null) // 注意这里初始化为 null
const loading = ref(false)
const password = ref('')

const uploadFile = async () => {
  loading.value = true // 开始上传，设置loading为true
  const formData = new FormData()

  if (file.value) {
    formData.append('file', file.value[0]) // 注意这里是 file.value[0]
    formData.append('password', password.value)

    try {
      await axios.post('http://localhost:5000/consumption/update_consumption', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      alert('文件成功上传并处理。')
    } catch (error) {
      alert('文件上传失败。')
    }
  } else {
    alert('请选择一个文件。')
  }

  loading.value = false // 上传完成，设置loading为false
}
</script>

<template>
  <VCard title="uploader">
    <VCardItem>
      <VFileInput
        v-model="file"
        :loading="loading"
        chips
        counter
        multiple
        show-size
        variant="solo-filled"
      />
    </VCardItem>
    <VCardText>
      <VTextField
        v-model="password"
        label="password"
        variant="underlined"
        clearable
      />
    </VCardText>
    <VCardItem>
      <VBtn @click="uploadFile">upload</VBtn>
    </VCardItem>
  </VCard>
</template>

<style lang="scss" scoped>

</style>
