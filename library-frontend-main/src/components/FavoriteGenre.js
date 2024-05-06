import { gql, useQuery } from '@apollo/client'
import { useState, useEffect } from 'react'
import { ME, ALL_BOOKS } from './Queries'

const FavoriteGenre = (props) => {
  const result_books = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  })

  const filtered = result_books.data.allBooks.filter((book) =>
    book.genres.includes(props.favorite)
  )
  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>recommendations</h2>
      books in your favorite genre <b>{props.favorite}</b>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filtered.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FavoriteGenre
