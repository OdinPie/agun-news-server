const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
require('dotenv').config();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174'],
  credentials: true
}));

// app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res)=>{
    res.send('agun news is on fireee!!!🔥🔥🔥');
})
app.listen(port, ()=>{
    console.log(`listening on port : ${port}`);
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@odinpiesdatabase.beom3yx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db('agunDB');
    const articleCollection = database.collection('articleCollection');
    const userCollection = database.collection('userCollection');
    const publisherCollection = database.collection('publisherCollection');

    const verifyToken  = async(req,res,next) =>{
      const token = req?.cookies?.token;
      // console.log('middleware token: ',token);
        if(!token){
          // console.log('token nai');
            return res.status(401).send({message: 'unauthorized access'})
        }
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded){
            if(err){
              // console.log('ulta palta token');
            return res.status(401).send({message: 'unauthorized access'})
            }
            req.user = decoded;
            // console.log('in token ver : ', req.user);
             next();
       
      })
    
    }
    
    const verifyAdmin = async(req,res,next) =>{
      const email = req.user.data.email;
      const query = {email : email};
      // console.log(email);
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role == 'admin' ;
      if(!isAdmin){
        return res.status(403).send({message: 'forbidden access!!'})
      }
      next();
    }

    app.post('/jwt', async(req,res)=>{
      const user = req.body;
      const token = jwt.sign({data: user},`${process.env.JWT_SECRET}`,{expiresIn: '1h'});
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true})
    })

    app.post('/logout', async(req, res)=>{
      const user = req.body;
      res.clearCookie('token', {maxAge: 0})
      .send({success: true})
    })

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

    app.get('/allarticles', async(req,res)=>{
      const page= req.query.page || 1;
      const pageSize = 10;

      const result = await articleCollection
      .find({})
      .skip((page-1)*pageSize)
      .limit(pageSize)
      .toArray();

      res.send(result);
      })

    app.get('/articles/:id', async(req,res)=>{
      const id = req.params;
      const query = {_id: new ObjectId(id)}
      const cursor = await articleCollection.find(query).toArray();
      res.send(cursor)
  })

    app.get('/trending', async (req,res)=>{
      
        sort = {viewCount : -1}
     
      const result = await articleCollection
      .find()
      .sort(sort)
      .limit(6)
      .toArray();
      res.send(result);
    })

  app.patch('/approve/:id',async(req,res)=>{
      const id = req.params;
      const filter = {_id: new ObjectId(id)}
      const updatedDoc = req.body;
      option = { upsert: true }
      const updateDoc ={
        
        $set: {
          status: updatedDoc.status,
        }
      }

    const result = await articleCollection.updateOne(filter, updateDoc, option);
    res.send(result);
  })

  app.patch('/decline/:id',async(req,res)=>{
    const id = req.params;
    const filter = {_id: new ObjectId(id)}
    const updatedDoc = req.body;
    option = { upsert: true }
    const updateDoc ={
      
      $set: {
        status: updatedDoc.status,
        declineReason: updatedDoc?.declineReason 
      }
    }

  const result = await articleCollection.updateOne(filter, updateDoc, option);
  res.send(result);
})

