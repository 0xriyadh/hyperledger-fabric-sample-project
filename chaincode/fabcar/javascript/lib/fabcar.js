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
            {
                name: "BRAC",
                companyType: "ngo",
                cashOutFlow: 0,
                cashInFlow: 0,
                employeeCount: 7000,
                countryOfOrigin: "Bangladesh",
                companyReputation: "good",
                admins: ["283723600812", "381397466823", "594012940575"],
            },
            {
                name: "Bashundhara Group",
                companyType: "private",
                cashOutFlow: 0,
                cashInFlow: 0,
                employeeCount: 12000,
                countryOfOrigin: "Bangladesh",
                companyReputation: "good",
                admins: ["055548014182", "879391587015", "996866466160"],
            },
            {
                name: "PRAN RFL Group",
                companyType: "public",
                cashOutFlow: 0,
                cashInFlow: 0,
                employeeCount: 8000,
                countryOfOrigin: "Bangladesh",
                companyReputation: "good",
                admins: ["436240574770", "412680028559", "772666348195"],
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
        companyReputation,
        admins // new parameter
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
            admins: JSON.parse(admins), // parse the admins string into an array
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

        // Check if the company is banned
        if (company.companyReputation === "banned") {
            throw new Error(
                `Company with ID ${companyId} is banned and cannot be updated`
            );
        }

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

    async updateCashOutFlowAndReputation(
        ctx,
        companyId,
        newPredeterminedCashOutFlow,
        newCompanyReputation,
        adminNID
    ) {
        console.info(
            "============= START : updateCashOutFlowAndReputation ==========="
        );

        const companyAsBytes = await ctx.stub.getState(companyId); // get the company from chaincode state
        if (!companyAsBytes || companyAsBytes.length === 0) {
            throw new Error(`${companyId} does not exist`);
        }

        const company = JSON.parse(companyAsBytes.toString());

        // Check if the admin is authorized to update
        if (!company.admins.includes(adminNID)) {
            throw new Error(
                `Admin with NID ${adminNID} is not authorized to update this company`
            );
        }

        // Check if the company is banned
        if (company.companyReputation === "banned") {
            throw new Error(
                `Company with ID ${companyId} is banned and cannot be updated`
            );
        }

        company.predeterminedCashOutFlow = newPredeterminedCashOutFlow;
        company.companyReputation = newCompanyReputation;

        await ctx.stub.putState(
            companyId,
            Buffer.from(JSON.stringify(company))
        );
        console.info(
            "============= END : updateCashOutFlowAndReputation ==========="
        );
    }

    async updateCompanyFinancials(
        ctx,
        companyId,
        newCashInFlow,
        newCashOutFlow,
        adminNID
    ) {
        console.info(
            "============= START : updateCompanyFinancials ==========="
        );

        const companyAsBytes = await ctx.stub.getState(companyId); // get the company from chaincode state
        if (!companyAsBytes || companyAsBytes.length === 0) {
            throw new Error(`${companyId} does not exist`);
        }

        const company = JSON.parse(companyAsBytes.toString());

        // Check if the admin is authorized to update
        if (!company.admins.includes(adminNID)) {
            throw new Error(
                `Admin with NID ${adminNID} is not authorized to update this company`
            );
        }

        // Check if the company is banned
        if (company.companyReputation === "banned") {
            throw new Error(
                `Company with ID ${companyId} is banned and cannot be updated`
            );
        }

        // Check if the cash outflow is more than the predetermined amount
        if (
            company.companyReputation === "poor" &&
            newCashOutFlow > company.predeterminedCashOutFlow
        ) {
            throw new Error(
                `Cash outflow cannot be more than the predetermined amount for companies with poor reputation`
            );
        }

        company.cashInFlow = newCashInFlow;
        company.cashOutFlow = newCashOutFlow;

        await ctx.stub.putState(
            companyId,
            Buffer.from(JSON.stringify(company))
        );
        console.info("============= END : updateCompanyFinancials ===========");
    }
}

module.exports = FabCar;
