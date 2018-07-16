import React from 'react'
import {observer} from 'mobx-react'
import {
  Box,
  Grid,
  Float,
  Button,
  ClearFix,
  SelectButton
} from '../components'

const Table = observer(({store, table}) => (
  <Box>
    <h3>{table.name}</h3>
    {table.fields.map(field => (
      <SelectButton
        key={table.name + field}
        selected={store.settings.isSelected(table.name, field)}
        onClick={() => store.settings.toggle(table.name, field)}
      >
        {field}
      </SelectButton>
    ))}
  </Box>
))

export const Settings = observer(({store}) => (
  <section>
    <Float right>
      <Button
        blue={!store.settings.saving}
        onClick={() => store.settings.save()}
      >
        Save Changes
      </Button>
    </Float>
    <ClearFix />
    {store.settings.loading && <p>Loading ...</p>}
    {!store.settings.loading && (
      <Grid cols={4}>
        {store.settings.tables.map(table => (
          <Table key={table.name} store={store} table={table} />
        ))}
      </Grid>
    )}
  </section>
))
