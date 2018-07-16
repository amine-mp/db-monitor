const encode = data =>
  Object.keys(data)
    .map(
      name =>
        encodeURIComponent(name) + '=' + encodeURIComponent(data[name])
    )
    .join('&')

export const api = async (method, data = {}) => {
  const res = await fetch(ajaxurl, {
    method: 'POST',
    body: encode({
      method,
      data: JSON.stringify(data),
      action: 'db_monitor'
    }),
    credentials: 'same-origin',
    headers: {
      'Content-Type':
        'application/x-www-form-urlencoded; charset=UTF-8'
    }
  })

  const content = await res.json()
  if (content && content.error) throw content.error
  return content
}
