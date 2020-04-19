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

app.use('/api', graphqlHttp({
  schema: buildSchema(`

    type Article {
      _id: ID!
      title: String!
      description: String!
      author: String!
      date: String!
    }

    type User {
      _id: ID!
      email: String!
      password: String
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
    articles: () => {
     return Article.find()
      .then(articles => {
        return articles.map(article => {
          return { ...article._doc, _id: article.id };
        });
      })
      .catch(err => {
        throw err;
      })
    },
    createArticle: (args) => {
      const article = new Article({
        title: args.articleInput.title,
        description: args.articleInput.description,
        author: args.articleInput.author,
        date: new Date(args.articleInput.date),
        creator: '5e9cb9a124647626f9c9b298'
      });

      let createdArticle;
      return article
      .save()
      .then(result => {
        createdArticle = {...result._doc, _id: result.id};
        return User.findById('5e9cb9a124647626f9c9b298')
      })
      .then(user => {
        if (!user) {
          throw new Error('User not found.');
        }
        user.createdArticles.push(article);
        return user.save();
      })
      .then(result => {
        return createdArticle;
      })
      .catch(err => {
        console.log(err)
        throw err;
      });
    },

    createUser: (args) => {
      return User.findOne({email: args.userInput.email}).then(user => {
        if (user) {
          throw new Error('User already exists...')
        }
        return bcrypt.hash(args.userInput.password, 12)
        })
        .then(hashedPassword => {
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword,
          });
          return user.save();
        })
        .then(result => {
          return {...result._doc, password: null, _id: result.id }
        })
        .catch(err => {
          throw err;
        })
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
