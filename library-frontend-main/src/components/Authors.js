import { gql, useMutation } from '@apollo/client'
import { useState } from 'react'
import Select from 'react-select'

const EDIT_BIRTHYEAR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

const Authors = (props) => {
  //const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const [changeBirthYear] = useMutation(EDIT_BIRTHYEAR)

  if (!props.show) {
    return null
  }
  const authors = props.authors

  const submit = async (event) => {
    event.preventDefault()

    changeBirthYear({
      variables: { name: selectedOption.value, setBornTo: parseInt(born) },
    })
    //setName('')
    setBorn('')
  }
  const options = authors.map((author) => ({
    value: author.name,
    label: author.name,
  }))

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>

      <form onSubmit={submit}>
        <div>
          <Select
            defaultValue={selectedOption}
            onChange={(selected) => setSelectedOption(selected)}
            options={options}
            /*         <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>  */
          />
        </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
