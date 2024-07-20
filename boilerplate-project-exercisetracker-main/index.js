require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const DB_URL = process.env.MONGO_URL;

mongoose.connect(DB_URL);

const userSchema = mongoose.Schema({
  username: {
    type: String,
  },
});
const User = mongoose.model("User", userSchema);

const exerciseSchema = mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  duration: {
    type: Number,
  },
  date: {
    type: Date,
  },
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", async (req, res) => {
  const userList = await User.find({}).select("_id username");
  if(!userList){
    console.log("Not found...");
    res.send("No users available now...");
  }
  else{
    console.log(userList);
    res.json(userList);
  }
});

app.get('/api/users/:_id/logs', async (req,res) => {
  const { from, to, limit } = req.query;
  const id = req.params._id;
  const user = await User.findById(id);
  if(!user){
    console.log("User not available...");
    return;
  }
  let dateFilter = {};
  if(from){
    dateFilter['$gte'] = new Date(from);
  }
  if(to){
    dateFilter['$lte'] = new Date(to);
  } 
  let filter = {
    user_id: id
  }
  if( from || to ){
    filter.date = dateFilter
  }

  const exercises = await Exercise.find(filter).limit(+limit ?? 500 );

  const logList = exercises.map( e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }));

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log: logList
  })
});

app.post('/api/users', async (req, res) => {
  
  const userObj = new User({
    username: req.body.username
  });
  try{
    const user = await userObj.save();
    console.log(user);
    res.json(user);
  }
  catch(e){
    res.send("Error on adding user: ", e.message);
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  const { description, duration, date} = req.body;

  try{
    const user = await User.findById(id);
    if(!user){
      res.send("Could not find user...")
    }
    else{
      const exreciseObj = new Exercise({
        user_id: user._id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      })
      const exercise = await exreciseObj.save();
      console.log(exercise);
      res.json({
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString(),
        _id: user._id
      });
    }
  }catch(e){
    res.send("Error on Saving the Exercise:", e.message);
  }
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port http://localhost:" + listener.address().port);
});
