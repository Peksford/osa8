import { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import FavoriteGenre from './components/FavoriteGenre'
import { gql, useQuery, useSubscription } from '@apollo/client'
import { ALL_BOOKS, ALL_PERSONS, ME, BOOK_ADDED } from './components/Queries'

export const updateCache = (cache, query, addedBook) => {
  // helper that is used to eliminate saving same person twice
  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.name
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState('')

  const result_authors = useQuery(ALL_PERSONS, {
    pollInterval: 2000,
  })
  const result_books = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  })
  const result_user = useQuery(ME, {
    pollInterval: 2000,
  })

  useEffect(() => {
    const libraryToken = localStorage.getItem('library-user-token')
    if (libraryToken) {
      setToken(libraryToken)
    }
  })

  const { loading, error, data } = useSubscription(BOOK_ADDED)
  //console.log('SUBSCRIPTION', { loading, error, data })
  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      //console.log('Tuleeko dataa', data.data.bookAdded)
      const addedBook = data.data.bookAdded
      window.alert(`Book '${addedBook.title}' added`)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
    },
  })
  //console.log('USER RESULT', result_user.data.me.favoriteGenre)

  if (result_authors.loading || result_books.loading) {
    return <div>loading...</div>
  }

  const logout = () => {
    setToken('')
    localStorage.clear()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && (
          <button onClick={() => setPage('recommended')}>recommended</button>
        )}
        {token && <button onClick={() => logout()}>logout</button>}
        {!token && <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Authors
        show={page === 'authors'}
        authors={result_authors.data.allAuthors}
      />

      <Books show={page === 'books'} books={result_books.data.allBooks} />

      <NewBook show={page === 'add'} />
      {result_user.data && (
        <FavoriteGenre
          show={page === 'recommended'}
          favorite={result_user.data.me.favoriteGenre}
        />
      )}
      <Login show={page === 'login'} setToken={setToken} setPage={setPage} />
    </div>
  )
}
//
export default App
