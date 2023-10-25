import {defineStore} from 'pinia'
import {v4 as uuidv4} from 'uuid'
import axios from '@axios' // Assuming you are using axios for HTTP requests

const defaultItem
  = {
    date: '',
    category: [],
    task: [],
    target: [],
    detail: '',
    slot: '',
    location: [],
    uuid: '',
}

export const useTasksStore = defineStore({
  id: 'tasks',

  state: () => ({
    // background task
    workingTasks: 0,

    // table data
    headers: [
      {
        title: 'Date',
        key: 'date',
        sortable: true,
        width: '10%',
      },
      {
        title: 'Slot',
        key: 'slot',
        sortable: true,
        width: '10%',
      },
      {
        title: 'Category',
        key: 'category',
        width: '10%',
      },
      {
        title: 'Task',
        key: 'task',
        width: '10%',
      },
      {
        title: 'target',
        key: 'target',
        width: '10%',
      },
      {
        title: 'Location',
        key: 'location',
        width: '5%',
      },
      {
        title: 'Detail',
        key: 'detail',
        width: '45%',
      },

    ],
    tableItems: [],
    options: {
      page: 1,
      itemsPerPage: 15,
      sortBy: ['slot', 'date'], // 首先按 'slot' 排序，然后按 'date' 排序
      sortDesc: [true, true], // 'slot' 升序，'date' 升序
    },
    tableSearch: '',
    loading: true,

    // edit dialog data
    editDialog: false,
    editedItem: defaultItem,
    autocompleteSearch: {
      location: null,
      category: null,
      target: null,
      task: null,
    },

    // category data
    allLists: {
      task: [],
      location: [],
      target: [],
      category: [],
    },
    newItemCategories: {
      category: '',
      task: '',
      target: '',
      location: '',
    },
    categoryDialog: false,

  }),

  getters: {
    isEmpty: state => {
      return state.tableItems.length === 0
    },
  },

  actions: {
    // tools
    getRandomChipColor() {
      const colors = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
      const randomIndex = Math.floor(Math.random() * colors.length)

      return colors[randomIndex]
    },

    // table action
    async fetchData() {
      // console.log('Fetching data...')
      this.loading = true
      this.workingTasks++ // 增加正在进行的异步任务的数量
      try {
        const response = await axios.get('http://localhost:5000/task_entries/get_all_table_items')

        this.tableItems = response.data.map(item => {
          return {
            uuid: item.uuid,
            date: item.date,
              category: item.category,
              task: item.task,
              detail: item.detail,
              slot: item.slot,
              target: item.target,
              location: item.location,
          }
        })

          // console.log('this.tableItems:', this.tableItems)
      } catch (error) {
          console.error('There was a problem fetching data:', error)
      } finally {
          this.workingTasks-- // 减少正在进行的异步任务的数量
          this.loading = false
      }
    },

    // edit dialog action
    openEditDialog(item) {
      console.log('item:', item)
      if (!item.uuid)
        this.editedItem.date = new Date().toLocaleDateString().replace(/\//g, '-')
      else
        this.editedItem = item

      this.editDialog = true
    },
    onAutocompleteSearch(newValue, listname) {
      console.log('newvalue:', newValue, 'listname:', listname)
      this.autocompleteSearch[listname] = newValue
    },

    async setItemContent(event, listname) {
      // console.log('Event Target:', event.target)
      // console.log('Event Current Target:', event.currentTarget)
      console.log('this.autocompleteSearch:', this.autocompleteSearch)

      // set chosen value to v-model
      const chosen = this.autocompleteSearch[listname]
      if (chosen.length === 0)
        return

      // no-exist
      if (!this.allLists[listname].includes(chosen)) {
        this.editedItem[listname].push(chosen)
        this.autocompleteSearch[listname] = ''
        this.newItemCategories[listname] = chosen
        await this.addCategory(listname)
      }
    },
    async upsertTask() {
      // Make your API call to add a task
      this.workingTasks++
      try {
          const data_to_upsert = JSON.stringify(this.editedItem)
          const url = 'http://localhost:5000/task_entries/upsert_entry'

          console.log('data_to_upsert', data_to_upsert)
          await axios({
              url,
              method: 'post',
              headers: {'Content-Type': 'application/json'},
              data: data_to_upsert,
          })
      } catch (error) {
          console.error('There was a problem with upsertTask:', error)
      } finally {
          this.workingTasks--
      }
    },
    async deleteTask() {
      this.editDialog = false
      this.tableItems.splice(this.editedIndex, 1)

      // Make your API call to delete a task
      const uuid = this.editedItem.uuid
      const url = `http://localhost:5000/task_entries/delete_entry/${uuid}`

      this.workingTasks++
        try {
            await axios.delete(url)
            await this.fetchData()
        } catch (error) {
            console.error('There was a problem with deleteTask:', error)
        } finally {
            this.workingTasks--
            this.closeEditDialog()
        }
    },
    async saveEditedItem() {
      this.editDialog = false

      // background do the following:
      // 如果 editedIndex 是 -1，则是新任务；否则是更新任务
      if (this.editedItem.uuid === '')
        this.editedItem.uuid = uuidv4()

      // database refresh
      await this.upsertTask()
      await this.fetchData()
      this.closeEditDialog()
    },
    closeEditDialog() {
      console.log('editItem:', this.editedItem)
      this.editDialog = false
      this.editedItem = { ...this.editedItem }
      this.editedItem.detail = ''
      this.editedItem.uuid = ''
    },

    // category action
    async initCategory() {
      // console.log('init_category ...')
      this.workingTasks++
        try {
            const response = await axios.get('http://localhost:5000/task_categories/get_all_task_category')

            this.allLists = response.data
        } catch (error) {
            console.error('There was a problem with init_category:', error)
        } finally {
            this.workingTasks--
        }
    },
    async addCategory(listName) {
      console.log('Called addCategory is called')

      const newItem = this.newItemCategories[listName].trim()
      if (newItem !== '') {
        this.workingTasks++
        console.log('add newItem:', newItem)
          try {
              await axios.put(`http://localhost:5000/task_categories/update_category/${listName}`, {add: newItem})
              await this.initCategory()
          } catch (error) {
              console.error('There was a problem adding category:', error)
          } finally {
              this.workingTasks--
              this.newItemCategories[listName] = ''
          }
      }
    },
    async removeCatItem(index, listName) {
      // console.log('Called removeCatItem is called')
      this.workingTasks++ // 增加正在进行的异步任务的数量

      const itemToRemove = this.allLists[listName][index]
        try {
            await axios.put(`http://localhost:5000/task_categories/update_category/${listName}`, {remove: itemToRemove})
            await this.initCategory()
        } catch (error) {
            console.error('There was a problem deleting category:', error)
        } finally {
            this.workingTasks--
        }
    },
  },
})
