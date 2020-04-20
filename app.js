const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Article = require('./models/article');
const User = require('./models/user');
const bcrypt = require('bcryptjs');

const app = express();

app.use(bodyParser.json());


const articles = async articleIds => {
    try{
  const articles = await Article.find({ _id: { $in: articleIds } })
  articles.map(article => {
        return {
           ...article._doc,
           _id: article.id,
           creator: user.bind(this, article.creator)
        };
      });
      return articles;
    } catch (err) {
      throw err;
    }
};


const user = async userId => {
    try{
  const user = await User.findById(userId)
      return {
        ...user._doc,
        _id: user.id,
        createdArticles: articles.bind(this, user._doc.createdArticles)
      };
    } catch(err) {
      throw err;
    };
}



app.use('/api', graphqlHttp({
  schema: buildSchema(`

    type Article {
      _id: ID!
      title: String!
      description: String!
      author: String!
      date: String!
      creator: User!
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdArticles: [Article!]
    }

    input ArticleInput {
      title: String!
      description: String!
      author: String!
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      articles: [Article!]!
    }

    type RootMutation {
      createArticle(articleInput: ArticleInput): Article
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),


  rootValue: {
    articles: async () => {
        try{
     const articles = await Article.find()
       return articles.map(article => {
          return {
             ...article._doc,
             _id: article.id,
             creator: user.bind(this, article._doc.creator)
           };
       })
     } catch (err) {
       throw err;
     }
    },


    createArticle: async (args) => {
      const article = new Article({
        title: args.articleInput.title,
        description: args.articleInput.description,
        author: args.articleInput.author,
        date: new Date(args.articleInput.date),
        creator: '5e9cb9a124647626f9c9b298'
      });

      let createdArticle;
        try {
      const result = await article
      .save()
        createdArticle = {
          ...result._doc,
          _id: result.id,
          creator: user.bind(this, result._doc.creator)
        };
        const creator = await User.findById('5e9cb9a124647626f9c9b298');

        if (!creator) {
          throw new Error('User not found.');
        }
        user.createdArticles.push(article);
        await creator.save();

        return createdArticle;
      } catch (err) {
        throw err;
      }
    },


    createUser: async (args) => {
        try {
      const existingUser = await User.findOne({email: args.userInput.email})
        if (existingUser) {
          throw new Error('User already exists...')
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword,
          });
          const result = await user.save();

          return {...result._doc, password: null, _id: result.id }
        } catch (err) {
          throw err;
        }
    }
  },
  graphiql: true

}));


app.get('/', (req, res, next) => {
  res.send('Yo! Go to /api')
})


// Connect with database
mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PSWD
  }@testcluster2020-6hi6w.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true }
)
.then(() => {
  app.listen(3000)
}).catch(err => {
  console.log(err);
})
