import {
  types as T,
  flow,
  getEnv,
  getParent,
  getSnapshot
} from 'mobx-state-tree'

const Change = T.model({
  id: '',
  action: '',
  table_name: '',
  at: '',
  data: T.map(T.string),
  showData: false
})
  .actions(self => ({
    toggle() {
      self.showData = !self.showData
    }
  }))
  .views(self => ({
    get items() {
      const data = getSnapshot(self.data)
      return Object.keys(data).map(key => [key, data[key]])
    }
  }))

export const Home = T.model({
  loading: true,
  selectedTables: T.optional(T.array(T.string), []),
  selectedActions: T.optional(T.array(T.string), []),
  page: 1,
  pages: 1,
  tables: T.optional(T.array(T.string), []),
  changes: T.optional(T.array(Change), [])
}).actions(self => ({
  init: flow(function*(params, query) {
    const {api} = getEnv(self)
    if (query.get('tables'))
      self.selectedTables.replace(query.get('tables').split(','))
    else self.selectedTables.clear()

    if (query.get('actions'))
      self.selectedActions.replace(query.get('actions').split(','))
    else self.selectedActions.clear()

    self.page = parseInt(query.get('page')) || 1
    const settings = yield api('get_settings')
    self.tables.replace(Object.keys(settings))
    yield self.load()
  }),
  load: flow(function*() {
    const {api} = getEnv(self)
    self.loading = true
    const data = {
      page: self.page,
      actions: self.selectedActions,
      tables: self.selectedTables
    }
    self.pages = parseInt(yield api('get_changes_pages', data)) || 1
    if (self.page > self.pages) {
      self.page = 1
      return self.refresh()
    }
    self.changes.replace(yield api('get_changes', data))
    self.loading = false
  }),
  refresh() {
    const app = getParent(self)
    let url = `/?page=${self.page}`
    if (self.selectedActions.length)
      url += `&actions=${self.selectedActions.join(',')}`
    if (self.selectedTables.length)
      url += `&tables=${self.selectedTables.join(',')}`
    return app.go(url)
  },
  toggleAction(value) {
    if (self.selectedActions.indexOf(value) === -1)
      self.selectedActions.push(value)
    else self.selectedActions.remove(value)
    return self.refresh()
  },
  toggleTable(value) {
    if (self.selectedTables.indexOf(value) === -1)
      self.selectedTables.push(value)
    else self.selectedTables.remove(value)
    return self.refresh()
  },
  gotoPage(page) {
    self.page = page
    return self.refresh()
  },
  removeChange: flow(function*(id) {
    const {api} = getEnv(self)
    self.loading = true
    yield api('remove_change', {id})
    return self.load()
  }),
  removeChanges: flow(function*() {
    const {api} = getEnv(self)
    self.loading = true
    yield api('remove_changes', {
      page: self.page,
      actions: self.selectedActions,
      tables: self.selectedTables
    })
    self.page = 1
    return self.load()
  })
}))
