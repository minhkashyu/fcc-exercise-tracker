require('dotenv').config();

let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { autoIndex: false });

exports.mongoose = mongoose;
