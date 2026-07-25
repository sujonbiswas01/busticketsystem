import { Server } from "http";
import app from "./app"
import { envVars } from "./app/config/env";

let server:Server
const port = 5000
const bootstrap = async() => {
    try {

        server = app.listen(envVars.PORT, () => {
        });
    } catch (error) {
        console.error({ error }, "Failed to start server");
    }   
}

process.on("uncaughtException",(error)=>{
  console.error({ error }, "Uncaught exception detected, shutting down server");
  if(server){
    server.close(()=>{
      process.exit(1)
    })
  }
    process.exit(1)
})

process.on("unhandledRejection",(error)=>{
  console.error({ error }, "Unhandled rejection detected, shutting down server");
  if(server){
    server.close(()=>{
      process.exit(1)
    })
  }
})


process.on("SIGTERM",(error)=>{
  console.warn({ error }, "SIGTERM detected, shutting down server");
  if(server){
    server.close(()=>{
      process.exit(1)
    })
  }
  process.exit(1)
})
bootstrap()