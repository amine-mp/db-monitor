import React from 'react'
import {render} from 'react-dom'
import {App} from './App'
import {routes} from './routes'
import {router, api} from './services'
import {Store} from './store'

const store = Store.create(Store.initialData, {api, router})

store.setup()

window.store = store

render(
  <App store={store} />,
  document.getElementById('db-monitor-app')
)
