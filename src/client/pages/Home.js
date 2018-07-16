import React, {Fragment} from 'react'
import {observer} from 'mobx-react'
import {
  Box,
  Data,
  Grid,
  Float,
  Button,
  ClearFix,
  ItemName,
  ItemValue,
  SelectButton
} from '../components'

const range = (start, end) => {
  const result = []
  while (start <= end) {
    result.push(start)
    start++
  }
  return result
}

const Change = observer(({store, change}) => (
  <Box
    green={change.action === 'INSERT'}
    orange={change.action === 'UPDATE'}
  >
    <Float right>
      <Button blue onClick={() => change.toggle()}>
        {change.showData ? 'Hide' : 'Show'}
      </Button>
      <Button red onClick={() => store.home.removeChange(change.id)}>
        X
      </Button>
    </Float>
    <h3>
      {change.action} {change.table_name} | {change.at}
    </h3>
    <ClearFix />
    {change.showData && (
      <Data>
        {change.items.map(([name, value]) => (
          <Fragment key={change.id + name}>
            <ItemName>{name}</ItemName>
            <ItemValue>{value}</ItemValue>
          </Fragment>
        ))}
      </Data>
    )}
  </Box>
))

const Pagination = observer(({view}) => (
  <section>
    {range(1, view.pages).map(i => (
      <SelectButton
        key={i}
        selected={view.page === i}
        onClick={() => view.gotoPage(i)}
      >
        {i}
      </SelectButton>
    ))}
  </section>
))

const Filters = observer(({store}) => (
  <Box>
    <h3>Tables</h3>
    {store.home.tables.map(table => (
      <SelectButton
        key={table}
        selected={store.home.selectedTables.indexOf(table) !== -1}
        onClick={() => store.home.toggleTable(table)}
      >
        {table}
      </SelectButton>
    ))}
  </Box>
))

// <Box>
//   <h3>Actions</h3>
//   <SelectButton
//     selected={store.home.selectedActions.indexOf('INSERT') !== -1}
//     onClick={() => store.home.toggleAction('INSERT')}
//   >
//     INSERT
//   </SelectButton>
//   <SelectButton
//     selected={store.home.selectedActions.indexOf('UPDATE') !== -1}
//     onClick={() => store.home.toggleAction('UPDATE')}
//   >
//     UPDATE
//   </SelectButton>
// </Box>

export const Home = observer(({store}) => (
  <section>
    <Filters store={store} />
    {store.home.loading && <p> Loading ... </p>}
    {!store.home.loading &&
      store.home.changes.length == 0 && <p>No changes found!</p>}
    {!store.home.loading &&
      store.home.changes.length > 0 && (
        <div>
          <ClearFix>
            <Float right>
              <Button red onClick={() => store.home.removeChanges()}>
                Remove All
              </Button>
            </Float>
          </ClearFix>
          {store.home.changes.map(change => (
            <Change key={change.id} store={store} change={change} />
          ))}
          <Pagination view={store.home} />
        </div>
      )}
  </section>
))
