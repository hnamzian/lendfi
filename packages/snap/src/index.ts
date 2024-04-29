import type { OnRpcRequestHandler, OnCronjobHandler } from '@metamask/snaps-sdk';
import { panel, text, heading } from '@metamask/snaps-sdk';

/**
 * Fetches the gas price with ethereum.request.
 */
async function getLogs(contractAddress: string, fromBlock: string) {
  if (!fromBlock) {
    fromBlock = "0x0"
  }
  const logs = await ethereum.request({ 
    method: 'eth_getLogs',
    params:[{
      // "address": contractAddress, 
      // "topics": [
      //   "0x0e0de8699776d996b4400d234e59769d4de22491b9ad15e11d4f6f2fe9f23fa2",
      //   "0x0025a2d6ca1b3da40a46ecc2c7ecbddb416fe7180003a0155b7e7d782d895f21",
      //   "0xb2cca1719ad611d325136b9c9a4357f412d33694d93c60d4c1b6e922d524cf59"
      // ], 
      "fromBlock": fromBlock, 
      "toBlock": "latest"
    }]
  });

  let aggregated = [""]
  for (let log of logs) {
    // aggregated.push(log)
    if (log.topics[0] == "0x0e0de8699776d996b4400d234e59769d4de22491b9ad15e11d4f6f2fe9f23fa2") {
      aggregated.push("LoanProposed, LendFi Successfully Submitted a new Loan Request, Get Ready")
    }
    else if (log.topics[0] == "0x0025a2d6ca1b3da40a46ecc2c7ecbddb416fe7180003a0155b7e7d782d895f21") {
      aggregated.push("LoanApproved, Hey, LendFi Successfully Submitted a new Loan Proposal, Complete the Process ASAP!")
    }
    else if (log.topics[0] == "0xb2cca1719ad611d325136b9c9a4357f412d33694d93c60d4c1b6e922d524cf59") {
      aggregated.push("LoanCreated, Congratulations, You have received you Loan Successfully!")
    }
  }

  return [aggregated, logs[logs.length-1].blockNumber]
}

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  let state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as { blockNumber: string } | null;

  if (!state) {
    state = { blockNumber: "0x0" };
    // initialize state if empty and set default data
    await snap.request({
      method: 'snap_manageState',
      params: { operation: 'update', newState: state },
    });
  }

  let logs, blockNumber = state.blockNumber
  switch (request.method) {
    case "hello":
      [logs, blockNumber] = await getLogs("0x8583b15C573C39c84df12b7dd595E4a305074526", blockNumber)

      state = { blockNumber: hexToNumberAndAddOne(blockNumber) };
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: state },
      });

      if (logs.length > 0) {
        let texts: text[] = []
        for (let log of logs) {
          texts.push(text(log))
        }
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            content: panel(
              [text(blockNumber), ...texts]
            ),
          },
        });
      }
      return;
    default:
      throw new Error("Method not found.");
  }
};

function hexToNumberAndAddOne(hexStr) {
  // Remove the "0x" prefix from the hexadecimal string if it exists
  if (hexStr.startsWith("0x")) {
      hexStr = hexStr.slice(2);
  }

  // Convert the hexadecimal string to a number
  let num = parseInt(hexStr, 16);

  // Add 1 to the number
  num += 1;

  // Convert the number back to a hexadecimal string
  let newHexStr = num.toString(16);

  // Return the hexadecimal string with the "0x" prefix
  return "0x" + newHexStr;
}