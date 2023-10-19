<script lang="ts" setup>
import Task_done_list from "@/views/dashboards/analytics/task_done_list.vue"
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()
</script>

<template>
  <VRow class="match-height">
    <!-- 👉 Website analytics -->
    <VCol cols="12">
      <VCard title="Task Done List">
        <task_done_list/>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
