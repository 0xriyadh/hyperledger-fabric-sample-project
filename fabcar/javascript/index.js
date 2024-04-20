/* eslint-disable quotes */

"use strict";

const express = require("express");
const cors = require("cors");
const query = require("./query");
const createCompany = require("./createCompany");
const updateCompany = require("./updateCompany");
const bodyParser = require("body-parser");
const updateCashOutFlowAndReputation = require("./updateCashOutFlowAndReputation");
const updateCompanyFinancials = require("./updateCompanyFinancials");

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
    const {
        key,
        name,
        companyType,
        cashOutFlow,
        cashInFlow,
        employeeCount,
        countryOfOrigin,
        companyReputation,
        admins,
    } = req.body;
    console.log(req.body);
    if (
        !key ||
        !name ||
        !companyType ||
        !cashOutFlow ||
        !cashInFlow ||
        !employeeCount ||
        !countryOfOrigin ||
        // !companyReputation ||
        !admins
    ) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    createCompany
        .main({
            key,
            name,
            companyType,
            cashOutFlow,
            cashInFlow,
            employeeCount,
            countryOfOrigin,
            companyReputation,
            admins,
        })
        .then((result) => {
            res.send({ message: "Created successfully" });
        })
        .catch((err) => {
            console.error({ err });
            res.status(500).send("FAILED TO LOAD DATA!");
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

// update cash outflow and reputation
app.post("/updateCashOutFlowAndReputation", function (req, res) {
    const {
        companyId,
        newPredeterminedCashOutFlow,
        newCompanyReputation,
        adminNID,
    } = req.body;

    if (
        !companyId ||
        !newCompanyReputation ||
        !adminNID ||
        (newCompanyReputation === "poor" && !newPredeterminedCashOutFlow)
    ) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    updateCashOutFlowAndReputation
        .main({
            companyId,
            newPredeterminedCashOutFlow,
            newCompanyReputation,
            adminNID,
        })
        .then((result) => {
            res.send({ message: "Updated successfully" });
        })
        .catch((err) => {
            console.error({ err });
            res.status(500).send("FAILED TO UPDATE DATA!");
        });
});

// update company financials
app.post("/updateCompanyFinancials", function (req, res) {
    const { companyId, newCashInFlow, newCashOutFlow, adminNID } = req.body;

    if (!companyId || !newCashInFlow || !newCashOutFlow || !adminNID) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    updateCompanyFinancials
        .main({
            companyId,
            newCashInFlow,
            newCashOutFlow,
            adminNID,
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
