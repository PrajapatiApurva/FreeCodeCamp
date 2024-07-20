const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  original_url: { 
    type: String, 
    required: true,
    match: /^(https?:\/\/)?(www\.)?([a-zA-Z0-9_-]+)+\.[a-zA-Z]{2,}(:\d{1,5})?(\/.*)?$/
  },
  short_url: { 
    type: Number,
    required: true
  },
});

const Url = mongoose.model("shorteners", urlSchema);

module.exports = Url;
