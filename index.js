const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.78xjoll.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const taskCollection = client.db("taskDB").collection("task");

    // Connect the client to the server	(optional starting in v4.7)

    app.post("/addTask", async (req, res) => {
      const newTask = req.body;
      console.log(newTask);
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });

    app.get("/allTasks", async (req, res) => {
      const alltasks = await taskCollection.find().toArray();
      res.send(alltasks);
    });

    app.get("/pendingtask", async (req, res) => {
      const query = { status: "pending" };
      const pendingtasks = await taskCollection.find(query).toArray();
      res.send(pendingtasks);
    });

    app.get("/editTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };

      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.put("/editTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const editedTask = req.body;
      const finalTask = {
        $set: {
          title: editedTask.title,
          description: editedTask.description,
          status: editedTask.status,
        },
      };

      const result = await taskCollection.updateOne(query, finalTask, options);

      res.send(result);
    });

    app.patch("/editStatus/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedStatus = req.body;
      const editedTask = {
        $set: {
          status: updatedStatus.status,
        },
      };

      const result = await taskCollection.updateOne(query, editedTask);
      res.send(result);
    });

    app.delete("/deleteTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`server is running for mohite `);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
