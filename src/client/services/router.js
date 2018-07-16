import Pattern from 'url-pattern'
import {createHashHistory} from 'history'

export const matchingRoute = (routes, path) => {
  for (const name in routes) {
    const params = new Pattern(routes[name].uri).match(path)
    if (null !== params) {
      return {name, params}
    }
  }
  return undefined
}

export const router = (routes, changed) => {
  const history = createHashHistory()
  const update = ({pathname, search}) => {
    const {name, params} = matchingRoute(
      routes,
      encodeURI(pathname)
    ) || {
      name: 'home',
      params: {}
    }
    const query = (search.substring(1) || '')
      .split('&')
      .reduce((q, pair) => {
        if (pair.trim()) {
          pair = pair.split('=')
          q[pair[0]] = pair[1]
        }
        return q
      }, {})

    changed({name, params, query})
  }
  history.listen(update)
  history.replace(window.location.hash.substring(1))
  return url => {
    if (url !== history.location.pathname + history.location.search)
      history.push(url)
  }
}
