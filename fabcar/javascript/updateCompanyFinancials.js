/* eslint-disable quotes */
"use strict";

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function main(params) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(
            __dirname,
            "..",
            "..",
            "test-network",
            "organizations",
            "peerOrganizations",
            "org1.example.com",
            "connection-org1.json"
        );
        let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get("appUser");
        if (!identity) {
            console.log(
                'An identity for the user "appUser" does not exist in the wallet'
            );
            console.log("Run the registerUser.js application before retrying");
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "appUser",
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("fabcar");

        // gathering payload data
        const companyId = params.companyId;
        const newCashInFlow = params.newCashInFlow;
        const newCashOutFlow = params.newCashOutFlow;
        const adminNID = params.adminNID;

        console.log("Updating company financials...");

        // Submit the specified transaction.
        // updateCompanyFinancials transaction - requires 4 arguments
        await contract.submitTransaction(
            "updateCompanyFinancials",
            `${companyId}`,
            `${newCashInFlow}`,
            `${newCashOutFlow}`,
            `${adminNID}`
        );
        console.log("Update Company Financials Transaction has been submitted");

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(
            `Failed to update company financials transaction: ${error}`
        );
        throw new Error(
            `Failed to update company financials transaction: ${error}`
        );
    }
}

module.exports = { main };
