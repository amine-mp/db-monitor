import {types as T, flow, getEnv, getSnapshot} from 'mobx-state-tree'

const Table = T.model({
  name: '',
  fields: T.array(T.string)
})

export const Settings = T.model({
  loading: true,
  saving: false,
  tables: T.optional(T.array(Table), []),
  selected: T.optional(T.map(T.map(T.boolean)), {})
})
  .actions(self => ({
    init: flow(function*(params, query) {
      const {api} = getEnv(self)
      self.loading = true
      self.tables.replace(yield api('get_tables'))
      self.selected.replace((yield api('get_settings')) || {})
      self.loading = false
      console.log(getSnapshot(self.selected))
    }),
    toggle(table, field) {
      if (!self.selected.get(table)) self.selected.set(table, {})
      if (!self.selected.get(table).get(field)) {
        self.selected.get(table).set(field, true)
      } else {
        self.selected.get(table).delete(field)
        if (self.selected.get(table).values().length == 0)
          self.selected.delete(table)
      }
    },
    save: flow(function*() {
      if (self.saving) return null
      const {api} = getEnv(self)
      self.saving = true
      yield api('set_settings', getSnapshot(self.selected))
      self.saving = false
    })
  }))
  .views(self => ({
    isSelected(table, field) {
      return (
        self.selected.get(table) && self.selected.get(table).get(field)
      )
    }
  }))
