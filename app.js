const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

app.use('/api', graphqlHttp({
  schema: buildSchema(`

    type RootQuery {
      articles: [String!]!
    }

    type RootMutation {
      createArticle(name: String): String
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),

  rootValue: {
    articles: () => {
      return ['Romantic Cooking', 'Sailing', 'All-night coding']
    },
    createArticle: (args) => {
      const articleName = args.name;
      return articleName;
    }
  },
  graphiql: true

}));

app.get('/', (req, res, next) => {
  res.send('Hello')
})

app.listen(3000)
