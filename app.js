const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Article = require('./models/article');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const Like = require('./models/like');

const app = express();

app.use(bodyParser.json());

// Populate functions - helpers in resolvers
const articles = async articleIds => {
    try{
  const articles = await Article.find({ _id: { $in: articleIds } })
  return articles.map(article => {
        return {
           ...article._doc,
           _id: article.id,
           creator: user.bind(this, article.creator)
        };
      });
    } catch (err) {
      throw err;
    }
};


const singleArticle = async (articleId) => {
  try{
    const article = await Article.findById(articleId);
    return {
      ...article._doc,
      _id: article.id,
      creator: user.bind(this, article.creator)
    }
  } catch(err) {
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


// GRAPHQL schema
app.use('/api', graphqlHttp({
  schema: buildSchema(`

    type Like {
      _id: ID!
      article: Article!
      user: User!
    }

    type Article {
      _id: ID!
      title: String!
      description: String!
      author: String!
      date: String!
      creator: User!
      createdAt: String!
      updatedAt: String!
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdArticles: [Article!]
    }

    type AuthData {
      userId: ID!
      token: String!
      tokenExpiration: Int!
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
      likes: [Like!]!
      login(email: String!, password: String!): AuthData!
    }

    type RootMutation {
      createArticle(articleInput: ArticleInput): Article
      createUser(userInput: UserInput): User
      likeArticle(articleId: ID!): Like
      cancelLike(likeId: ID!): Article!
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),

  // RESOLVERS
  rootValue: {
    articles: async () => {
        try{
     const articles = await Article.find()
       return articles.map(article => {
          return {
             ...article._doc,
             _id: article.id,
             creator: user.bind(this, article._doc.creator),
             createdAt: new Date(article._doc.createdAt).toISOString(),
             updatedAt: new Date(article._doc.createdAt).toISOString(),
           };
       })
     } catch (err) {
       throw err;
     }
    },



    likes: async () => {
      try{
        const likes = await Like.find();
        return likes.map(like => {
          return {
            ...like._doc,
            _id: like.id,
            user: user.bind(this, like._doc.user),
            article: singleArticle.bind(this, like._doc.article)
          }
        });
      } catch (er){
        throw err;
      }
    },



    createArticle: async (args) => {
      const article = new Article(
        {
          title: args.articleInput.title,
          description: args.articleInput.description,
          author: args.articleInput.author,
          date: new Date(args.articleInput.date),
          creator: '5e9cb9a124647626f9c9b298'
        }
      );

      let createdArticle;
        try {
      const result = await article
      .save()
        createdArticle = {
          ...result._doc,
          _id: result.id,
          date: new Date(article._doc.date).toISOString(),
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
    },


    likeArticle: async (args) => {
        const fetchedArticle = await Article.findOne({ _id: args.articleId});
      const like = new Like(
        {
          user: '5e9cb9a124647626f9c9b298',
          article: fetchedArticle
        }
      );
      const result = await like.save();
      return {
          ...result._doc,
          _id: result._id,
          user: user.bind(this, like._doc.user),
          article: singleArticle.bind(this, like._doc.article)
      }
    },

    cancelLike: async (args) => {
      try {
        const like = await Like.findById(args.likeId).populate('article')
        const article = {
          ...like.article._doc,
          _id: like.article.id,
          creator: user.bind(this, like.article._doc.creator)
        };
        await Like.deleteOne({ _id: args.likeId });
        return article;
      } catch (err) {
        throw err;
      }
    },


    login: async (args) => {
      const user = User.findOne({email: email});
      if (!user) {
        throw new Error('Invalid Credentials...')
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if(!isEqual) {
        throw new Error('Invalid Credentials...')
      }
    },

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
