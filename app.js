const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Article = require('./models/article');

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

    input ArticleInput {
      title: String!
      description: String!
      author: String!
      date: String!
    }

    type RootQuery {
      articles: [Article!]!
    }

    type RootMutation {
      createArticle(articleInput: ArticleInput): Article
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
        date: new Date(args.articleInput.date)
      });

      return article
      .save()
      .then(result => {
        console.log(result)
        return { ...result._doc, _id: result._id.toString() };
      })
      .catch(err => {
        console.log(err)
        throw err;
      });
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
