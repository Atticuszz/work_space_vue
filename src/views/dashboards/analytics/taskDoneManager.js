import { reactive, ref } from 'vue'
import axios from '@axios'
import { v4 as uuidv4 } from 'uuid'

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
const category = ref([
  "PE", "Daily", "Postgraduate", "University", "CS",
])

const task = ref([
  "Reading", "Writing", "Listening", "Speaking", "Vocabulary", "Grammar", "Translation", "Others",
])

const location = ref([
  "Home", "Library", "Classroom", "Canteen", "Dormitory", "Others",
])

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
    console.log("ItemEditDialog constructor is called")
  }

  editConfirm = (item, taskList) => {
    // 在data中找到需要修改的对象和他的索引，并打开编辑对话框
    this.editedIndex.value = taskList.indexOf(item)
    this.editedItem = item
    this.editDialog.value = true
  }
  editItem = async taskList => {
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

    // Send the data to the FastAPI backend
    try {
      const response = await axios({
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        data: rawData, // Explicitly convert to JSON
      })

      // Handle the response here
      console.log(response.data)
    } catch (error) {
      console.error('There was a problem sending data:', error)
    }
    dataTable.fetchData()

    // console.log("editItem is called")
    if (this.editedIndex.value > -1) {
      // console.log("taskList:", taskList)
      taskList[this.editedIndex.value] = reactive(toRaw(this.editedItem)) // 正常编辑
    } else {

      taskList.push(reactive(toRaw(this.editedItem)))

    }// 添加新的记录

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
    try {
      const response = await axios.delete(`http://localhost:5000/task_entries/delete_entry/${uuid}`)
      if (response.data) {
        taskList.splice(this.editedIndex.value, 1)
      }
    } catch (error) {
      console.error('There was a problem   deleting data:', error)
    }
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
    this.allLists = {
      category: category,
      task: task,
      location: location,
    }
    this.newItemCategories = reactive({
      category: '',
      task: '',
      location: '',
    })
    console.log("ItemCategoryEditDialog constructor is called")
  }

  init_category = async () => {
    console.log("init_category ...")

    const response = await axios.get('http://localhost:5000/task_categories/get_all_task_category')

    this.allLists = reactive(response.data)
  }
  addCatItem = async (itemList, listName) => {
    console.log("Called addCatItem is called")

    const newItem = this.newItemCategories[listName].trim()
    if (newItem !== '') {
      try {
        const response = await axios.put(`http://localhost:5000/task_categories/update_category/${listName}`, { add: newItem })
        if (response.data) {
          itemList.push(newItem)
        }
      } catch (error) {
        console.error('There was a problem adding category:', error)
      }
    }
    this.newItemCategories[listName] = ''
  }
  removeCatItem = async (itemList, index, listName) => {
    console.log("Called removeCatItem is called")

    const itemToRemove = itemList[index]
    const list_name = listName.toString()
    try {
      const response = await axios.put(`http://localhost:5000/task_categories/update_category/${listName}`, { remove: itemToRemove })
      if (response.data) {
        itemList.splice(index, 1)
      }
    } catch (error) {
      console.error('There was a problem deleting category:', error)
    }
  }
}

class DataTable {
  constructor() {
    // 搜索栏数据
    this.search = ref('')

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
      sortBy: ['slot', 'date'],  // 首先按 'slot' 排序，然后按 'date' 排序
      sortDesc: [true, true],  // 'slot' 升序，'date' 升序
    })
    console.log("DataTable constructor is called")
  }

  fetchData = async () => {
    console.log("Fetching data...")

    try {
      const response = await axios.get('http://localhost:5000/task_entries/get_all_table_items')
      const all_data = response.data

      // console.log("all_data:", all_data)
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
    } catch (error) {
      console.error('There was a problem fetching data:', error)
    }
  }
}

const itemEditDialog = reactive(new ItemEditDialog())
const itemCategoryEditDialog = reactive(new ItemCategoryEditDialog())
const dataTable = reactive(new DataTable())

export { itemEditDialog, itemCategoryEditDialog, dataTable, getRandomChipColor }

