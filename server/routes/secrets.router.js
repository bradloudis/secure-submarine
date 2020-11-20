const express = require('express');
const pool = require('../modules/pool');
const {
  rejectUnauthenticated,
} = require('../modules/authentication-middleware');
const router = express.Router();

router.get('/', rejectUnauthenticated, (req, res) => {
  console.log('req.user:', req.user);
  const queryUserRole = `SELECT * FROM "user" WHERE id=$1`;
  // GET route code here

  // Sarah's query idea...
  // SELECT *
  // FROM "user"
  // JOIN "secret" ON "user".clearance_level > "secret".secrecy_level
  // WHERE "user".clearance_level >= "secret".secrecy_level
  // ORDER BY username ASC;

  pool
    .query(queryUserRole, [req.user.id])
    .then((response) => {
      console.log('response', response);
      const clearanceLevel = response.rows[0].clearance_level;

      const queryText = `SELECT *
      FROM "secret"
      WHERE "secret".secrecy_level < $1
      ORDER BY id ASC;`;

      pool
        .query(queryText, [clearanceLevel])
        .then((responseSecret) => {
          console.log('responseSecret', responseSecret);
          res.send(responseSecret.rows);
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
