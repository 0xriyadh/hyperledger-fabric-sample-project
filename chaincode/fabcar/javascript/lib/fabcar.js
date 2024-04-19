/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

class FabCar extends Contract {
    async initLedger(ctx) {
        console.info("============= START : Initialize Ledger ===========");
        const cars = [
            {
                color: "blue",
                make: "Toyota",
                model: "Prius",
                owner: "Tomoko",
            },
            {
                color: "red",
                make: "Ford",
                model: "Mustang",
                owner: "Brad",
            },
            {
                color: "green",
                make: "Hyundai",
                model: "Tucson",
                owner: "Jin Soo",
            },
            {
                color: "yellow",
                make: "Volkswagen",
                model: "Passat",
                owner: "Max",
            },
            {
                color: "black",
                make: "Tesla",
                model: "S",
                owner: "Adriana",
            },
            {
                color: "purple",
                make: "Peugeot",
                model: "205",
                owner: "Michel",
            },
            {
                color: "white",
                make: "Chery",
                model: "S22L",
                owner: "Aarav",
            },
            {
                color: "violet",
                make: "Fiat",
                model: "Punto",
                owner: "Pari",
            },
            {
                color: "indigo",
                make: "Tata",
                model: "Nano",
                owner: "Valeria",
            },
            {
                color: "brown",
                make: "Holden",
                model: "Barina",
                owner: "Shotaro",
            },
        ];

        for (let i = 0; i < cars.length; i++) {
            cars[i].docType = "car";
            await ctx.stub.putState(
                "CAR" + i,
                Buffer.from(JSON.stringify(cars[i]))
            );
            console.info("Added <--> ", cars[i]);
        }

        const companies = [
            // {
            //     color: "blue",
            //     make: "Toyota",
            //     model: "Prius",
            //     owner: "Tomoko",
            // },
            {
                name: "BRAC",
                companyType: "ngo",
                cashOutFlow: 0,
                cashInFlow: 0,
                employeeCount: 7000,
                countryOfOrigin: "Bangladesh",
                companyReputation: "good",
            },
            {
                name: "Bashundhara Group",
                companyType: "private",
                cashOutFlow: 0,
                cashInFlow: 0,
                employeeCount: 12000,
                countryOfOrigin: "Bangladesh",
                companyReputation: "good",
            },
            {
                name: "PRAN RFL Group",
                companyType: "public",
                cashOutFlow: 0,
                cashInFlow: 0,
                employeeCount: 8000,
                countryOfOrigin: "Bangladesh",
                companyReputation: "good",
            },
        ];

        for (let i = 0; i < companies.length; i++) {
            companies[i].docType = "company";
            await ctx.stub.putState(
                "COM " + i,
                Buffer.from(JSON.stringify(companies[i]))
            );
            console.info("Added <--> ", companies[i]);
        }
        console.info("============= END : Initialize Ledger ===========");
    }

    async queryCar(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async createCar(ctx, carNumber, make, model, color, owner) {
        console.info("============= START : Create Car ===========");

        const car = {
            color,
            docType: "car",
            make,
            model,
            owner,
        };

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info("============= END : Create Car ===========");
    }

    async createCompany(
        ctx,
        companyId,
        name,
        companyType,
        cashOutFlow,
        cashInFlow,
        employeeCount,
        countryOfOrigin,
        companyReputation
    ) {
        console.info("============= START : Create Company ===========");

        const company = {
            name,
            docType: "company",
            companyType,
            cashOutFlow,
            cashInFlow,
            employeeCount,
            countryOfOrigin,
            companyReputation,
        };

        await ctx.stub.putState(
            companyId,
            Buffer.from(JSON.stringify(company))
        );
        console.info("============= END : Create Company ===========");
    }

    async queryAllCars(ctx) {
        const startKey = "";
        const endKey = "";
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(
            startKey,
            endKey
        )) {
            const strValue = Buffer.from(value).toString("utf8");
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllCompanies(ctx) {
        const startKey = "";
        const endKey = "";
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(
            startKey,
            endKey
        )) {
            const strValue = Buffer.from(value).toString("utf8");
            let record;
            try {
                record = JSON.parse(strValue);
                // Check if the docType is 'company'
                if (record.docType !== "company") {
                    continue;
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeCarOwner(ctx, carNumber, newOwner) {
        console.info("============= START : changeCarOwner ===========");

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info("============= END : changeCarOwner ===========");
    }
}

module.exports = FabCar;
