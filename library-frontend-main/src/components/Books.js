import { useState } from 'react'
import { ALL_BOOKS } from './Queries'
import { gql, useQuery } from '@apollo/client'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState('')
  const [filteredBooks, setFilteredBooks] = useState([])
  const [allBooks, setAllBooks] = useState([])

  const {
    loading,
    error,
    data: result_books,
    refetch,
  } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
    pollInterval: 2000,
  })

  //console.log(result_books)

  const { loading: allBooksLoading, data: all_books } = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  })

  // console.log('all_books', all_books)
  // console.log('allBooks', allBooks)

  if (!props.show) {
    return null
  }

  if (loading || allBooksLoading) {
    return <div>loading</div>
  }

  if (error) {
    return <div>Error: {error.message} </div>
  }

  if (result_books && result_books.allBooks && allBooks.length === 0) {
    setAllBooks(result_books.allBooks)
  }

  //const books = selectedGenre ? filteredBooks : result_books.allBooks

  const handleClickGenre = async (genre) => {
    setSelectedGenre(genre)
    try {
      const { data } = await refetch({ genre })
      console.log('Filtered data', data)
      setFilteredBooks(data.allBooks)
    } catch {
      console.error('Error refetching ')
    }
    //const filtered = allBooks.filter((book) => book.genres.includes(genre))
  }

  const handleClickAllGenres = () => {
    setSelectedGenre('')
    setFilteredBooks(all_books.allBooks)
  }

  const booksToShow = selectedGenre ? filteredBooks : all_books?.allBooks

  const allGenres = [
    ...new Set(all_books.allBooks.flatMap((book) => book.genres)),
  ]

  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {allGenres.map((genre) => (
          <button key={genre} onClick={() => handleClickGenre(genre)}>
            {genre}
          </button>
        ))}
        {<button onClick={() => handleClickAllGenres()}>all genres</button>}
      </div>
    </div>
  )
}

export default Books