app.patch('/updatearticle/:id',async(req,res)=>{
  const id = req.params;
  const filter = {_id: new ObjectId(id)}
  const updatedDoc = req.body;
  option = { upsert: true }
  const updateDoc ={
    
    $set: {
      title : updatedDoc.title,
      articleCover : updatedDoc.articleCover,
      publisher : updatedDoc.publisher,
      detail : updatedDoc.detail,
      tags : updatedDoc.tags,
      status : updatedDoc.status,
      updateDate : updatedDoc.updateDate
    }
  }

const result = await articleCollection.updateOne(filter, updateDoc, option);
res.send(result);
})

  app.delete('/delete_article/:id',async(req,res)=>{
    const id = req.params;
    const filter = { _id : new ObjectId(id) };
    const result = await articleCollection.deleteOne(filter); //deleted result
    res.send(result);
  })

  app.patch('/makepremium/:id',async(req,res)=>{
    const id = req.params;
    const filter = {_id: new ObjectId(id)}
    const updatedDoc = req.body;
    option = { upsert: true }
    const updateDoc ={
      
      $set: {
        isPremium: 'yes'
      }
    }

  const result = await articleCollection.updateOne(filter, updateDoc, option);
  res.send(result);
})

  app.get('/addviewcount', async(req,res)=>{
    option = {upsert:true}
    const updatedDoc = {
      $set : {
        viewCount : 0
      }
    }

    const result = await articleCollection.updateMany({},updatedDoc);
    res.send(result)
  })

  app.get('/addpremiumtaken', async(req,res)=>{
    option = {upsert:true}
    const updatedDoc = {
      $set : {
        premiumTaken : null
      }
    }

    const result = await userCollection.updateMany({},updatedDoc);
    res.send(result)
  })

  app.patch('/updatecount/:id',async(req,res)=>{
    const id = req.params;
    const filter = {_id: new ObjectId(id)}
    const updatedDoc = req.body;
    option = { upsert: true }
    const updateDoc ={
      $set: {
        viewCount: updatedDoc.viewCount,
      }
    }

  const result = await articleCollection.updateOne(filter, updateDoc, option);
  res.send(result);
})

app.patch('/updatepremiumuser',async(req,res)=>{
  const email = req.query.email;
  const filter = {email:email}
  const updatedDoc = req.body;
  option = { upsert: true }
  const updateDoc ={
    $set: {
      premiumDuration : updatedDoc.premiumDuration,
      premiumTaken : updatedDoc.premiumTaken,
      takenDate : updatedDoc.takenDate,
      expiredDate : updatedDoc.expiredDate,
    }
  }

const result = await userCollection.updateOne(filter, updateDoc, option);
res.send(result);
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

app.get('/users',verifyToken, verifyAdmin, async(req,res)=>{
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

app.patch('/user/makeadmin/:id', async(req,res)=>{
  const id = req.params;
  const filter = {_id: new ObjectId(id)}

  const updateDoc ={
    $set: {
      role:'admin'
    }
  }

const result = await userCollection.updateOne(filter, updateDoc);
res.send(result);
})

//admin stats

  app.get('/admin-stats', async (req,res)=>{
    const khanFilter = {publisher : "Khan Brothers Publications"};
    const binaryFilter = {publisher : "Binary Publications"};
    const chronFilter = {publisher : "Chronicles Publications"};
    const abcFilter = {publisher : "ABC Publications"};
    const khan = await articleCollection.countDocuments(khanFilter);
    const binary = await articleCollection.countDocuments(binaryFilter);
    const chron = await articleCollection.countDocuments(chronFilter);
    const abc = await articleCollection.countDocuments(abcFilter);
    
    res.send({khan, binary, chron, abc})
  })

  app.get('/user/admin/:email', verifyToken, async(req,res)=>{
    const email = req.params.email;
    if(email !== req.user.email) {
      return res.status(403).send({message : 'forbidden access'})
    }

    const query = {email : email};
    const user = await userCollection.findOne(query);
    let admin = false;
    if(user){
      admin = user?.role === 'admin';
    }
    res.send({admin});
  })

  app.get('/user-count', async(req,res)=>{
    const filter = { premiumTaken : 'yes' };
    const premium = await userCollection.countDocuments(filter);
    const total = await userCollection.countDocuments();
    const normal = total-premium;
    res.send({total,normal,premium})
  })

 
  app.get('/search', async(req, res)=>{
    const hint = req?.query.hint;
    const apublisher = req?.query.publisher;
    const atags = [req?.query.tags];
    const regex = new RegExp(`.*${hint}.*`,"i")
    const query = {title: regex, tags: { $in: atags }, publisher: apublisher};
    const result = await articleCollection.find(query).toArray();
    res.send(result);
    
  })

  // app.post('/create-payment-intent', async(req,res)=>{
  //   const {price} = req.body;
  //   const amount = parseInt(price * 100);

  //   const paymentIntent = await stripe.paymentIntents.create({
  //     amount : amount,
  //     currency: "usd",
  //     payment_method_types: ["card"],

  //   });

  //   res.send({
  //     clientSecret: paymentIntent.client_secret
  //   })
  // })

 
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
