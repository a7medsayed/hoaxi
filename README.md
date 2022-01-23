# Hoaxi

## General info
This project is simple TDD Project
# Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 8.0.0


# Getting started
- Clone the repository
```
git clone  https://github.com/a7medsayed/hoaxi.git
```
- Install dependencies
```
npm install
```
  
 ## Project Structure (MVC)
The folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **node_modules**         | Contains all  npm dependencies                                                            |
| **config**                  | Contains  environment configuration.
| **__test__**                 | Contains test files.  |
| **src**        | Contains  main application files. 
| **email**        | Contains  email services. 
| **user**        | Contains user files such as  user Service and user route.
| **locales**        | containing language files.
| **app.js**        | Entry point to express app                                                               |
| package.json             | Contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)   | tsconfig.json            | Config settings for compiling source code only written in TypeScript   


## Usage

### Serving the app

```sh
$ npm start
```

### Running the tests

```sh
$ npm test
```
Navigate to `http://localhost:3000`


