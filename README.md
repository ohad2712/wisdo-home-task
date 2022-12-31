# wisdo-home-task

This is my implementation to Wisdo's home task described [here](https://docs.google.com/document/d/1prMbvriOT5B1SOXG4MCD277-3gdMNbPFA4YiM7G5Z7Q/edit).

## Getting started
Install all of the service dependencies:
```bash
> npm install
```
Start the server locally (defaults to port `8080`):
(Note that the server is run in watch mode, for your convinience)
```bash
> npm start
```

Run all tests:
```bash
> npm run test
```

## API endpoints
<details>
<summary>
GET /app/systemcheck
</summary>
A regular systemcheck for the server.
</details>

</br>

<details>
<summary>
POST /app/posts
</summary>
This will create a new `Post` nd save it to the DB.
Payload looks like:
</br>
<code>
{ </br>
  &nbsp; author: ObjectId, </br>
  &nbsp; community: ObjectId, </br>
  &nbsp; post: { </br>
    &nbsp; title: string; </br> 
    &nbsp; summary?: string; </br>
    &nbsp; body: string; </br>
  &nbsp; } </br>
}
</code>
</details>

</br>

<details>
<summary>
GET /app/posts/:id
</summary>
This will return a specific post by its ID.
</details>

</br>

<details>
<summary>
GET /app/users/:id/feed
</summary>
This will return the feed for a specific user (by their ID).
This feed is a section I\in the app where the user sees posts that are “recommended” to him, ranked by a “relevance” score.</details>

</br>

## Other bits and parts
* This app uses:
  * An [express.js](https://expressjs.com/) server.
  * A [MongoDB](https://www.mongodb.com/) instance as the database.
* The project structure has:
  * A main app router to all of the app's routes to be redirected through.
  * Routers for each of the relevant entities (no router for the `Community` entity [See the [Future things to be implemented](https://github.com/ohad2712/wisdo-home-task/master/README.md#further-notes#future-things-to-be-implemented) section below]).
  * Controllers for each of the relevant entities to hold the logic part.
  * Services  for each of the relevant entities (including the future `Email` service) to hold any DB (or other I/O) interactions.
  * Models to hold all DB shcemas and types for all of the relevant entities.
  * A `test` directory to have all of the tests to the functionalities the app has implemented.
  * A middleware function to mock some sort of authentication (according to the guidelines).

## Future things to be implemented
* Add more values to a configuration/.env files to allow more modularity.
* A [cronjob](https://github.com/kelektiv/node-cron) to run an calculate the weighted score for each user every X minutes. This cronjob should save the weigthedScore for that user in the db, and then to be used when a certain users performs a request for his feed (at `/app/users/:id/feed`). That will cause a certain level of inaccuracy, but product-wise this is fine according to the exercise's guidelines.
* Add more validations for the payloads/params and other values that are being given to the different endpoints.
* Probably another router for the Community entity is to be implemented, but that depends on the shape this product is going to take. 
* Implement pagination when querying for documents in the DB according to the system needs (an example of the implementation can be seen [here](https://github.com/ohad2712/wisdo-home-task/blob/47d9e836073c82d708abff767463a6a7fa4059f6/src/services/users/index.ts#L31-L63))
* The words watchlist for posts' scanning can be a separate collection in the DB as well. For the purpose of this exercise I have stored this list in-memory.
* Add indices for posts of the same communities when the number of posts and communities collections are increased to a substantial amount of documents, to allow a more eficient querying for the feed feature.
* Add more unit-tests to some of the computational functions.
* Add `docker-compose.yaml` files to support different enviornments when deploying this service.
* Integrate a CI/CD tool with this service to allow gradual deployments that'd be covered by continuos test runs.
