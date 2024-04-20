/* eslint-disable quotes */
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

    async queryCompany(ctx, query) {
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
                // Check if the company matches the search criteria
                if (
                    key === query ||
                    record.name === query ||
                    record.companyReputation === query
                ) {
                    allResults.push({ Key: key, Record: record });
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
        }
        if (allResults.length === 0) {
            throw new Error(`${query} does not exist`);
        }
        console.info(allResults);
        return JSON.stringify(allResults);
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

    async updateCompany(
        ctx,
        companyId,
        newName,
        newCompanyType,
        newEmployeeCount,
        newCountryOfOrigin
    ) {
        console.info("============= START : updateCompany ===========");

        const companyAsBytes = await ctx.stub.getState(companyId); // get the company from chaincode state
        if (!companyAsBytes || companyAsBytes.length === 0) {
            throw new Error(`${companyId} does not exist`);
        }

        const company = JSON.parse(companyAsBytes.toString());
        company.name = newName;
        company.companyType = newCompanyType;
        company.employeeCount = newEmployeeCount;
        company.countryOfOrigin = newCountryOfOrigin;

        await ctx.stub.putState(
            companyId,
            Buffer.from(JSON.stringify(company))
        );
        console.info("============= END : updateCompany ===========");
    }
}

module.exports = FabCar;
