---
title: A simple isomorphic javascript blog with React and Nodejs
layout: post
comments: true
---


After reading a lot of articles about *isomorphic javascript* and testing the various examples, I decided to create a simple isomorphic app to better understand the development process.

I've created a minimal blog with fake articles wrote using markdown syntax.
All the code can be found [here](https://github.com/stefunk/isomorphic-blog-example).

## Iso-wat?
I will not deeply explain what's a isomorphic app and why it can be very cool.
In a few words:
> JavaScript applications which run both client-side and server-side.

The app is rendered in an "old-school way" by the server and from that point it begins acting like a SPA.
If you're javascript is turned off, you can navigate the website like a static one for sure with less cool features, but at least you've got some SEO content! And not a white page.

For understand better read this two articles:

+ [Isomorphic JavaScript: The Future of Web Apps](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/)
+ [Scaling Isomorphic Javascript Code](http://blog.nodejitsu.com/scaling-isomorphic-javascript-code/)

## Techs
A short list of the frameworks/libraries involved in the project.


+ [Browserify](http://browserify.org/)
+ [Express](http://expressjs.com/)
+ [es6-promise](https://github.com/jakearchibald/es6-promise)
+ [Flux](https://facebook.github.io/flux/)
+ [React](http://facebook.github.io/react/)
+ [React-router](https://github.com/rackt/react-router)

## React components and Flux architecture
The app (try to) follow the React/Flux architecture. So all the code is divided into: **actions**,  **dispatcher**, **stores** and **views**.

Maybe I didn't always follow the pattern so strictly, as you will see after with **stores**, but I did my best to be clear.

## Routing
### Client side
The client javascript application use *react-router* as router component.
I discover in it a very useful tool, easy and fast to use.

From *routes.jsx*:

```javascript
// The handlers are all React views
var Route = Router.Route;

var routes = (
  <Route name="app" path="/" handler={App}>
  <Route name="article" path="/article/:id" handler={Article}/>
  <DefaultRoute name="default" handler={ArticleList}/>
  </Route>
);
```

Put the ```<RouteHandler />``` component in the App view (App.jsx):

``` javascript
var App = React.createClass({
  render: function () {
    return (
    <div>
      <header className={"cf"}>
        <h1>
          Isomorphic
        </h1>
        <nav>
          <ul>
            <li><Link to="app">Home</Link></li>
            <li><Link to="article" params={{id: 'about'}}>About</Link></li>
          </ul>
        </nav>
      </header>
      <section className={"content markdown-body"}>
        // Here!!
        <RouteHandler/>
      </section>
    </div>
    );
  }
});
```

And finally start the router from the browser entrypoint (browser.js):

```javascript
Router.run(routes, Router.HistoryLocation, function (Handler, state) {
  React.render(<Handler/>, document.body);
  var activeRoute = RoutesAction.findActiveRoute(state.routes);

  // Every time there's a route change
  // ask RoutesAction to manage the flow
  RoutesAction.triggerRouteChange(activeRoute, state.params);
});
```

### Server side
The server is built with Express and use its routing system as a wrapper for the client app routing. Every time a server side route it's called, the callback call the relative client route and using ```React.renderToString``` return the rendered html to a Jade view.

As in *server.js* :

```javascript
app.get('/article/:id', function (req, res, next) {
  var aid = req.params.id;
  Router.run(routes, '/article/' + aid , function (Handler) {
    var content = React.renderToString(React.createElement(Handler));
    var injected = { list: [Api.getArticle(aid)]};
    res.render('index', {
      content: content,
      injectedScript: JSON.stringify(injected)
    });
  });
});
```

With the html I inject also some javascript data with ```injectedScript```.
I do this to give React the initial data and prevent a re-render to a white page. When started on the client, the app gets the data from a client api so, if the React diff algorithm find something different, it will cause a re-render.

This is better explained in the next section.

## Stores and Api
All the views get their data from a store.  
Here there's the small trick who will help us do the magic.

*ArticleStore.js* :

```javascript

// This Api is override on browser
// using 'browser' field in package.json
var Api = require('../api/ServerApi.js');
var _data = Api.getArticles();

function loadData(data) {
  _data = data;
};

var ArticleStore = merge({}, EventEmitter.prototype, {
  findById: function (id) {
    return Api.getArticle(id);
  },
  getData: function () {
    return _data;
  },
  // ...
});

// ...
```

*ServerApi.js* :

```javascript
module.exports = {
  getArticles: function () {
    var articles = fs.readdirSync(FILES_DIR),
      list = [];

    articles.forEach( function (a) {
      list.push(/*...*/);
    });
    return list;
  },
  //...
}
```

*ClientApi.js* :

```javascript
function getInjectedData(key) {
  var inj = window.__INJECTED[key];
  return inj;
};

var _data = getInjectedData("list") || [];

module.exports = {
  getArticles: function () {
    return _data;
  },
//...
}
```

As you could see, the api implements the same "sort of" interface.
The override of the module is done in **package.json**:

```javascript
"browser": {
  "./src/api/ServerApi.js": "./src/api/ClientApi.js",
  "showdown": "./vendor/showdown/showdown.js"
},
"browserify": {
  "transform": [
    "reactify"
  ]
},
```

## Ok, but in real world?

This was simply test, like the usual todo apps.
All the code can be found [here](https://github.com/stefunk/isomorphic-blog-example).

Far from being perfect, I hope soon to get the possibility to try these techs on a real world app or project to face real world problems.

If you want something more *prod-ready* or a list of various isomorphic frameworks, visit [http://isomorphic.net/](http://isomorphic.net/).

Hope you'll enjoy.
Ciao!
