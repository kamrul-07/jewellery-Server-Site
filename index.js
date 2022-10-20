const express = require('express')
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId=require("mongodb").ObjectId;

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.int5l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const ReviewCollection = client.db ("Jewelery").collection("PersonReview");
        const ProductCollection= client.db("Jewelery").collection("Products");
        const OrdersCollection = client.db('Jewelery').collection("orders");
        const usersCollection = client.db('Jewelery').collection('users');
       

        app.get('/products',async (req,res) =>{
          const cursor = ProductCollection.find({})
            const result =await cursor.limit(6).toArray();
            res.json(result)
        })
        app.get('/allproducts',async (req,res) =>{
            const result =await ProductCollection.find({}).toArray();
            res.json(result)
        })

        app.get('/product/:id', async(req, res)=>{
          const id= req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await ProductCollection.findOne(query);
          res.json(result);
        })

        app.get('/review', async (req,res) => {
          const review =await ReviewCollection.find({}).toArray();
          res.json(review)
        })

       

        app.post('/addProduct', (req,res) => {
           ProductCollection.insertOne(req.body).then((result) => res.send(result.insertedId))
        })

         app.post('/users', async (req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.json(result);
      })

      

        app.post('/review',(req,res) => {
          ReviewCollection.insertOne(req.body).then((result) => res.send(result.insertedId))
        })
    // order collection
        app.post('/orders', async(req, res) => {
          const order = req.body;
          const result = await OrdersCollection.insertOne(order);
          res.json(result);
          
      });
      // to get all orders
      app.get('/orders', async (req, res) => {
        const cursor = OrdersCollection.find({});
        const allOrders = await cursor.toArray();
        res.send(allOrders);
        
    })
       
      
      // ordercollection get for every email user

      // myOrders 
      app.get('/myOrders', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const cursor = OrdersCollection.find(query);
        const myOrders = await cursor.toArray();
        res.json(myOrders);
    });

    
        app.get('/manageproducts',async (req,res) =>{
          const result =await ProductCollection.find({}).toArray();
          res.json(result)
      })
        
        app.delete("/deleteProduct/:id",async (req,res) => {
          console.log(req.params.id);

          const result =await ProductCollection.deleteOne({_id:ObjectId(req.params.id)})
          res.send(result); 
        })

        app.put('/users/admin', async(req, res)=>{
          const user = req.body;
          const filter ={email:user.email};
          const updateDoc = {$set:{role:'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        })

        app.get('/users/:email', async (req, res) => {
          const email = req.params.email;
          const query = { email: email };
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if (user?.role === 'admin') {
              isAdmin = true;
          }
          res.json({ admin: isAdmin });
      });


    }
    finally{
        // await client.close();   
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at ${port}`)
})