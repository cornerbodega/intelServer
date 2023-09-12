console.log("INTELLIGENCE SERVER");
import express from "express";
// const handlebars = require('handlebars');
// import fetch from 'node-fetch';
const app = express();
import { fetch } from "undici";
console.log("fetch");
// console.log(fetch);
import axios from "axios";
// const express = require("express");

const port = 3000;
app.use(express.json());
import { createClient } from "@supabase/supabase-js";
const log = console.log;
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  query,
  orderByValue,
  limitToFirst,
} from "firebase/database";
import fs from "fs";
// import path from "path";
// import * as path from "path";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// import cors from "cors";
// app.use(cors());
import initSqlJs from "sql.js";
import { animals } from "./animal-names.js";
import { contains } from "@firebase/util";

// Your web app's Firebase configuration
const serverUid = "lfacNX3WXSPv9eU5zrLShg38IVB3";
const firebaseConfig = {
  apiKey: "AIzaSyAFS7O64m_FOVnWlR4gw4gv3bxxVY_kwtw",
  authDomain: "rhyme-with-us.firebaseapp.com",
  projectId: "rhyme-with-us",
  storageBucket: "rhyme-with-us.appspot.com",
  messagingSenderId: "352365821237",
  appId: "1:352365821237:web:b212f87ba1b0720ce1e07c",
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase();

// Set Words Per Level
const WORDS_PER_LEVEL = 30;

// Serve the files in /assets at the URI /assets.
app.use("/assets", express.static("assets"));

app.get("/poulate-arpabet-and-definitions", async (req, res) => {
  function populateArpabetAndDefinitions() {
    signServerIntoFirebase().then(async (userCredential) => {
      // console.log("userCredentials");
      // console.log(userCredential);
      res.sendStatus(200);
      // set(ref(db, `/arpabet/${serverUid}`), {});
      // set(ref(db, `/definitions/${serverUid}`), {});

      const sqlPromise = await initSqlJs({
        // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
        // You can omit locateFile completely when running in node
        locateFile: (file) => `${"./node_modules/sql.js/dist/"}${file}`,
      });

      //   const dataPromise = axios
      //     .get("https://storage.googleapis.com/rwu-words-bucket/words.db", {
      //       responseType: "arraybuffer",
      //     })
      //     .catch((error) => {
      //       console.log(error);
      //     })
      //     .then((res) => res.data);
      const dataPromise = loadLocalDb();
      const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
      //   const wordsDb = new SQL.Database(new Uint8Array(buf));
      const uInt8Array = new Uint8Array(buf);

      const wordsDb = new SQL.Database(uInt8Array);
      // console.log(dataPromise);
      // console.log("words db");
      // console.log(wordsDb);
      // Prepare an sql statement
      // const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

      // // Bind values to the parameters and fetch the results of the query
      // const result = stmt.getAsObject({ ":aval": 1, ":bval": "world" });
      // console.log(result); // Will print {a:1, b:'world'}
      // stmt.free();

      const queryResult = wordsDb.exec(`SELECT * FROM words`);
      console.log("queryResult");
      console.log(queryResult);
      let wordsResults = [];
      queryResult[0].values.forEach((queryResultValueArray) => {
        wordsResults.push({
          name: queryResultValueArray[0],
          definition: queryResultValueArray[1],
          arpabet: queryResultValueArray[2],
        });
      });
      console.log("wordsResults.length");
      console.log(wordsResults.length);
      // wordsResults.forEach(async (word) => {
      let i = 0;
      let max = wordsResults.length;
      for (const word of wordsResults) {
        i++;
        console.log("word");
        console.log(word);
        // await set(
        //   ref(db, `/definitions/${serverUid}/${word.name}`),
        //   word.definition
        // );
        await set(
          ref(
            db,
            `/arpabet/${serverUid}/${word.name.replace(/[^a-zA-Z ]/g, "")}`
          ),
          word.arpabet
        ).catch((error) => {
          console.error(error);
        });
        log(`processing ${i} of ${max} ${((i / max) * 100).toFixed(2)}%`);
      }
    });
  }
  // try {
  //   console.log("Hello");
  //   res.sendStatus(200);
  // } catch (e) {
  //   console.error(e);
  //   res.sendStatus(500);
  // }
});
app.get("/go-to-lobby", async (req, res) => {
  goToLobby();
  res.sendStatus(200);
});
async function goToLobby() {
  signServerIntoFirebase().then((userCredential) => {
    // clear previous /leaderboard
    set(ref(db, `/leaderboard/${serverUid}`), {});

    // clear previous /my-rank
    set(ref(db, `/my-rank/${serverUid}`), {});
    // calculate and save /leaderboard/rank/username (1-10)

    // set NPC Scores
    const numberNpcs = 10;
    let npcPromises = [];
    for (let i = 0; i < numberNpcs; i++) {
      const npcName = `NPC${getRandomAnimal()}${getRandomInt(1000, 9999)}`;
      npcPromises.push(
        set(ref(db, `/my-score/${npcName}`), getRandomInt(100, 1000) * -1)
      );
    }
    Promise.all(npcPromises).then(setLeaderbordRankAndXp);
    function setLeaderbordRankAndXp() {
      get(query(ref(db, "my-score/"), orderByValue())).then(
        async (scoreSnapshot) => {
          if (scoreSnapshot.exists()) {
            let rankIndex = 0;
            scoreSnapshot.forEach((score) => {
              // console.log("score");

              rankIndex++;
              // console.log(rankIndex);
              getXpandRank(rankIndex);
              function getXpandRank(rankIndex) {
                // console.log(rankIndex);
                const username = score.key;
                const userScore = score.val();
                get(query(ref(db, `my-xp/${serverUid}/${username}`))).then(
                  async (xpSnapshot) => {
                    let userXp = 0;
                    if (xpSnapshot.exists()) {
                      userXp = xpSnapshot.val();
                    }
                    console.log(
                      `rankIndex ${rankIndex} username ${username} serverUid ${serverUid} userScore ${userScore} userXp ${userXp}`
                    );
                    // save to /my-xp
                    if (
                      !username.startsWith("Guest") &&
                      !username.startsWith("NPC")
                    ) {
                      set(
                        ref(db, `/my-xp/${serverUid}/${username}`),
                        userXp + userScore
                      );
                    }
                    // save to /leaderboard if rankindex <= 5
                    if (rankIndex <= 5) {
                      set(
                        ref(
                          db,
                          `/leaderboard/${serverUid}/${rankIndex}/${username}`
                        ),
                        userScore
                      );
                    }
                    // save to /my-rank/username
                    set(
                      ref(db, `/my-rank/${serverUid}/${username}/${userScore}`),
                      rankIndex
                    );
                  }
                );
              }
            });
          }
        }
      );
    }

    // Clear old scores afte 10 seconds
    clearOldScores();
    function clearOldScores() {
      setTimeout(() => {
        console.log("Clear old scores");
        set(ref(db, `/my-score/`), {});
      }, 60000);
    }

    // scoresRef.on("value", (snapshot) => {
    //   snapshot.forEach((data) => {
    //     console.log("The " + data.key + " dinosaur's score is " + data.val());
    //   });
    // });
    // calculate and save /my-rank/username
    // clear previous /my-score
    // set the /round-state to LOBBY
    set(ref(db, `round-state/${serverUid}`), "LOBBY");
  });
}
function signServerIntoFirebase() {
  const email = "musical.investments.game@gmail.com";
  const password = "suzi99";
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
}
app.get("/set-round-state", async (req, res) => {
  // return res.sendStatus(201);
  console.log("Set Round State");
  const dbRef = ref(getDatabase());
  get(child(dbRef, `/round-state/${serverUid}`))
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        const roundState = snapshot.val();
        console.log(`Round State: ${JSON.stringify(roundState)}`);
        // if (data === "PLAYING") {
        //   set(ref(db, "round-state"), "PLAYING2");
        // }
        if (roundState === "PLAYING") {
          get(child(dbRef, `/round-end-time/${serverUid}`)).then((snapshot) => {
            if (snapshot.exists()) {
              const endTime = snapshot.val();
              const delta = endTime - Date.now();
              console.log(`Playing: End Time ${endTime}`);
              console.log(`Playing: Time Left ${delta}`);
              if (delta < 0) {
                console.log("Delta less than 0, go to lobby");
                // this is in the past!
                return goToLobby();
              }
              if (delta < 50000) {
                console.log(
                  "Delta greater than 0, less than 50, wait and go to lobby"
                );

                // this is coming up, we should wait the delta and them go to the lobby
                setTimeout(goToLobby, delta);
              }
              // if (endTime - Date.now() < 1000) {
              //   console.log("Set Round State: Go to Lobby");
              //   // calculate high scores here
              //   // write to firebase
              //   goToLobby();
              // }
            }
            // else {
            //   set(ref(db, `round-state/${serverUid}`), "LOBBY");
            // }
          });
        }
        if (roundState === "LOBBY") {
          console.log("Get Target Words");
          const sqlPromise = await initSqlJs({
            // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
            // You can omit locateFile completely when running in node
            locateFile: (file) => `${"./node_modules/sql.js/dist/"}${file}`,
          });

          var myFile = "./common-words.db";

          function loadLocalDb() {
            return new Promise((resolve, reject) => {
              fs.readFile(myFile, null, function (err, nb) {
                if (err) {
                  reject(err);
                }
                var ab = nb.buffer;
                resolve(ab);
                return ab;
                // console.log(ab); // all is well
                // console.log(new Uint8Array(ab)); // all is well
              });
            });
          }

          //   const dataPromise = axios
          //     .get("https://storage.googleapis.com/rwu-words-bucket/words.db", {
          //       responseType: "arraybuffer",
          //     })
          //     .catch((error) => {
          //       console.log(error);
          //     })
          //     .then((res) => res.data);
          const dataPromise = loadLocalDb();
          const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
          //   const wordsDb = new SQL.Database(new Uint8Array(buf));
          const uInt8Array = new Uint8Array(buf);

          const wordsDb = new SQL.Database(uInt8Array);
          // console.log(dataPromise);
          // console.log("words db");
          // console.log(wordsDb);
          // Prepare an sql statement
          // const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

          // // Bind values to the parameters and fetch the results of the query
          // const result = stmt.getAsObject({ ":aval": 1, ":bval": "world" });
          // console.log(result); // Will print {a:1, b:'world'}
          // stmt.free();

          // Change Query depending on upcoming round difficulty
          // Set Round Difficulty
          // Set new upcoming round difficulty
          // Structure:
          // /round-difficulty/upcoming/3
          // /round-difficulty/current/1
          // get current and upcomning round difficulties
          // create them if they don't exist
          // set upcoming to current
          // set new upcoming
          // get words, set words to firebase for current

          get(child(dbRef, `/round-difficulty/${serverUid}/next`)).then(
            (snapshot) => {
              let newCurrentDifficulty = getRandomInt(1, 3);
              if (snapshot.exists()) {
                newCurrentDifficulty = snapshot.val();
                // const chosenIndex = newCurrentDifficulty;
              }
              const newNextDifficulty = getRandomInt(1, 3);
              set(
                ref(db, `/round-difficulty/${serverUid}/next`),
                newNextDifficulty
              );
              set(
                ref(db, `/round-difficulty/${serverUid}/current`),
                newCurrentDifficulty
              );

              const targetWordsQueries = [
                `SELECT name FROM words where isCommon = 1 and syllables = 1 order by random() limit ${WORDS_PER_LEVEL}`,
                `SELECT name FROM words where isCommon = 1 order by random() limit ${WORDS_PER_LEVEL}`,
                `SELECT name FROM words where not definition is null order by random() limit ${WORDS_PER_LEVEL}`,
              ];

              const queryResult = wordsDb.exec(
                targetWordsQueries[newCurrentDifficulty - 1]
              );

              // console.log("queryResult");
              // console.log(queryResult);
              let wordsResults = [];
              queryResult[0].values.forEach((queryResultValueArray) => {
                wordsResults.push(queryResultValueArray[0]);
              });

              // let allRoundWords = [];
              // queryResult[0].values;

              // console.log("wordsBySyllable");
              // console.log(wordsBySyllable);
              //  /words/1/[...]
              //  /words/2/[...]
              //  /words/.../[...]
              // Each level gets progressively harder
              // Each level has a higher chance to have higher-syllable words
              //
              let targetWords = [];

              for (
                let wordIndex = 0;
                wordIndex < WORDS_PER_LEVEL;
                wordIndex++
              ) {
                targetWords.push(wordsResults[wordIndex]);
              }

              // const levelRefName = `/targetWords/${level}`;

              signServerIntoFirebase()
                .then((userCredential) => {
                  // Signed in
                  const user = userCredential.user;
                  set(ref(db, `/target-words/${user.uid}`), targetWords);
                  set(ref(db, `/round-state/${user.uid}`), "PLAYING");
                  set(
                    ref(db, `/round-end-time/${user.uid}`),
                    Date.now() + 120000
                  );
                  console.log("Set!");
                  // ...
                })
                .catch((error) => {
                  console.log("error");
                  console.log(error);
                  const errorCode = error.code;
                  const errorMessage = error.message;
                });
            }
          );
        }
        res.sendStatus(200);
      } else {
        console.log("No data available");
        res.sendStatus(505);
      }
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(506);
    });
});

app.get("/", async (req, res) => {
  try {
    console.log("Hello");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});

function loadLocalDb() {
  return new Promise((resolve, reject) => {
    // all words!
    const myFile = "./words.db";

    fs.readFile(myFile, null, function (err, nb) {
      if (err) {
        reject(err);
      }
      var ab = nb.buffer;
      resolve(ab);
      return ab;
      // console.log(ab); // all is well
      // console.log(new Uint8Array(ab)); // all is well
    });
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomAnimal() {
  const _animals = animals();
  const animalIndex = getRandomInt(0, _animals.length - 1);
  return _animals[animalIndex];
}

function getValueFromFirebase(path) {
  // console.log("getValue Path path");
  // console.log(path);
  const promise = new Promise((resolve, reject) => {
    const dbRef = ref(getDatabase());
    get(child(dbRef, path))
      .then((snapshot) => {
        if (snapshot.exists()) {
          // console.log(`value retreived from firebase ${snapshot.val()}`);
          resolve(snapshot.val());
        } else {
          reject();
          console.log("No data available");
        }
      })
      .catch((error) => {
        reject();
        console.error(error);
      });
  });
  return promise;
}
