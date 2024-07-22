const { Pool } = require('pg');
const express = require('express');
const router = express.Router();
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['https://testnusbb-client.vercel.app']
}));
app.options('*', cors());


const pool = new Pool({
  connectionString: "postgres://default:cTo9Wy4xXIfe@ep-cold-voice-a10pkji7-pooler.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require?sslmode=require",
})

pool.connect(function(err) {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

app.post('/signup', (req, res) => {
  console.log(req.body);
  const checkSql = 'SELECT * FROM users WHERE name = $1 OR email = $2'; // Check both name and email
  pool.query(checkSql, [req.body.name, req.body.email], (err, data) => { // Pass both name and email
      if (err) {
          console.error('Error executing query: ' + err.stack);
          return res.json({ field: 'general', error: 'An error occurred while processing your request.' });
      }
      if (data.rows.length > 0) { // Use data.rows.length to check if a user was returned
          const existingUser = data.rows[0];
          if (existingUser.email === req.body.email) {
              return res.json({ field: 'email', error: 'Email already has an account.' });
          } else {
              return res.json({ field: 'name', error: 'Username is already taken.' });
          }
      } else {
          const sql = "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3, 'user')";
          const values = [
              req.body.name,
              req.body.email,
              req.body.password
          ]
          pool.query(sql, values, (err, data) => {
              if (err) {
                  console.error('Error executing query: ' + err.stack);
                  return res.json({ field: 'general', error: 'An error occurred while creating your account.' });
              }
              console.log('Query executed successfully, data: ', data); 
              return res.json({ field: 'general', error: 'Signup Success.' });
          });
      }
  });
});

app.post('/login', (req, res) => {
  const email = req.body.email[0];
  const password = req.body.password[0];
    const sql = 'SELECT * FROM users WHERE email = $1 AND password = $2';
    pool.query(sql, [email, password], (err, data) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            return res.json("Error");
        }
        console.log('Data:', data.rows)
        if (data.rows.length > 0) {
          const loginSql = 'INSERT INTO login (email, password) VALUES ($1, $2)';
          pool.query(loginSql, [req.body.email, req.body.password], (loginErr, loginData) => {
              if (loginErr) {
                  console.error('Error executing query: ' + loginErr.stack);
                  return res.json("Error");
              }
              return res.json({ message: "Login Success", role: data.rows[0].role, userId: data.rows[0].name });
          });
      } else {
          return res.json("Login Failed");
      }
  })
})


// server side get reviews
router.get("/reviews", (req, res) => {
  let sql = `SELECT * FROM reviews WHERE toiletName = $1`;
  pool.query(sql, [req.query.toiletName], (err, data) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          return res.json("Error");
      } else {
          res.send(data.rows);
      }
  })
})

// server side add review
app.post("/reviews", (req, res) => {
  console.log(req.body);
  const toiletName = req.body.toiletName;
  const rating = req.body.rating;
  const comments = req.body.comments;
  const email = req.body.email ? req.body.email[0] : null;
  const sql = "INSERT INTO reviews (toiletName, rating, comments, useremail, created_at) VALUES ($1, $2, $3, $4, DEFAULT)";
  pool.query(sql, [toiletName, rating, comments, email], (err, data) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          return res.json("Error");
      }

      const insertCommentsSql = "INSERT INTO comments (toiletName, comments) VALUES ($1, $2)";
      pool.query(insertCommentsSql, [req.body.toiletName, req.body.comments], (insertErr, insertData) => {
          if (insertErr) {
              console.error('Error executing query: ' + insertErr.stack);
              return res.json("Error");
          }

          const updateQuery = `
              UPDATE toiletdata
              SET rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE toiletName = $1)
              WHERE toiletname = $2
          `;
          pool.query(updateQuery, [req.body.toiletName, req.body.toiletName], (updateErr, updateData) => {
              if (updateErr) {
                  console.error('Error executing query: ' + updateErr.stack);
                  return res.json("Error");
              }

              const updateCommentsSql = `
                  UPDATE toiletdata
                  SET comment = COALESCE(
                      (
                          SELECT comments
                          FROM reviews
                          WHERE id = (
                              SELECT MAX(id)
                              FROM reviews
                              WHERE toiletName = toiletdata.toiletname
                          )
                      ), 'No reviews yet'
                  )
                  WHERE toiletname = $1
              `;
              pool.query(updateCommentsSql, [req.body.toiletName], (err, data) => {
                  if (err) {
                      console.error('Error executing query: ' + err.stack);
                      return res.json("Error");
                  }
                  return res.json("Review Submitted, Average Rating and Comment Updated");
              });
          });
      });
  });
});

// server side delete review
router.delete("/reviews/:id", (req, res) => {
  let sql = "DELETE FROM reviews WHERE id = $1";
  pool.query(sql, [req.params.id], (err, data) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          return res.json("Error");
      }
      console.log('Query executed successfully, data: ', data); 
      return res.json("Review Deleted");
  });
})

app.get('/toiletdata', (req, res) => {
  const query = `SELECT toiletname, popUp, rating, latitude, longitude, bidet, shower, wheelchair FROM toiletdata`;
  pool.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    } else {
      console.log(results.rows);
      res.json(results.rows);
    }
  });
});

app.get('/updateRatings', (req, res) => {
  const query = `
      SELECT toiletName, ROUND(COALESCE(AVG(rating), 0), 1) as average_rating
      FROM reviews
      GROUP BY toiletName
  `;
  pool.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    } else {
      // Update average_rating in toiletdata table
      results.rows.forEach(result => {
        const updateQuery = `
          UPDATE toiletdata
          SET rating = $1
          WHERE toiletname = $2
        `;
        pool.query(updateQuery, [result.average_rating, result.toiletName], (err, updateResult) => {
          if (err) {
            console.error(err);
          }
        });
      });

      return res.json('Ratings updated');
    }
  });
});

// Get comments for a specific toilet
app.get("/comments/:toiletName", (req, res) => {
  const { toiletName } = req.params;
  const sql = "SELECT comments, created_at FROM comments WHERE toiletName = $1 ORDER BY id DESC";
  pool.query(sql, [toiletName], (err, data) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      return res.json("Error");
    }

    // Process the data to return an array of comments
    const comments = data.rows
      .filter(comment => comment.comments && comment.comments.trim() !== '') // filter out blank comments
      .map(comment => comment);
    return res.json(comments);
  });
});

app.post('/reports', (req, res) => {
  const { toiletName, comments } = req.body;

  const query = 'INSERT INTO reports (toiletname, details, useremail, status) VALUES ($1, $2, $3, $4)';
  const values = [toiletName, comments, req.user?.email, 'unsolved']; // Use req.user?.email directly

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while inserting the report' });
    } else {
      return res.status(200).json({ message: 'Report inserted successfully' });
    }
  });
});

app.get('/reports', (req, res) => {
  const sql = 'SELECT idcolumn, toiletname, details, status FROM reports';
  pool.query(sql, (err, data) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      return res.status(500).json({ error: 'An error occurred while fetching the reports' });
    }
    return res.json(data.rows);
  });
});

app.put('/reports/:id', (req, res) => {
  const { newStatus } = req.body;
  const { id } = req.params;

  const query = 'UPDATE reports SET status = $1 WHERE idcolumn = $2';
  const values = [newStatus, id];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while updating the status' });
    } else if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No report found with the given id' });
    } else {
      return res.status(200).json({ message: 'Status updated successfully' });
    }
  });
});

app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;

  pool.query('SELECT name, email FROM users WHERE name = $1', [userId], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows[0]);
  });
});

module.exports = app;

