import express from "express"
import session from "express-session"
import redis from "redis"
import RedisStore from "connect-redis"

const app = express()
app.use(express.json())

// 1 Configure our Redis
const redisClient = await redis.createClient({
    password: 'HAKiLJdQ6I5oLK50kwgcn8HPjdMHuLVj',
    socket: {
        host: 'redis-17828.c341.af-south-1-1.ec2.redns.redis-cloud.com',
        port: 17828
    }
})
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

//await redisClient.connect()

//const RedisStore = RedisStore.default
//const RedisStore = connectRedis(session) 
//configuration to store sessions, wire up connectRadis with session, session wil handle overall session management and connectRadis will take care of flushall

//if you run behid proxy example nginx
//app.set("trust proxy", 1)


//2 Configure session middleware
//any request that comes in flows through this middleware
app.use(session({
    name: "sessionID",
    store: new RedisStore({client: redisClient, prefix: "mohansapp:"}), // The session store instance, defaults to a new MemoryStore instance by default and we should use redis or mongo for production.
    secret: "secretkey",
    saveUninitialized: false, // Let's say we are making request to the server and not storing anything to the session, they by false you mean don't save session to store
    resave: false, //Forces the session to be saved back to the session store if value set to true, ven if the session was never modified during the request
    rolling: true, //Force the session identifier cookie to be set on every response and the expiration is reset to the original maxAge
    cookie: {
        // secure: false, //in production it is always true, if true transmit cookie over https
        // httpOnly: true,  //if true, prevents client side JS from reading the cookie
        maxAge: 1000 * 100 // session max age in milliseconds
    },
    //expires: new Date() //maxAge : a number representing the milliseconds from Date. now() for expiry. expires : a Date object indicating the cookie's expiration date (expires at the end of session by default).
}))

// req.session.save(function(err) { //This is automatically called when request ends and we get the response, but still if you want to save session in between for some reason, we can call this method
//     // session saved
// })

//Everytime we hit this, express creates a new session id
app.get("/", (req, res) => {
    console.log("ID", req.session.id)
    req.session.visited = true
    console.log("session", req.session)

    res.status(200).send("Hello")
})

//3 Login endpoint which is unprotected
app.post("/login", (req, res) => {
    console.log("req.body", req.body)
    console.log("session.client", session.client)
    //const {user, password} = req.body
    //lets assume username and password is correct
    req.session.user = req.body.user
    console.log("session", req.session)
    console.log("ID", req.session.id)

    res.json("You are successfully logged in")
})

//4 plug in another middleware that will check if the user is authenticated or not
//all requests that are plugged in after this middleware will only be accessible if the user is logged in
// app.use((req, res, next) => {
//     if(!req.session || !req.session.clientId) {
//         const error  = new Error("Not Passed")
//         error.statusCode = 401
//         next(error)
//     }
//     next()
// })

//plug in all the routes that user can access after succesful login
// app.get("/profile", (req, res) => {
//     res.json(req.session)
// })

app.listen(8080, () => {
    console.log("server listening on 8080")
})


