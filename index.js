const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r71m8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('house');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('allOrder');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');

        //get api
        app.get('/oneCustomerProducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log(query);
            const cursor = orderCollection.find(query);
            const products = await cursor.toArray();
            // res.send(products);
            res.json(products);
        })
        app.get('/usersreview', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })
        app.post('/usersreview', async (req, res) => {
            const review = req.body;
            console.log(review)
            const result = await reviewCollection.insertOne(review)
            console.log('added ', result);
            res.json(result);
        })
        app.get('/allOder', async (req, res) => {

            const cursor = orderCollection.find({});
            const products = await cursor.toArray();
            // res.send(products);
            res.json(products);
        })

        //
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);

        })
        //

        // GET Single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        //post api
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product);

            const result = await productsCollection.insertOne(product);
            // console.log(result);
            res.json(result)
        })

        app.post('/products/myProducts', async (req, res) => {
            const newOrder = req.body;
            console.log(newOrder)
            console.log('hit the post api', newOrder);
            const result = await orderCollection.insertOne(newOrder);
            res.json(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
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
        })

        app.put('/users', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        app.put('/OrderInfo/status', async (req, res) => {
            const id = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: { "status": 'approved' } };
            const result = await orderCollection.updateOne(query, updateDoc);
            res.json(result);

        })

        // DELETE API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            console.log(result);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running house ....');
});

app.listen(port, () => {
    console.log('Running House server on port', port);
})