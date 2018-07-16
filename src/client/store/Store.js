import {types as T, flow, getEnv} from 'mobx-state-tree'
import {Settings} from './Settings'
import {Home} from './Home'
import {routes} from '../routes'

export const Store = T.model({
  route: T.model({
    name: 'home',
    params: T.map(T.string),
    query: T.map(T.string)
  }),
  home: Home,
  settings: Settings
}).actions(self => {
  let go
  return {
    setup() {
      const {router} = getEnv(self)
      go = router(routes, self.prepare)
    },
    go: url => go(url),
    prepare: flow(function*({name, params, query}) {
      self.route.name = name
      self.route.params.replace(params)
      self.route.query.replace(query)

      const page = self[self.route.name]
      if (page) {
        yield page.init(self.route.params, self.route.query)
      }
    })
  }
})

Store.initialData = {
  route: {
    name: 'home',
    params: {},
    query: {}
  },
  home: {},
  settings: {}
}
