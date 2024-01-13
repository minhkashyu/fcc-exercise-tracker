// index.js
// where your node app starts

// init project
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dbUsers = require('./db.mongo.users');
const dbExercises = require('./db.mongo.exercises');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// You can make a GET request to /api/users to get a list of all users.
app.get('/api/users', function(req, res) {

  // The GET request to /api/users returns an array.
  // Each element in the array returned from GET /api/users is an object
  // literal containing a user's username and _id.
  dbUsers.fetchUsers((err, users) => {
    if (err) {
      return res.json({error: err});
    }

    res.json(users);
  });
});

// You can POST to /api/users with form data username to create a new user.
app.post('/api/users', function(req, res) {
  let username = (req.body.username || '').trim();

  if (!username) {
    return res.json({error: 'The username is invalid.'});
  }

  // The returned response from POST /api/users with form data username will
  // be an object with username and _id properties.
  // {
  //   username: "fcc_test",
  //   _id: "5fb5853f734231456ccb3b05"
  // }
  dbUsers.findUserByUsername(username, (err, user) => {
    if (err) {
      return res.json({error: err});
    }

    if (user) {
      return res.json(user);
    }

    dbUsers.createAndSaveUser({
      username: username,
    }, (err, user) => {
      if (err) {
        return res.json({error: err});
      }

      res.json(user);
    });
  });
});

// You can POST to /api/users/:_id/exercises with form data description,
// duration, and optionally date.
// If no date is supplied, the current date will be used.
app.post('/api/users/:id/exercises', function(req, res) {
  let userId = req.params.id || '';
  let description = (req.body.description || '').trim();
  let duration = parseInt(req.body.duration || '0');
  let date = (req.body.date || '').trim();

  if (!userId) {
    return res.json({'error': 'The user is not found.'});
  }

  if (!description) {
    return res.json({'error': 'The description is invalid.'});
  }

  if (!duration) {
    return res.json({'error': 'The duration is invalid.'});
  }

  let dt;
  if (!date) {
    dt = new Date();
  } else {
    dt = new Date(date);
  }
  if (!dt) {
    return res.json({'error': 'The date is invalid.'});
  }

  // The response returned from POST /api/users/:_id/exercises will be the
  // user object with the exercise fields added.
  // {
  //   username: "fcc_test",
  //   description: "test",
  //   duration: 60,
  //   date: "Mon Jan 01 1990",
  //   _id: "5fb5853f734231456ccb3b05"
  // }
  dbUsers.findUserById(userId, (err, user) => {
    if (err || !user) {
      return res.json({'error': 'The user is not found.'});
    }

    dbExercises.createAndSaveExercise({
      user: userId,
      description: description,
      duration: duration,
      date: dt,
    }, (err, doc) => {
      if (err) {
        return res.json({'error': err});
      }

      doc.username = user.username;

      res.json(doc);
    });
  });
});

// You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
app.get('/api/users/:id/logs', function(req, res) {
  const isValidDate = (d) => {
    return d instanceof Date && !isNaN(d);
  };

  // You can add from, to and limit parameters to a GET /api/users/:_id/logs
  // request to retrieve part of the log of any user. from and to are dates
  // in yyyy-mm-dd format. limit is an integer of how many logs to send back.
  // ?[from][&amp;to][&amp;limit]
  let userId = req.params.id || '';
  let dateFrom = req.query.from || '';
  let dateTo = req.query.to || '';
  let limit = parseInt(req.query.limit || '0');

  if (!userId) {
    return res.json({'error': 'The user is not found.'});
  }

  if (dateFrom) {
    dateFrom = new Date(dateFrom);

    if (!isValidDate(dateFrom)) {
      return res.json({'error': 'The from date is invalid.'});
    }

    // format from date to yyyy-mm-dd
    dateFrom = dateFrom.toISOString().split('T')[0];
  }

  if (dateTo) {
    dateTo = new Date(dateTo);

    if (!isValidDate(dateTo)) {
      return res.json({'error': 'The to date is invalid.'});
    }

    // format to date to yyyy-mm-dd
    dateTo = dateTo.toISOString().split('T')[0];
  }

  // A request to a user's log GET /api/users/:_id/logs returns a user object
  // with a count property representing the number of exercises that belong
  // to that user.
  // A GET request to /api/users/:_id/logs will return the user object with
  // a log array of all the exercises added.
  // Each item in the log array that is returned from GET /api/users/:_id/logs
  // is an object that should have a description, duration, and date properties.
  // The description property of any object in the log array that is returned
  // from GET /api/users/:_id/logs should be a string.
  // The duration property of any object in the log array that is returned
  // from GET /api/users/:_id/logs should be a number.
  // The date property of any object in the log array that is returned
  // from GET /api/users/:_id/logs should be a string.
  // Use the dateString format of the Date API.
  // {
  //   username: "fcc_test",
  //   count: 1,
  //   _id: "5fb5853f734231456ccb3b05",
  //   log: [{
  //   description: "test",
  //   duration: 60,
  //   date: "Mon Jan 01 1990",
  // }]
  // }
  dbUsers.findUserById(userId, (err, user) => {
    if (err) {
      return res.json({'error': err});
    }

    if (!user) {
      return res.json({'error': 'The user is not found.'});
    }

    let criteria = {
      user: userId,
    };

    if (dateFrom) {
      if (criteria['date']) {
        criteria['date']['$gte'] = dateFrom;
      } else {
        criteria['date'] = {};
        criteria['date']['$gte'] = dateFrom;
      }
    }

    if (dateTo) {
      if (criteria['date']) {
        criteria['date']['$lte'] = dateTo;
      } else {
        criteria['date'] = {};
        criteria['date']['$lte'] = dateTo;
      }
    }

    dbExercises.fetchExercisesByCriteria(criteria, limit, (err, exercises) => {
      if (err) {
        return res.json({'error': criteria});
      }

      res.json({
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: exercises,
      });
    });
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
