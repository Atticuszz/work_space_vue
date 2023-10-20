// eslint-disable-next-line valid-appcardcode-demo-sfc
import { reactive, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import axios from '@axios'

const defaultItem = {
  date: '',
  category: null,
  task: null,
  detail: '',
  slot: '',
  location: null,
}

const getRandomChipColor = () => {
  const colors = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const randomIndex = Math.floor(Math.random() * colors.length)

  return colors[randomIndex]
}

const workingTasks = ref(0)

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

class ItemEditDialog {
  /*
    1. 添加记录
    2. 修改记录
    3. 删除记录
   */
  constructor() {
    // 添加修改记录的弹窗
    this.editDialog = ref(false)
    this.editedIndex = ref(-1)
    this.editedItem = reactive(defaultItem)
    this.deleteDialog = ref(false)
    console.log('ItemEditDialog constructor is called')
  }

  editConfirm = (item, taskList) => {
    // 在data中找到需要修改的对象和他的索引，并打开编辑对话框
    this.editedIndex.value = taskList.indexOf(item)
    this.editedItem = item
    this.editDialog.value = true
  }

  editItem = async taskList => {
    workingTasks.value++
    let rawData = deepCopy(this.editedItem)

    // Generate a UUID if it's a new entry
    if (this.editedIndex.value === -1) {
      rawData.uuid = uuidv4()
    }

    // Convert the 'location' array to a string
    rawData.location = rawData.location.join(',')

    // Prepare the URL and method for Axios based on whether it's an update or new entry
    let url = 'http://localhost:5000/task_entries/add_entry'
    let method = 'post'
    if (this.editedIndex.value > -1) {
      url = `http://localhost:5000/task_entries/update_entry/${rawData.uuid}`
      method = 'put'
    }
    rawData = JSON.stringify(rawData)

    axios({
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      data: rawData,
    })
      .then(response => {
        // console.log(response.data)
        dataTable.fetchData()
      })
      .catch(error => {
        console.error('There was a problem sending data:', error)
      })
      .finally(() => {
        workingTasks.value-- // 减少正在进行的异步任务的数量
        // console.log("editItem is called")
        if (this.editedIndex.value > -1) {
          // console.log("taskList:", taskList)
          taskList[this.editedIndex.value] = reactive(toRaw(this.editedItem)) // 正常编辑
        } else {
          taskList.push(reactive(toRaw(this.editedItem)))
        }// 添加新的记录
      })

    this.closeEdit()
  }

  addNewConfirm = () => {
    const newItem = reactive(deepCopy(defaultItem))

    // 变成2023-11-11这种格式

    newItem.date = new Date().toLocaleDateString().replace(/\//g, '-')
    this.editedItem = newItem
    this.editDialog.value = true
  }

  deleteConfirm = (item, taskList) => {
    this.editedIndex.value = taskList.indexOf(item)
    this.deleteDialog.value = true
  }

  deleteItem = async taskList => {
    const uuid = taskList[this.editedIndex.value].uuid

    workingTasks.value++ // 增加正在进行的异步任务的数量

    axios.delete(`http://localhost:5000/task_entries/delete_entry/${uuid}`)
      .then(response => {
        dataTable.fetchData()
      })
      .catch(error => {
        console.error('There was a problem deleting data:', error)
      })
      .finally(() => {
        workingTasks.value-- // 减少正在进行的异步任务的数量
      })
    this.closeDelete()
  }

  closeDelete = () => {
    this.deleteDialog.value = false
    this.editedIndex.value = -1
    this.editedItem = reactive(deepCopy(defaultItem))
  }

  closeEdit = () => {
    this.editDialog.value = false
    this.editedIndex.value = -1
    this.editedItem = reactive(deepCopy(defaultItem))
  }
}

class ItemCategoryEditDialog {
  /*
    1. 添加分类
    2. 删除分类
     */
  constructor() {
    this.categoryDialog = ref(false)

    // 已有的分类
    this.allLists = reactive({
      task: [],
      location: [],
      category: [],
    })
    this.newItemCategories = reactive({
      category: '',
      task: '',
      location: '',
    })
    console.log('ItemCategoryEditDialog constructor is called')
  }

  init_category = async () => {
    console.log('init_category ...')

    const response = await axios.get('http://localhost:5000/task_categories/get_all_task_category')

    this.allLists = reactive(response.data)
  }

  addCatItem = async (itemList, listName) => {
    console.log('Called addCatItem is called')
    workingTasks.value++ // 增加正在进行的异步任务的数量

    const newItem = this.newItemCategories[listName].trim()
    if (newItem !== '') {
      axios.put(`http://localhost:5000/task_categories/update_category/${listName}`, { add: newItem })
        .then(response => {
          if (response.data) {
            itemList.push(newItem)
          }
        })
        .catch(error => {
          console.error('There was a problem adding category:', error)
        })
        .finally(() => {
          workingTasks.value-- // 减少正在进行的异步任务的数量
        })
    }
    this.newItemCategories[listName] = ''
  }

  removeCatItem = async (itemList, index, listName) => {
    console.log('Called removeCatItem is called')
    workingTasks.value++ // 增加正在进行的异步任务的数量

    const itemToRemove = itemList[index]

    axios.put(`http://localhost:5000/task_categories/update_category/${listName}`, { remove: itemToRemove })
      .then(response => {
        if (response.data) {
          itemList.splice(index, 1)
        }
      })
      .catch(error => {
        console.error('There was a problem deleting category:', error)
      })
      .finally(() => {
        workingTasks.value-- // 减少正在进行的异步任务的数量
      })
  }
}

class DataTable {
  constructor() {
    // 搜索栏数据
    this.search = ref('')
    this.loading = ref('success')

    // 表头数据
    this.headers = [
      {
        title: 'Date',
        key: 'date',
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
        title: 'Detail',
        key: 'detail',
        width: '35%',
      },
      {
        title: 'Slot',
        key: 'slot',
        sortable: true,
        width: '10%',
      },
      {
        title: 'Location',
        key: 'location',
        width: '15%',
      },
      {
        title: 'Action',
        key: 'actions',
        width: '10%',
      },
    ]

    // 表格数据
    this.tableItems = ref([])

    // 分页数据
    this.options = ref({
      page: 1,
      itemsPerPage: 15,
      sortBy: ['slot', 'date'], // 首先按 'slot' 排序，然后按 'date' 排序
      sortDesc: [true, true], // 'slot' 升序，'date' 升序
    })
    console.log('DataTable constructor is called')
  }

  fetchData = async () => {
    // console.log('Fetching data...')
    workingTasks.value++ // 增加正在进行的异步任务的数量

    axios.get('http://localhost:5000/task_entries/get_all_table_items')
      .then(response => {
        const all_data = response.data

        this.tableItems.value = all_data.map(reactive(item => {
          const location = item.location.split(',')

          return {
            uuid: item.uuid,
            date: item.date,
            category: item.category,
            task: item.task,
            detail: item.detail,
            slot: item.slot,
            location,
          }
        }))
      })
      .catch(error => {
        console.error('There was a problem fetching data:', error)
      })
      .finally(() => {
        workingTasks.value-- // 减少正在进行的异步任务的数量
      })
  }

  isEmpty = () => {
    return this.tableItems.value.length === 0
  }
}

const itemEditDialog = reactive(new ItemEditDialog())
const itemCategoryEditDialog = reactive(new ItemCategoryEditDialog())
const dataTable = reactive(new DataTable())

export { itemEditDialog, itemCategoryEditDialog, dataTable, getRandomChipColor, workingTasks }
