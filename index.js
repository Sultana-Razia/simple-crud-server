const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.qtkz8.mongodb.net:27017,cluster0-shard-00-01.qtkz8.mongodb.net:27017,cluster0-shard-00-02.qtkz8.mongodb.net:27017/?ssl=true&replicaSet=atlas-64o5c2-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qtkz8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


        const database = client.db("usersDB");
        const userCollection = database.collection("users");

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const user = await userCollection.findOne(query);
            res.send(user);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log('new user', user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            console.log(id, user);

            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedUser = {
                $set: {
                    name: user.name,
                    email: user.email
                }
            }
            const result = await userCollection.updateOne(filter, updatedUser, options);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            console.log('please delete from database', id);
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Simple crud is running');
})


app.listen(port, () => {
    console.log(`Simple crud is running, ${port}`);
})