const express = require('express');
const cors = require('cors');
const app = express();
const firebase = require('firebase-admin');
app.use(express.json());
app.use(cors());
const credentials = require('./secquraise-6f02e-firebase-adminsdk-79vjb-f3a67d0358.json');

firebase.initializeApp({
    credential: firebase.credential.cert(credentials),
    storageBucket: "gs://secquraise-6f02e.appspot.com",
});

const db = firebase.firestore();
const person = db.collection("person");
const bucket = firebase.storage().bucket();
const options = {
    prefix: 'person/',
};
app.get('/images', async (req, res) => {
    try {
        const results = await bucket.getFiles(options);
        const files = results[0];
        const imageUrls = {};
        for (const file of files) {
            const url = await file.getSignedUrl({
                action: 'read',
                expires: '03-17-2025',
            });
            imageUrls[file.name] = url;
        }
        res.json(imageUrls);
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).send("Error while fetching files")
    }
});


app.get('/', (req, res) => {
    res.send('hi')
})

app.get("/get", async (req, res) => {
    const snapshot = await person.get();
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.send(list);
  });

  app.get("/get/:id", async (req, res) => {
    const id = req.params.id;
    const doc = await person.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ error: "Document not found" });
    }
    res.send(doc.data());
});

app.post("/create", async (req, res) => {
    const data = req.body;
    await person.add({ data });
    res.send({ msg: "User Added" });
});

app.listen(5000, () => { console.log("listening"); })