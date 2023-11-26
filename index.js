const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
// const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// app.use(cors({
//   origin: ['http://localhost:5173','http://localhost:5174'],
//   credentials: true
// }));

app.use(cors());
app.use(express.json());
// app.use(cookieParser());
app.get('/', (req, res)=>{
    res.send('agun news is on fireee!!!🔥🔥🔥');
})
app.listen(port, ()=>{
    console.log(`listening on port : ${port}`);
})


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@odinpiesdatabase.beom3yx.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://AgunAdmin:Zb1jIO2GPnvk1SQA@odinpiesdatabase.beom3yx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// const verifyToken  = async(req,res,next) =>{
//   const token = req?.cookies?.token;
//   // console.log('middleware token: ',token);
//     if(!token){
//       console.log('token nai');
//         return res.status(401).send({message: 'unauthorized access'})
//     }
//     jwt.verify(token, process.env.JWT_SECRET, function (err, decoded){
//         if(err){
//           console.log('ulta palta token');
//         return res.status(401).send({message: 'unauthorized access'})
//         }
//         req.user = decoded;
//          next();
   
//   })

// }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db('agunDB');
    const articleCollection = database.collection('articleCollection');
    const userCollection = database.collection('userCollection');
    const publisherCollection = database.collection('publisherCollection');

    

    // app.post('/jwt', async(req,res)=>{
    //   const user = req.body;
    //   const token = jwt.sign({data: user},`${process.env.JWT_SECRET}`,{expiresIn: '1h'});
    //   res.cookie('token', token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'none'
    //   })
    //   .send({success: true})
    // })

    // app.post('/logout', async(req, res)=>{
    //   const user = req.body;
    //   res.clearCookie('token', {maxAge: 0})
    //   .send({success: true})
    // })

    app.post('/articles', async(req,res)=>{
        const article = req.body;
        const result = await articleCollection.insertOne(article);
        res.send(result);
    })

    app.get('/articles', async(req,res)=>{
      const query = req.query;
        const cursor = await articleCollection.find(query).toArray();
        res.send(cursor);
    })

    app.get('/articles/:id', async(req,res)=>{
      const id = req.params;
      const query = {_id: new ObjectId(id)}
      const cursor = await articleCollection.find(query).toArray();
      res.send(cursor)
  })

  app.post('/users', async(req,res)=>{
    const user = req.body;
    const query = { email: user?.email }
    const isExist = await userCollection.findOne(query);
    if(isExist){
        return res.send({message: 'User already exists!'})
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
})

app.get('/users', async(req,res)=>{
  const query = req.query;
    const cursor = await userCollection.find(query).toArray();
    res.send(cursor);
})

app.post('/publishers', async(req, res)=>{
    const publisher = req.body;
    const result = await publisherCollection.insertOne(publisher);
    res.send(result)
})

app.get('/publishers', async(req,res)=>{
    const cursor = await publisherCollection.find().toArray();
    res.send(cursor)
})

 

//   app.get('/bookings/:id', async(req,res)=>{
//     const id = req.params;
//     const query = {_id: new ObjectId(id)}
//     const cursor = await bookingCollection.find(query).toArray();
//     res.send(cursor)
// })

//   app.get('/search/:hint', async(req, res)=>{
//     const {hint} = req.params;
//     const regex = new RegExp(`.*${hint}.*`,"i")
//     const query = {sname: regex};
//     const result = await serviceCollection.find(query).toArray();
//     res.send(result);
    
//   })

 
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
