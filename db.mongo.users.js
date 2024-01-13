let {mongoose} = require('./db.mongo.js');

const UserSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true,
  },
}, {
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
});

let UserModel = mongoose.model('User', UserSchema);

const createAndSaveUser = (obj, done) => {
  let userDocument = new UserModel(obj);

  userDocument.save().then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

const findUserById = (userId, done) => {
  UserModel.findById(userId).then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

const findUserByUsername = (username, done) => {
  UserModel.findOne({
    username: username,
  }).then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

const fetchUsers = (done) => {
  UserModel.find().
    sort({username: 1}).
    exec().
    then((data) => {
      done(null, data);
    }).
    catch((err) => {
      done(err);
    });
};

exports.UserModel = UserModel;
exports.createAndSaveUser = createAndSaveUser;
exports.findUserById = findUserById;
exports.findUserByUsername = findUserByUsername;
exports.fetchUsers = fetchUsers;
