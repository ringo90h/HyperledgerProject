'use strict';

const config = require('./config');
const { wrapError, marshalArgs } = require('./utils');
const { insuranceClient, isReady } = require('./setup');
const client = insuranceClient;
const uuidV4 = require('uuid/v4');
const network = require('./invoke');

const util = require('util');

module.exports.getContractTypes = async () => {
    if (!isReady()) {
        return;
    }
    try {
        const contractTypes = await query('contract_type_ls');
        return contractTypes;
    } catch (e) {
        throw wrapError(`Error getting contract types: ${e.message}`, e);
    }
};

module.exports.createContractType = async (contractType)=>{
    if (!isReady()) {
        return;
    }
    try {

        let ct = contractType.uuid ? contractType :
            Object.assign({ uuid: uuidV4() }, contractType);
        const successResult = await invoke('contract_type_create', ct);
        if (successResult) {
            throw new Error(successResult);
        }
        return ct.uuid;
    } catch (e) {
        throw wrapError(`Error creating contract type: ${e.message}`, e);
    }
};

module.exports.setActiveContractType = async (uuid, active) =>{
    if (!isReady()) {
        return;
    }
    try {
        const successResult = await invoke('contract_type_set_active', { uuid, active });
        if (successResult) {
            throw new Error(successResult);
        }
        return successResult;
    } catch (e) {
        throw wrapError(`Error setting active contract type: ${e.message}`, e);
    }
};

module.exports.getContracts = async (username) =>{
    if (!isReady()) {
        return;
    }
    try {
        if (typeof username !== 'string') {
            username = undefined;
        }
        const contracts = await query('contract_ls', { username });
        return contracts;
    } catch (e) {
        let errMessage;
        if (username) {
            errMessage = `Error getting contracts for user ${username}: ${e.message}`;
        } else {
            errMessage = `Error getting all contracts: ${e.message}`;
        }
        throw wrapError(errMessage, e);
    }
};

module.exports.getClaims = async (status) =>{
    if (!isReady()) {
        return;
    }
    try {
        if (typeof status !== 'string') {
            status = undefined;
        }
        const claims = await query('claim_ls', { status });
        return claims;
    } catch (e) {
        let errMessage;
        if (status) {
            errMessage = `Error getting claims with status ${status}: ${e.message}`;
        } else {
            errMessage = `Error getting all claims: ${e.message}`;
        }
        throw wrapError(errMessage, e);
    }
};

module.exports.fileClaim = async (claim) =>{
    if (!isReady()) {
        return;
    }
    try {
        console.log(`claim: ${util.inspect(claim)}`);

        const c = Object.assign({}, claim, { uuid: uuidV4() });

        console.log(`after assigning uuid in fileClaim, c: ${util.inspect(c)}`);

        const successResult = await invoke('claim_file', c);
        console.log(`successResult, after calling invoke claim_file from insurancePeer.js ${util.inspect(successResult)}`);
        if (successResult) {
            throw new Error(successResult);
        }
        return c.uuid;
    } catch (e) {
        throw wrapError(`Error filing a new claim: ${e.message}`, e);
    }
};

module.exports.processClaim = async (contractUuid, uuid, status, reimbursable) => {
    if (!isReady()) {
        return;
    }
    try {
        const successResult = await invoke('claim_process', { contractUuid, uuid, status, reimbursable });
        if (successResult) {
            throw new Error(successResult);
        }
        return successResult;
    } catch (e) {
        throw wrapError(`Error processing claim: ${e.message}`, e);
    }
};

module.exports.authenticateUser = async (username, password) => {
    if (!isReady()) {
        return;
    }
    try {
        let authenticated = await query('user_authenticate', { username, password });
        if (authenticated === undefined || authenticated === null) {
            throw new Error('Unknown error, invalid response!');
        }
        return authenticated;
    } catch (e) {
        throw wrapError(`Error authenticating user: ${e.message}`, e);
    }
};

module.exports.getUserInfo = async (username) =>{
    if (!isReady()) {
        return;
    }
    try {
        const user = await query('user_get_info', { username });
        return user;
    } catch (e) {
        throw wrapError(`Error getting user info: ${e.message}`, e);
    }
};

module.exports.getBlocks = async (noOfLastBlocks) =>{
    return client.getBlocks(noOfLastBlocks);
};


module.exports.on = client.on.bind(client);
module.exports.once = client.once.bind(client);
module.exports.addListener = client.addListener.bind(client);
module.exports.prependListener = client.prependListener.bind(client);
module.exports.removeListener = client.removeListener.bind(client);

//identity to use for submitting transactions to smart contract
const peerType = 'insuranceApp-admin';
let isQuery = false;

async function invoke(fcn, ...args) {

    isQuery = false;

    console.log(`args in insurancePeer invoke: ${util.inspect(...args)}`);
    console.log(`func in insurancePeer invoke: ${util.inspect(fcn)}`);

    if (config.isCloud) {
        await network.invokeCC(isQuery, peerType, fcn, ...args);
    }

    return client.invoke(
        config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}

async function query(fcn, ...args) {

    isQuery = true;
    console.log(`args in insurancePeer query: ${util.inspect(...args)}`);
    console.log(`func in insurancePeer query: ${util.inspect(fcn)}`);

    if (config.isCloud) {
        await network.invokeCC(isQuery, peerType, fcn, ...args);
    }

    return client.query(
        config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}