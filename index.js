const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const port = process.env.PORT || 5000;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zvuaj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());

app.get("/", (req, res) => res.send("Hello, Sujon Madbor"));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const database = client.db("doctorsPortal");
  const appointmentCollection = database.collection("appointments");
  const doctorCollection = database.collection("doctors");

  // post data
  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    // console.log(appointment);
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // get data
  app.get("/appointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    // console.log(date.date);

    doctorCollection.find({ email: email }).toArray((err, doctors) => {
      const filter = { date: date.date };
      if (doctors.length === 0) {
        filter.email = email;
      }

      appointmentCollection.find(filter).toArray((err, documents) => {
        res.send(documents);
        // console.log(documents);
      });
    });
  });

  app.post("/addADoctor", (req, res) => {
    const pic = req.files.image;
    const name = req.body.name;
    const email = req.body.email;
    const picData = pic.data;
    const encodedPic = picData.toString("base64");

    const imageBuffer = Buffer.from(encodedPic, "base64");
    const doctor = {
      name,
      email,
      image: imageBuffer,
    };

    doctorCollection.insertOne({ doctor }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/doctors", (req, res) => {
    doctorCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/isDoctor", (req, res) => {
    const date = req.body;
    const email = req.body.email;

    doctorCollection.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });
});

app.listen(port);
