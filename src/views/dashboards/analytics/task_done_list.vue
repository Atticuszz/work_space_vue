<script setup>
import { onMounted } from 'vue'

import { VDataTable } from 'vuetify/labs/VDataTable'

// vDataTable
// eslint-disable-next-line import/no-duplicates
import { getRandomChipColor } from './taskDoneManager'

import {
  dataTable,
  itemCategoryEditDialog,
  itemEditDialog,
// eslint-disable-next-line import/no-duplicates
} from './taskDoneManager'

onMounted(async () => {
  if (dataTable.tableItems.length === 0) {
    await dataTable.fetchData()
    await itemCategoryEditDialog.init_category()
  }
})
</script>

<template>
  <!--  添加条目，添加类别，搜索框的功能栏 -->
  <VCardText>
    <VRow>
      <!-- 按钮区域 -->
      <VCol
        class="d-flex align-center"
        cols="8"
        md="8"
      >
        <div class="demo-space-x">
          <VBtn
            color="primary"
            variant="tonal"
            @click="itemEditDialog.addNewConfirm"
          >
            <VIcon>mdi-plus</VIcon>
          </VBtn>

          <VBtn
            color="warning"
            variant="tonal"
            @click="itemCategoryEditDialog.categoryDialog = true"
          >
            <VIcon>mdi-tag</VIcon>
          </VBtn>
        </div>
      </VCol>

      <!-- 搜索框 -->
      <VCol
        class="d-flex justify-end"
        cols="4"
        md="4"
      >
        <AppTextField
          v-model="dataTable.search"
          append-inner-icon="tabler-search"
          dense
          density="compact"
          hide-details
          outlined
          placeholder="Search"
          single-line
        />
      </VCol>
    </VRow>
  </VCardText>
  <VProgressLinear
    v-if="dataTable.tableItems.length === 0"
    color="primary"
    indeterminate
  />
  <!-- Data table -->
  <VDataTable
    v-else
    :headers="dataTable.headers"
    :items="dataTable.tableItems"
    :items-per-page="dataTable.options.itemsPerPage"
    :page="dataTable.options.page"
    :search="dataTable.search"
    :sort-by="dataTable.options.sortBy"
    :sort-desc="dataTable.options.sortDesc"
    @update:options="dataTable.options = $event"
  >
    <!-- 自定义task列 -->
    <template #item.task="{ item }">
      <div
        :style="{ overflow: 'auto', maxWidth: '100%' }"
        class="d-flex flex-wrap"
      >
        <VChip
          v-for="(task, index) in item.raw.task"
          :key="index"
          :color="getRandomChipColor()"
          :style="{ margin: '0 4px 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }"
        >
          {{ task }}
        </VChip>
      </div>
    </template>
    <!-- 自定义category列 -->
    <template #item.category="{ item }">
      <div
        v-for="(category, index) in item.raw.category"
        :key="index"
        :style="{ overflow: 'auto', maxWidth: '100%' }"
        class="d-flex flex-wrap"
      >
        <VChip
          :color="getRandomChipColor()"
          :style="{ margin: '0 4px 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }"
        >
          {{ category }}
        </VChip>
      </div>
    </template>
    <!-- 自定义location列 -->
    <template #item.location="{ item }">
      <div
        v-for="(location, index) in item.raw.location"
        :key="index"
        :style="{ overflow: 'auto', maxWidth: '100%' }"
        class="d-flex flex-wrap"
      >
        <VChip
          :color="getRandomChipColor()"
          :style="{ margin: '0 4px 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }"
        >
          {{ location }}
        </VChip>
      </div>
    </template>

    <!-- actions -->
    <template #item.actions="{ item }">
      <div class="d-flex gap-1">
        <IconBtn @click="itemEditDialog.editConfirm(item.raw,dataTable.tableItems)">
          <VIcon icon="mdi-pencil-outline"/>
        </IconBtn>
        <IconBtn @click="itemEditDialog.deleteConfirm(item.raw,dataTable.tableItems)">
          <VIcon icon="mdi-delete-outline"/>
        </IconBtn>
      </div>
    </template>
    <!--    底部显示条数 -->
    <template #bottom>
      <VCardText class="pt-2">
        <VRow>
          <VCol
            cols="3"
            lg="2"
          >
            <VTextField
              v-model="dataTable.options.itemsPerPage"
              hide-details
              label="Rows per page:"
              max="15"
              min="-1"
              type="number"
              variant="underlined"
            />
          </VCol>
          <VCol
            class="d-flex justify-end"
            cols="9"
            lg="10"
          >
            <VPagination
              v-model="dataTable.options.page"
              :length="Math.ceil(dataTable.tableItems.length / dataTable.options.itemsPerPage)"
              total-visible="5"
            />
          </VCol>
        </VRow>
      </VCardText>
    </template>
  </VDataTable>
  <!-- 👉 Edit item Dialog  -->
  <VDialog
    v-model="itemEditDialog.editDialog"
    max-width="600px"
  >
    <VCard>
      <VCardTitle>
        <span class="headline">Edit Task</span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VRow>
            <!-- category（类别） -->
            <VCol cols="12" md="4" sm="4">
              <AppAutocomplete
                v-model="itemEditDialog.editedItem.category"
                :items="itemCategoryEditDialog.allLists.category"
                chips
                closable-chips
                label="Category"
                multiple
                variant="outlined"
              />
            </VCol>

            <!-- task（任务） -->
            <VCol cols="12" md="4" sm="4">
              <AppAutocomplete
                v-model="itemEditDialog.editedItem.task"
                :items="itemCategoryEditDialog.allLists.task"
                chips
                closable-chips
                label="Task"
                multiple
                outlined
              />
            </VCol>


            <!-- location（地点） -->
            <VCol cols="12" md="4" sm="4">
              <AppAutocomplete
                v-model="itemEditDialog.editedItem.location"
                :items="itemCategoryEditDialog.allLists.location"
                chips
                closable-chips
                label="Location"
                multiple
                outlined
              />
            </VCol>

            <!-- date（日期） -->
            <VCol cols="12" md="6" sm="6">
              <VTextField
                v-model="itemEditDialog.editedItem.date"
                label="Date"
                outlined
              />
            </VCol>
            <!-- slot（时间段） -->
            <VCol cols="12" md="6" sm="6">
              <VTextField
                v-model="itemEditDialog.editedItem.slot"
                label="Slot"
                outlined
              />
            </VCol>
            <!-- detail（详细） -->
            <VCol cols="12">
              <VTextarea
                v-model="itemEditDialog.editedItem.detail"
                auto-grow
                label="Detail"
                outlined
              />
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>

      <VCardActions>
        <VSpacer/>

        <VBtn color="error" variant="outlined" @click="itemEditDialog.closeEdit">
          cancel
        </VBtn>

        <VBtn color="success" variant="elevated" @click="itemEditDialog.editItem(dataTable.tableItems)">
          save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>


  <!-- 👉 Delete item Dialog  -->
  <VDialog
    v-model="itemEditDialog.deleteDialog"
    max-width="500px"
  >
    <VCard>
      <VCardTitle>
        Are you sure you want to delete this item?
      </VCardTitle>

      <VCardActions>
        <VSpacer/>

        <VBtn
          color="error"
          variant="outlined"
          @click="itemEditDialog.closeDelete"
        >
          Cancel
        </VBtn>

        <VBtn
          color="success"
          variant="elevated"
          @click="itemEditDialog.deleteItem(dataTable.tableItems)"
        >
          OK
        </VBtn>

        <VSpacer/>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- 👉 Add categories Dialog -->
  <VDialog
    v-model="itemCategoryEditDialog.categoryDialog"
    max-width="800px"
  >
    <VCard>
      <VCardTitle>
        Manage Categories
      </VCardTitle>
      <VCardText>
        <VRow>
          <!-- Loop through different category types -->
          <VCol
            v-for="(itemList, listName) in itemCategoryEditDialog.allLists"
            :key="listName"
            class="py-4"
          >
            <h4>{{ listName }}</h4> <!-- 显示数据的键名作为列的名称 -->
            <div
              v-for="(item, index) in itemList"
              :key="item"
              class="my-2"
            >
              <VChip
                :color="getRandomChipColor()"
                closable
                @click:close="itemCategoryEditDialog.removeCatItem(itemList, index,listName)"
              >
                {{ item }}
              </VChip>
            </div>
            <!-- Text field for entering new items -->
            <VTextField
              v-model="itemCategoryEditDialog.newItemCategories[listName]"
              class="mb-0"
              dense
              hide-details
              label="New Category"
              outlined
              prepend-inner-icon="mdi-plus"
              @click:prepend-inner="itemCategoryEditDialog.addCatItem(itemList, listName)"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VBtn
          color="error"
          @click="itemCategoryEditDialog.categoryDialog = false"
        >
          Cancel
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>


  <!-- Similar dialog boxes for Task and Location -->
</template>
