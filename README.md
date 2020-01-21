# SkollApp Backend

The back-end project for SkollApp

## Getting started

### Setting up the project

* Move into your projects directory (optional): `cd ~/YOUR_PROJECTS_DIRECTORY`
* Clone this repository
* Move into the project directory: `cd YOUR_PROJECT_NAME`
* Install the dependencies: `npm install`

### Working on the project

* Move into the project directory: `cd ~/YOUR_PROJECTS_DIRECTORY/YOUR_PROJECT_NAME`
* Run the development task: `npm run server`
    * Starts a server running at http://localhost:8080
    * Automatically restarts when any of your files change
* Alternatively you can use `npm start` but it will not listen to your changes

## Contributing

### Code
We are currently looking for a good node.js best practices guide, if you want
to suggest any, feel free to do it.

### Workflow

- If developing a new feature, you must create a branch with format:
`feature/<development-feature>/<trello-card-number>`, branching from master.

GENERAL:
Upload your code, by pulling the master branch's latest changes with `git pull origin master`
and the develop branch's latest changes with `git pull origin develop`
to your branch, fix conflicts if it's necessary and then push your branch and make the pull-request
to `develop` branch.

Always remember to update the corresponding card in Trello, and reference your
branch from it. Your Pull Request is going to be reviewed, merged if it's approved
and then go through QA. If it doesn't pass QA, you need to make the changes
requesteds by using the same branch.

### Testing

We use Jest for testing. Don't push code that doesn't have 100% test coverage.
Integration tests are always welcome. Remember to test exceptions and edge cases too!

To run the tests use the `npm test` command or if you want to watch the changes while coding
use the `npm run test:watch` command.

To run a single test file use the next command:

`npm run test test/controllers/familyGroupsController.test.js`

if you want to see the changes without having to write the command again, use: 

`npm run test -- --watch test/controllers/familyGroupsController.test.js`

## Databases

By default, this API is configured to connect to a MongoDB database using Mongoose. You can set the
database, creating a `.env` file in the root of the project and adding the next line of code
`MONGODB_URI=mongodb://localhost/skollapp` 

## REPL

If you want to check the local scenareo, we provided a REPL (read, evaluate, print loop) instance,
to make it work, you need:

- The `.env` file with the enviroment variable provided before.
- Move to the root of the project `cd ~/YOUR_PROJECTS_DIRECTORY/YOUR_PROJECT_NAME`.
- Run `npm run repl`

And an instance of node.js will run, connected to the local mongoose database.


