/* eslint-disable quotes */

"use strict";

const express = require("express");
const cors = require("cors");
const query = require("./query");
const createCompany = require("./createCompany");
const updateCompany = require("./updateCompany");
const bodyParser = require("body-parser");

const app = express();

// To control CORSS-ORIGIN-RESOURCE-SHARING( CORS )
app.use(cors());
app.options("*", cors());

// To parse encoded data
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
    bodyParser.urlencoded({
        // to support URL-encoded bodies
        extended: true,
    })
);

// get all companies
app.get("/get-company", function (req, res) {
    query
        .main(req.query)
        .then((result) => {
            const parsedData = JSON.parse(result);
            console.log({ parsedData });
            res.send(parsedData);
        })
        .catch((err) => {
            console.error({ err });
            res.status(500).send("FAILED TO GET DATA!");
        });
});

// create a new company
app.post("/create", function (req, res) {
    createCompany
        .main(req.body)
        .then((result) => {
            res.send({ message: "Created successfully" });
        })
        .catch((err) => {
            console.error({ err });
            res.send("FAILED TO LOAD DATA!");
        });
});

// update company information
app.post("/update", function (req, res) {
    const {
        companyId,
        newName,
        newCompanyType,
        newEmployeeCount,
        newCountryOfOrigin,
    } = req.body;

    if (
        !companyId ||
        !newName ||
        !newCompanyType ||
        !newEmployeeCount ||
        !newCountryOfOrigin
    ) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    console.log("I am inside update company information");

    updateCompany
        .main({
            companyId,
            newName,
            newCompanyType,
            newEmployeeCount,
            newCountryOfOrigin,
        })
        .then((result) => {
            res.send({ message: "Updated successfully" });
        })
        .catch((err) => {
            console.error({ err });
            res.status(500).send("FAILED TO UPDATE DATA!");
        });
});

app.listen(3000, () => console.log("Server is running at port 3000"));
