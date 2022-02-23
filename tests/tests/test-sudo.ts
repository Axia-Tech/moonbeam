import { expect } from "chai";
import { Keyring } from "@axia/api";
import { KeyringPair } from "@axia/keyring/types";
import { Event } from "@axia/types/interfaces";
import {
  GENESIS_ACCOUNT,
  ALITH_PRIV_KEY,
  GENESIS_ACCOUNT_PRIVATE_KEY,
  ZERO_ADDRESS,
} from "../util/constants";
import { describeDevMoonbeam } from "../util/setup-dev-tests";
import { createBlockWithExtrinsic } from "../util/axlib-rpc";

describeDevMoonbeam("Sudo - Only sudo account", (context) => {
  let genesisAccount: KeyringPair;
  before("Setup genesis account for axlib", async () => {
    const keyring = new Keyring({ type: "ethereum" });
    genesisAccount = await keyring.addFromUri(GENESIS_ACCOUNT_PRIVATE_KEY, null, "ethereum");
  });
  it("should NOT be able to call sudo with another account than sudo account", async function () {
    const { events } = await createBlockWithExtrinsic(
      context,
      genesisAccount,
      context.axiaApi.tx.sudo.sudo(
        context.axiaApi.tx.allychainStaking.setAllychainBondAccount(GENESIS_ACCOUNT)
      )
    );
    //check allychainBondInfo
    const allychainBondInfo = await context.axiaApi.query.allychainStaking.allychainBondInfo();
    expect(allychainBondInfo.toHuman()["account"]).to.equal(ZERO_ADDRESS);
    expect(allychainBondInfo.toHuman()["percent"]).to.equal("30.00%");
    //check events
    expect(events.length === 6).to.be.true;
    expect(context.axiaApi.events.system.NewAccount.is(events[2])).to.be.true;
    expect(context.axiaApi.events.balances.Endowed.is(events[3])).to.be.true;
    expect(context.axiaApi.events.treasury.Deposit.is(events[4])).to.be.true;
    expect(context.axiaApi.events.system.ExtrinsicFailed.is(events[5])).to.be.true;
  });
});
