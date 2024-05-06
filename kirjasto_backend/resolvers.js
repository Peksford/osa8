const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => {
      try {
        const amountBooks = await Book.collection.countDocuments()
        //console.log('Amount of books', amountBooks)
        return amountBooks
      } catch (error) {
        throw new GraphQLError('Error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }
    },
    authorCount: async () => {
      try {
        const amountAuthors = await Author.collection.countDocuments()
        return amountAuthors
      } catch (error) {
        throw new GraphQLError('Error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }
    },
    allBooks: async (root, { author, genre }, context) => {
      try {
        let query = {}

        if (author) {
          query.author = author
          //console.log(query.author)
        }

        if (genre) {
          query.genres = genre
        }

        let books = await Book.find(query).populate('author')

        if (author) {
          //console.log('args', author)
          books = books.filter((book) => book.author.name === author)
        }
        return books.map((book) => {
          return {
            title: book.title,
            author: book.author,
            published: book.published,
            genres: book.genres,
            id: book._id,
          }
        })
      } catch (error) {
        throw new GraphQLError('Error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }

      /*       if (args.author) {
          return books.filter((b) => b.author === args.author)
        }
        if (args.genre) {
          return books.filter((b) => b.genres.includes(args.genre))
        }
        if (args.author && args.genre) {
          return (
            books.filter((b) => b.author === args.author) &&
            books.filter((b) => b.genres.includes(args.genre))
          )
        }
        return books */
    },

    allAuthors: async (args) => {
      try {
        const authors = await Author.find()

        const books = await Book.find({}).populate('author')
        //console.log('Author.find()')
        //console.log('Book.find()')

        return authors.map((author) => {
          const count = books.filter(
            (book) => book.author._id.toString() === author._id.toString()
          ).length

          return { name: author.name, born: author.born, bookCount: count }
        })
      } catch (error) {
        throw new GraphQLError('Error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }
    },
    me: async (root, args, context) => {
      const currentUser = await User.findById(context.currentUser._id)
      return currentUser
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      try {
        let author = await Author.findOne({ name: args.author })
        const currentUser = context.currentUser

        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          })
        }

        if (!author) {
          const newAuthor = new Author({
            name: args.author,
          })
          author = await newAuthor.save()
        }
        const book = new Book({
          author,
          title: args.title,
          published: args.published,
          genres: args.genres,
        })
        await book.save()
        const books = await Book.findById(book._id).populate('author')
        pubsub.publish('BOOK_ADDED', { bookAdded: book })

        return books
      } catch (error) {
        throw new GraphQLError('Something went wrong', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }

      // books = books.concat(book)
      // if (!authors.some((author) => author.name === args.author)) {
      //   //console.log('jrjeje', args.author)
      //   const author = { name: args.author }
      //   authors = authors.concat(author)
      // }
    },
    editAuthor: async (root, args, context) => {
      try {
        let author = await Author.findOne({ name: args.name })
        const currentUser = context.currentUser

        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          })
        }
        //const authorsIndex = authors.findIndex(
        //   (author) => author.name === args.name
        // )
        author.born = args.setBornTo

        await author.save()
        return author
      } catch (error) {
        throw new GraphQLError('Something went wrong', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }
      // if (authorsIndex !== -1) {
      //   updatedAuthors = authors.map((author, index) => {
      //     if (index === authorsIndex) {
      //       return { name: args.name, born: args.setBornTo }
      //     }
      //     return author
      //   })
      //   authors = updatedAuthors
      //   return { name: args.name, born: args.setBornTo }
      // }
      //console.log('mitaa', authorsIndex)
      return null
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })

      return user.save().catch((error) => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      console.log(user)

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      return {
        value: jwt.sign(userForToken, process.env.JWT_SECRET),
      }
    },
  },
  Subscription: {
    bookAdded: { subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']) },
  },
}

module.exports = resolvers
