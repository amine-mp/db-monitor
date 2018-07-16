import React from 'react'
import {observer} from 'mobx-react'
import {routes} from './routes'

const Navbar = observer(({store}) => (
  <div className="nav-tab-wrapper">
    <a
      className={
        'nav-tab' +
        (store.route.name === 'home' ? ' nav-tab-active' : '')
      }
      href="#/"
    >
      Changes
    </a>
    <a
      className={
        'nav-tab' +
        (store.route.name === 'settings' ? ' nav-tab-active' : '')
      }
      href="#/settings"
    >
      Settings
    </a>
  </div>
))

export const App = observer(({store}) => {
  const route = routes[store.route.name]
  let content = null
  if (route) {
    const Component = route.Component
    content = <Component store={store} />
  }
  return (
    <div>
      <Navbar store={store} />
      {content}
    </div>
  )
})
