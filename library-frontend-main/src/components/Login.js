import { useState, useEffect } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { LOGIN } from './Queries'

const Login = ({ setToken, show, setPage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [logging, result] = useMutation(LOGIN)

  useEffect(() => {
    if (result.data && result.data.login) {
      const newToken = result.data.login.value

      setToken(newToken)
      localStorage.setItem('library-user-token', newToken)
    }
  }, [result.data])

  if (!show) {
    return null
  }

  const submit = (event) => {
    event.preventDefault()
    logging({
      variables: { username, password },
    })

    setUsername('')
    setPassword('')
    setPage('authors')
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default Login
