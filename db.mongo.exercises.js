let {mongoose} = require('./db.mongo.js');

const ExerciseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  selectPopulatedPaths: false,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.date = ret.date.toDateString();
      delete ret.id;
      delete ret.__v;
      delete ret.user;
    },
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.date = ret.date.toDateString();
      delete ret.id;
      delete ret.__v;
      delete ret.user;
    },
  },
});

let ExerciseModel = mongoose.model('Exercise', ExerciseSchema);

const createAndSaveExercise = (obj, done) => {
  let exerciseDocument = new ExerciseModel(obj);

  exerciseDocument.save().then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

const findExerciseById = (exerciseId, done) => {
  ExerciseModel.findById(exerciseId).
    populate('user').
    then((doc) => {
      done(null, doc);
    }).
    catch((err) => {
      done(err);
    });
};

const fetchExercisesByCriteria = (objCriteria, limit, done) => {
  let query = ExerciseModel.find(objCriteria);
  if (limit) {
    query.limit(limit);
  }

  query.exec().then((data) => {
    done(null, data);
  }).catch((err) => {
    done(err);
  });
};

exports.ExerciseModel = ExerciseModel;
exports.createAndSaveExercise = createAndSaveExercise;
exports.findExerciseById = findExerciseById;
exports.fetchExercisesByCriteria = fetchExercisesByCriteria;
