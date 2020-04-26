import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import AuthPage from './pages/Auth';
import ArticlesPage from './pages/Articles';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Redirect from='/' to="/auth" exact />
          <Route path='/auth' component={AuthPage} />
          <Route path='/articles' component={ArticlesPage} />
        </Switch>
      </Router>
    );
  }
}

export default App;
