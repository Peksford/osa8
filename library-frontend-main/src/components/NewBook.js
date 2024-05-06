import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { NEW_BOOK, ALL_BOOKS, ALL_PERSONS } from './Queries'
import { updateCache } from '../App'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [newBook] = useMutation(NEW_BOOK, {
    onError: (error) => {
      console.error(error)
      //console.error(error.graphQLError[0].message)
    },
    update: (cache, response) => {
      console.log('testiconsoli', cache)
      updateCache(cache, { query: ALL_BOOKS }, response.data.addBook)
    },
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    try {
      const result = await newBook({
        variables: { title, author, published: parseInt(published), genres },
      })
      setTitle('')
      setPublished('')
      setAuthor('')
      setGenres([])
      setGenre('')
    } catch (error) {
      console.error('Error in adding book', error)
    }

    //console.log('add book...', result)
  }

  const addGenre = () => {
    setGenres((prevGenres) => prevGenres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
