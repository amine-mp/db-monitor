import {Home, Settings, NotFound} from './pages'

export const routes = {
  home: {
    uri: '/',
    Component: Home
  },
  settings: {
    uri: '/settings',
    Component: Settings
  },
  notFound: {
    uri: '*',
    Component: NotFound
  }
}
