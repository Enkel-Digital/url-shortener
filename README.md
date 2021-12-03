# URL Shortener built on firebase
A URL Shortener service build on top of firebase and cloud run


## Repo layout
This is a monorepo consisting of the following subrepos
- [app](./app)
    - Client app for users to manage their slug to URL mappings
- [API](./API)
    - API service for the client app that provides the CRUD API for managing mappings
- [redirect](./redirect)
    - The main redirect service that redirects slugs to URLs
    - This is a standalone service seperate from the CRUD API to improve serverless cold startup times by only loading the neccessary items to serve the redirect, this service will be ran with priority and higher capacity/redundancy compared to the API service for the client app.


## Author, License
Made by [JJ](https://github.com/Jaimeloeuf) and made available under [AGPL](./LICENSE)