'use strict'

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor')
const cluster = require('cluster')
const os = require("os")
const numOfCpuCores = os.cpus().length

if (cluster.isMaster) {
  console.log(`Cluster master ${process.pid} is running.`)
  for (let i=0; i < numOfCpuCores; i ++) {
    cluster.fork()
  }
  require('@adonisjs/websocket/clusterPubSub')()
  return
}

new Ignitor(require('@adonisjs/fold'))
  .preLoad('start/redis')
  .appRoot(__dirname)
  .wsServer()
  .fireHttpServer()
  .catch(console.error)
