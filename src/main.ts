import axios from "axios";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

// tslint:disable-next-line:no-var-requires
const beautify = require("beautify");

// tslint:disable-next-line:no-var-requires
const { toChecksumAddress } = require("ethereum-checksum-address");

// tslint:disable-next-line:no-var-requires
const prompt = require("prompt");

function prefix0X(key: string): string {
    if (key.substring(0, 2) !== "0x") return `0x${key}`;
    else return key;
}
interface IKeyFile {
    path: string;
    name: string;
}
interface IValidatorInfo {
    network: string;
    keyIndex: number;
    validatorKey: string;
    balance: string;
    credentials: string;
    validatorIndex: number;
    withdrawalAddress: string;
}

interface IGenerateValidatorInfoOption {
    network: string;
    validatorKeysPath: string;
    withdrawalAddress: string;
}

interface IGenerateBLSExecutionOption {
    mnemonic: string;
}

interface IOption {
    network: string;
    validatorKeysPath: string;
    withdrawalAddress: string;
    mnemonic: string;
}

async function getKeyFiles(keyPath: string): Promise<IKeyFile[]> {
    return new Promise<IKeyFile[]>((resolve, reject) => {
        const res: IKeyFile[] = [];
        // tslint:disable-next-line:only-arrow-functions
        fs.readdir(keyPath, { withFileTypes: true }, async function (error, fileList) {
            for (const file of fileList) {
                if (file.isDirectory()) {
                    const subKeys = await getKeyFiles(path.resolve(keyPath, file.name));
                    for (const subFile of subKeys) {
                        if (res.find((m) => m.name === subFile.name) === undefined) {
                            res.push(subFile);
                        }
                    }
                } else if (file.isFile()) {
                    if (file.name.indexOf("keystore") === 0) {
                        if (res.find((m) => m.name === file.name) === undefined) {
                            res.push({
                                path: keyPath,
                                name: file.name,
                            });
                        }
                    }
                }
            }
            resolve(res);
        });
    });
}

async function getCommand(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const schema = {
            properties: {
                command: {
                    description: "1: Generate Validator's Info. 2: Generate BLS to execution change",
                    pattern: /^[1-2]/,
                    message: "Command must be only 1 or 2",
                    required: true,
                },
            },
        };
        prompt.start();
        prompt.get(schema, (err: any, result: any) => {
            if (err) reject(err);
            resolve(Number(result.command));
        });
    });
}

async function main() {
    const command = await getCommand();

    if (command === 1) {
        await generateValidatorInfo();
    } else {
        await generateBLSExecution();
    }
}

async function getGenerateValidatorInfoOption(): Promise<IGenerateValidatorInfoOption> {
    return new Promise<IGenerateValidatorInfoOption>((resolve, reject) => {
        const schema = {
            properties: {
                network: {
                    description: "Enter the network (mainnet, testnet)",
                    pattern: /^[a-zA-Z\s\-]+$/,
                    message: "Name must be only letters, spaces, or dashes",
                    required: true,
                },
                validatorKeysPath: {
                    description: "Enter the validator keys path (default is 'validator_keys')",
                },
                withdrawalAddress: {
                    description: "Enter the address to withdraw",
                    pattern: /^(0x)[0-9a-f]{40}$/i,
                    message: "WithdrawalAddress must be only BOA Address(0x...)",
                    required: true,
                },
            },
        };
        prompt.start();
        prompt.get(schema, (err: any, result: any) => {
            if (err) reject(err);
            const validatorKeysPath =
                result.validatorKeysPath.trim() === "" ? "validator_keys" : result.validatorKeysPath.trim();
            resolve({
                network: result.network,
                validatorKeysPath,
                withdrawalAddress: toChecksumAddress(prefix0X(result.withdrawalAddress)),
            });
        });
    });
}

async function generateValidatorInfo() {
    const pwd = process.cwd();
    const option = await getGenerateValidatorInfoOption();

    let rpc = "";
    if (option.network === "mainnet") {
        rpc = "sync.mainnet.bosagora.org";
    } else if (option.network === "testnet") {
        rpc = "sync.testnet.bosagora.org";
    } else {
        console.log(`network is not available`);
        process.abort();
    }
    const validatorKeysPath = `${pwd}/data/${option.validatorKeysPath}`;
    const result: IValidatorInfo[] = [];
    const client = axios.create();
    const fileList: IKeyFile[] = await getKeyFiles(validatorKeysPath);
    for (const file of fileList) {
        const s = file.name.split("_");
        const fullFileName = path.resolve(file.path, file.name);
        const keyData = JSON.parse(fs.readFileSync(fullFileName, "utf-8"));
        const keyIndex = Number(s[3]);
        const validatorKey = keyData.pubkey;
        try {
            const res = await client.get(
                `https://${rpc}/eth/v1/beacon/states/head/validators/${prefix0X(validatorKey)}`
            );

            const balance = res.data.data.balance;
            const credentials = res.data.data.validator.withdrawal_credentials.replace("0x", "");
            const validatorIndex = Number(res.data.data.index);
            if (credentials.substring(0, 2) !== "01") {
                console.log(
                    `Key Index : ${keyIndex}; Validator Index : ${validatorIndex}; Credentials : ${credentials}`
                );
                result.push({
                    network: option.network,
                    keyIndex,
                    validatorKey,
                    balance,
                    credentials,
                    validatorIndex,
                    withdrawalAddress: option.withdrawalAddress,
                });
            }
        } catch (e) {
            //
        }
    }

    fs.writeFileSync(
        `${pwd}/data/validator_info.json`,
        beautify(JSON.stringify(result.sort((a, b) => a.keyIndex - b.keyIndex)), { format: "json" }),
        "utf-8"
    );

    console.log(`Validator Info was saved in "${pwd}/data/validator_info.json"`);
}

async function getGenerateBLSExecutionOption(): Promise<IGenerateBLSExecutionOption> {
    return new Promise<IGenerateBLSExecutionOption>((resolve, reject) => {
        const schema = {
            properties: {
                mnemonic: {
                    description: "Enter the mnemonic",
                    pattern: /^[a-zA-Z\s]+$/,
                    message: "Mnemonic must be only letters, spaces",
                    required: true,
                },
            },
        };
        prompt.start();
        prompt.get(schema, (err: any, result: any) => {
            if (err) reject(err);
            resolve({
                mnemonic: result.mnemonic,
            });
        });
    });
}

async function generateBLSExecution() {
    console.log("Please block the internet.");
    const pwd = process.cwd();
    const option = await getGenerateBLSExecutionOption();

    const validators: IValidatorInfo[] = JSON.parse(fs.readFileSync(`${pwd}/data/validator_info.json`, "utf-8"));

    const client = axios.create();
    for (const validator of validators) {
        const cmd: string = `${pwd}/bin/cmd.sh ${validator.network} ${validator.keyIndex} ${validator.validatorIndex} ${validator.credentials} ${validator.withdrawalAddress} "${option.mnemonic}"`;
        await execute(cmd);
        // console.log(cmd);
    }
}

async function execute(cmd: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err === null) {
                return resolve();
            } else {
                return reject(err);
            }
        });
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
