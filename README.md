SSNoC Back-end
=========

Introduction

  - This repository contains code for backend Node.js server part.
  


Installation
--------------

```sh
Install Node.js from http://nodejs.org/
npm install -g express
npm install

```
Run Server
--------------

```sh
node app
```

* To change the port on which node.js starts, please update line 21 of server.js file: `app.set("port", 80);` to provide the new port number.
* To change the port on which node.js should communicate with Java WS - update the port number on line 1 of `config/rest_api.js` : `var host_url = "http://localhost:9000/ssnoc";`
