// Import necessary modules
const request = require("supertest");
const app = require("./server");

/* let server; // Declare a variable to store the Express server

beforeAll(() => {
  // Set up the resources, such as starting the Express server
  server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
});

afterAll(() => {
  // Clean up the resources, such as closing the Express server
  server.close();
}); */

// Write your tests here

describe("GET /countAllAirports", () => {
  it("should return 200 OK and a JSON object containing the count of all airports", async () => {
    const response = await request(app).get("/countAllAirports");

    expect(response.status).toEqual(200);
    expect(response.body[0]).toHaveProperty("count"); // Update to access the first object in the array
    expect(typeof response.body[0].count).toBe("number"); // Update to access the "count" property from the first object in the array
  });
});

describe("GET /carriers", () => {
  it("should return 200 OK and a JSON array of carriers matching the search term", async () => {
    const response = await request(app).get("/carriers?opCarrier=DL");

    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should return 400 Bad Request if the search term is missing", async () => {
    const response = await request(app).get("/carriers");

    expect(response.status).toEqual(400);
  });
});

describe("GET /airports", () => {
  it("should return 200 OK and a JSON array of airports matching the origin and dest parameters", async () => {
    const response = await request(app).get("/airports?origin=JFK&dest=LAX");

    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should return 400 Bad Request if the origin or dest parameter is missing", async () => {
    const response = await request(app).get("/airports?origin=JFK");

    expect(response.status).toEqual(400);
  });
});

describe("GET /flightsID", () => {
  it("should return 200 OK and a JSON object of flight information matching the flightID parameter", async () => {
    const response = await request(app).get("/flightsID?flightID=7");

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("flDate");
    expect(response.body).toHaveProperty("carrierID");
    expect(response.body).toHaveProperty("opCarrierFlNum");
    expect(response.body).toHaveProperty("airportID");
    expect(response.body).toHaveProperty("crsDepTime");
    expect(response.body).toHaveProperty("depTime");
    expect(response.body).toHaveProperty("taxiOut");
    expect(response.body).toHaveProperty("wheelsOff");
    expect(response.body).toHaveProperty("wheelsOn");
    expect(response.body).toHaveProperty("taxiIn");
    expect(response.body).toHaveProperty("crsArrTime");
    expect(response.body).toHaveProperty("arrTime");
    expect(response.body).toHaveProperty("cancelled");
    expect(response.body).toHaveProperty("cancellationCode");
    expect(response.body).toHaveProperty("diverted");
    expect(response.body).toHaveProperty("crsElapsedTime");
    expect(response.body).toHaveProperty("actualElapsedTime");
    expect(response.body).toHaveProperty("airTime");
    expect(response.body).toHaveProperty("distance");
  });

  it("should return 404 Not Found if the flightID parameter is missing or invalid", async () => {
    const response = await request(app).get("/flightsID");

    expect(response.status).toEqual(400);
  });
});

describe("GET /flightsinfo", () => {
  it("should return 200 OK and a JSON array of flights matching the search parameters", async () => {
    const response = await request(app).get(
      "/flightsinfo?flDate=2020-01-01&carrierID=1&opCarrierFlNum=5144.00000&airportID=3"
    );
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should return 400 Bad Request if the required search parameters are missing", async () => {
    const response = await request(app).get("/flightsinfo");
    expect(response.status).toEqual(400);
    expect(response.status).toEqual(400);
  });

  it("should return 404 Not Found if no flights match the search parameters", async () => {
    const response = await request(app).get(
      "/flightsinfo?flDate=2020-01-01&carrierID=1&opCarrierFlNum=5888.00000&airportID=1"
    );
    expect(response.status).toEqual(404);
  });
});

describe("DELETE /delete", () => {
  it("should return 200 OK and a JSON object with a success message if the flight is successfully deleted", async () => {
    const response = await request(app).delete("/delete?flightID=2");
    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual("Flight deleted successfully");
  });

  it("should return 400 Bad Request if the flightID parameter is missing", async () => {
    const response = await request(app).delete("/delete");
    expect(response.status).toEqual(400);
    expect(response.status).toEqual(400);
  });

  it("should return 404 Not Found if the flightID parameter is invalid", async () => {
    const response = await request(app).delete("/delete?flightID=1");
    expect(response.status).toEqual(404);
  });
});

describe("PUT /edit", () => {
  // Update flight test case
  it("should return 200 OK and a success message if the flight is successfully updated", async () => {
    const flightID = 5; // Set the flightID to be updated
    const flightData = {
      // Set the updated flight data
      flDate: "2022-04-01",
      carrierID: "3",
      airportID: "3",
      depTime: "42.00000",
      airTime: "75.00000",
    };

    const response = await request(app)
      .put(`/edit?flightID=${flightID}`) // Pass the flightID in the query string
      .send(flightData); // Send the updated flight data in the request body

    expect(response.status).toEqual(200);
    expect(response.text).toEqual(`Flight ${flightID} updated successfully`);
  });

  // Missing flightID test case
  it("should return 404 Bad Request if the flightID parameter is missing", async () => {
    const response = await request(app).put("/edit?flightID="); // Pass an empty flightID in the query string

    expect(response.status).toEqual(404);
  });

  it("should return 404 Not Found if the flightID parameter is invalid", async () => {
    const response = await request(app).put("/editflights?flightID=1").send({
      flDate: "2022-04-01",
      carrierID: "3",
      airportID: "3",
      depTime: "42.00000",
      airTime: "75.00000",
    });

    expect(response.status).toEqual(404);
  });
});
