const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3000;

const connection = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "password",
  database: "airline_delay_analysis",
});

app.use(cors());
app.use(express.json());

app.get("/countAllAirports", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS count FROM Airport",
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      } else {
        const count = results[0].count; // Extract the count from the query results
        const responseObject = { count: count }; // Create an object with count property
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Access-Control-Allow-Headers"
        );
        res.status(200).json(results);
      }
    }
  );
});

app.get("/airports", (req, res) => {
  const origin = req.query.origin;
  const dest = req.query.dest;

  if (!origin || !dest) {
    res.status(400).send("Missing origin or dest parameter");
  } else {
    connection.query(
      `SELECT * FROM Airport WHERE origin='${origin}' AND dest='${dest}'`,
      function (error, results, fields) {
        if (error) {
          console.error(error);
          res.status(500).send("Internal Server Error");
        } else {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE"
          );
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Access-Control-Allow-Headers"
          );
          res.status(200).json(results);
        }
      }
    );
  }
});

app.get("/carriers", (req, res) => {
  const searchTerm = req.query.opCarrier;

  if (!searchTerm) {
    res.status(400).send("Missing search term");
  } else {
    connection.query(
      `SELECT * FROM Carrier WHERE opCarrier LIKE '%${searchTerm}%'`,
      function (error, results, fields) {
        if (error) {
          console.error(error);
          res.status(500).send("Internal Server Error");
        } else {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE"
          );
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Access-Control-Allow-Headers"
          );
          res.status(200).json(results);
        }
      }
    );
  }
});

app.get("/flightsID", (req, res) => {
  const flightID = req.query.flightID;
  if (!flightID) {
    res.status(400).send("Missing flightID parameter");
  } else {
    connection.query(
      `SELECT flDate, carrierID, opCarrierFlNum, airportID, crsDepTime, depTime, taxiOut, wheelsOff, wheelsOn, taxiIn, crsArrTime, arrTime, cancelled, cancellationCode, diverted, crsElapsedTime, actualElapsedTime, airTime, distance FROM Flight WHERE flightID=${flightID}`,
      function (error, results, fields) {
        if (error) {
          console.error(error);
          res.status(500).send("Internal Server Error");
        } else if (results.length === 0) {
          res.status(404).send("Flight not found");
        } else {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE"
          );
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Access-Control-Allow-Headers"
          );
          res.status(200).json(results[0]);
        }
      }
    );
  }
});

app.get("/flightsinfo", (req, res) => {
  const queryParams = req.query;
  const flDate = queryParams.flDate;
  const carrierID = queryParams.carrierID;
  const opCarrierFlNum = queryParams.opCarrierFlNum;
  const airportID = queryParams.airportID;

  let query = "SELECT * FROM Flight WHERE ";
  let queryConditions = [];

  if (flDate) {
    queryConditions.push(`flDate = '${flDate}'`);
  }

  if (carrierID) {
    queryConditions.push(`carrierID = ${carrierID}`);
  }

  if (opCarrierFlNum) {
    queryConditions.push(`opCarrierFlNum = ${opCarrierFlNum}`);
  }

  if (airportID) {
    queryConditions.push(`airportID = ${airportID}`);
  }

  if (queryConditions.length === 0) {
    res.status(400).send("Missing search parameters");
  } else {
    query += queryConditions.join(" AND ");

    connection.query(query, function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      } else if (results.length === 0) {
        res.status(404).send("No flights found");
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Access-Control-Allow-Headers"
        );
        res.status(200).json(results);
      }
    });
  }
});

app.delete("/delete", (req, res) => {
  const flightID = req.query.flightID;
  if (!flightID) {
    res.status(400).send("Missing flight ID parameter");
  } else {
    connection.query(
      `DELETE FROM Flight WHERE flightID=${flightID}`,
      function (error, results, fields) {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
        } else if (results.affectedRows === 0) {
          res.status(404).send("Flight not found");
        } else {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE"
          );
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Access-Control-Allow-Headers"
          );
          res.status(200).json({ message: "Flight deleted successfully" });
        }
      }
    );
  }
});

app.put("/edit", (req, res) => {
  const flightID = req.query.flightID; // change `params` to `query`
  const flightData = req.body;

  const query = `UPDATE Flight SET flDate = ?, carrierID = ?, airportID = ?, depTime = ?, arrTime = ? WHERE flightID = ?`;
  const values = [
    flightData.flDate,
    flightData.carrierID,
    flightData.airportID,
    flightData.depTime,
    flightData.arrTime,
    flightID,
  ];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    } else if (results.affectedRows === 0) {
      res.status(404).send(`Flight ${flightID} not found`);
    } else {
      res.status(200).send(`Flight ${flightID} updated successfully`);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

connection.connect(function (error) {
  if (error) {
    console.error(error);
    process.exit(1);
  } else {
    console.log("Connected to database");
  }
});

module.exports = app;
