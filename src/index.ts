import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use("/api/v1", app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);

app.get("/warmup", (req, res) => {
  res.send("halo apa kabar");
});

// add new data
app.post("/fights", async (req, res) => {
  try {
    const { winner, losser, title } = req.body;
    const data = {
      winner,
      losser,
      title,
      id: ""
    };
    const fightRef = db.collection("fights").doc();
    const fightRefId = fightRef.id;

    data.id = fightRefId;
    await fightRef.set(data).then(result => {
      return data;
    });
    res.json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// view data by id
app.get("/fights/:id", async (req, res) => {
  try {
    const fightId = req.params.id;

    if (!fightId) throw new Error("Fight ID is required");

    const fight = await db
      .collection("fights")
      .doc(fightId)
      .get();

    if (!fight.exists) {
      throw new Error("Fight tidak ada");
    }

    res.json({
      id: fight.id,
      data: fight.data()
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// view all data
app.get("/fights", async (req, res) => {
  try {
    const fights: any = [];

    await db
      .collection("fights")
      .get()
      .then(snapshots => {
        snapshots.forEach(doc => {
          fights.push(
            // id: doc.id,
            doc.data()
          );
        });
        res.json(fights);
      });
  } catch (error) {
    res.status(500).send(error);
  }
});

// update data by id
app.put("/fights/:id", async (req, res) => {
  try {
    const fightId = req.params.id;
    const title = req.body.title;

    if (!fightId) throw new Error("id is blank");
    if (!title) throw new Error("Title sudah ada");

    // const fightRefId = fightRef.id;
    // data.id = fightRef;
    const fight = db.collection("fights").doc(fightId);
    let data: any = {};

    await fight
      .update({ title: title })
      .then(async fromFirebase => {
        console.log(fromFirebase);
        await fight.get().then(result => {
          if (!result.exists) {
            console.log("dokumen tidak ada");
          } else {
            data = result.data();
          }
        });
      })
      .catch(err => {
        console.log(err);
      });

    res.json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// delete data by id
app.delete("/fights/:id", async (req, res) => {
  try {
    const fightId = req.params.id;

    if (!fightId) throw new Error("id is blank");

    await db
      .collection("fights")
      .doc(fightId)
      .delete();

    res.json({
      id: fightId
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// app.listen(3000, () => {
//   console.log(`Server is running in http://localhost:${3000}`);
// });
