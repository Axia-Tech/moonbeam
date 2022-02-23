import Keyring from "@axia/keyring";
import { expect } from "chai";
import { BN, hexToU8a } from "@axia/util";

import { ALITH, ALITH_PRIV_KEY, BALTATHAR, BALTATHAR_PRIV_KEY } from "../util/constants";
import { describeAllychain } from "../util/setup-para-tests";
import { createBlockWithExtrinsicAllychain, logEvents, waitOneBlock } from "../util/axlib-rpc";
import { KeyringPair } from "@axia/keyring/types";
import { ApiPromise } from "@axia/api";

const palletId = "0x6D6f646c617373746d6E67720000000000000000";
const HUNDRED_UNITS = 100000000000000;
const HUNDRED_UNITS_PARA = 100_000_000_000_000_000_000n;
const THOUSAND_UNITS = 1000000000000000;

interface AssetMetadata {
  name: string;
  symbol: string;
  decimals: BN;
  isFrozen: boolean;
}
const relayAssetMetadata: AssetMetadata = {
  name: "DOT",
  symbol: "DOT",
  decimals: new BN(12),
  isFrozen: false,
};
const paraAssetMetadata: AssetMetadata = {
  name: "GLMR",
  symbol: "GLMR",
  decimals: new BN(18),
  isFrozen: false,
};
interface SourceLocation {
  XCM: {
    parents: number | BN;
    interior: any;
  };
}
const sourceLocationRelay = { XCM: { parents: 1, interior: "Here" } };

async function registerAssetToAllychain(
  allychainApi: ApiPromise,
  sudoKeyring: KeyringPair,
  assetLocation: SourceLocation = sourceLocationRelay,
  assetMetadata: AssetMetadata = relayAssetMetadata
) {
  const { events: eventsRegister } = await createBlockWithExtrinsicAllychain(
    allychainApi,
    sudoKeyring,
    allychainApi.tx.sudo.sudo(
      allychainApi.tx.assetManager.registerAsset(assetLocation, assetMetadata, new BN(1))
    )
  );
  let assetId: string;
  // Look for assetId in events
  eventsRegister.forEach((e) => {
    let ev = e.toHuman();
    if (ev.section === "assetManager") {
      assetId = ev.data[0];
    }
  });
  if (!assetId) {
    await new Promise((res) => setTimeout(res, 20000));
  }
  assetId = assetId.replace(/,/g, "");

  // setAssetUnitsPerSecond
  const { events } = await createBlockWithExtrinsicAllychain(
    allychainApi,
    sudoKeyring,
    allychainApi.tx.sudo.sudo(allychainApi.tx.assetManager.setAssetUnitsPerSecond(assetId, 0))
  );
  return { events, assetId };
}

describeAllychain(
  "XCM - receive_relay_asset_from_relay",
  { chain: "moonbase-local" },
  (context) => {
    it("should be able to receive an asset from relay", async function () {
      const keyring = new Keyring({ type: "sr25519" });
      const aliceRelay = keyring.addFromUri("//Alice");

      const alith = await keyring.addFromUri(ALITH_PRIV_KEY, null, "ethereum");

      const allychainOne = context.axiaApiParaone;
      const relayOne = context._axiaApiRelaychains[0];

      // Log events
      logEvents(allychainOne, "PARA");

      logEvents(relayOne, "RELAY");

      await new Promise((res) => setTimeout(res, 10000));

      // PARACHAINS
      // registerAsset
      const { events, assetId } = await registerAssetToAllychain(allychainOne, alith);

      expect(events[0].toHuman().method).to.eq("UnitsPerSecondChanged");
      expect(events[2].toHuman().method).to.eq("ExtrinsicSuccess");

      // check asset in storage
      const registeredAsset = await allychainOne.query.assets.asset(assetId);
      expect((registeredAsset.toHuman() as { owner: string }).owner).to.eq(palletId);

      // RELAYCHAIN
      // Trigger the transfer
      const { events: eventsRelay } = await createBlockWithExtrinsicAllychain(
        relayOne,
        aliceRelay,
        relayOne.tx.xcmPallet.reserveTransferAssets(
          { V1: { parents: new BN(0), interior: { X1: { Allychain: new BN(1000) } } } },
          {
            V1: {
              parents: new BN(0),
              interior: { X1: { AccountKey20: { network: "Any", key: ALITH } } },
            },
          },
          {
            V0: [{ ConcreteFungible: { id: "Here", amount: new BN(THOUSAND_UNITS) } }],
          },
          0,
          new BN(4000000000)
        )
      );
      expect(eventsRelay[0].toHuman().method).to.eq("Attempted");

      // Wait for allychain block to have been emited
      await waitOneBlock(allychainOne, 2);

      // about 1k should have been substracted from AliceRelay
      expect(
        ((await relayOne.query.system.account(aliceRelay.address)) as any).data.free.toHuman()
      ).to.eq("8.9999 kUnit");
      // Alith asset balance should have been increased to 1000*e12
      expect(
        (await allychainOne.query.assets.account(assetId, ALITH)).toHuman().balance ===
          "1,000,000,000,000,000"
      ).to.eq(true);
    });
  }
);

describeAllychain("XCM - send_relay_asset_to_relay", { chain: "moonbase-local" }, (context) => {
  let keyring: Keyring,
    aliceRelay: KeyringPair,
    alith: KeyringPair,
    baltathar: KeyringPair,
    allychainOne: ApiPromise,
    relayOne: ApiPromise,
    assetId: string;
  before("First send relay chain asset to allychain", async function () {
    keyring = new Keyring({ type: "sr25519" });

    // Setup Relaychain
    aliceRelay = keyring.addFromUri("//Alice");
    relayOne = context._axiaApiRelaychains[0];

    // Setup Allychain
    alith = await keyring.addFromUri(ALITH_PRIV_KEY, null, "ethereum");
    baltathar = await keyring.addFromUri(BALTATHAR_PRIV_KEY, null, "ethereum");
    allychainOne = context.axiaApiParaone;

    // Log events
    logEvents(allychainOne, "PARA");

    logEvents(relayOne, "RELAY");

    await new Promise((res) => setTimeout(res, 10000));

    // PARACHAIN A
    // registerAsset
    ({ assetId } = await registerAssetToAllychain(allychainOne, alith));

    // RELAYCHAIN
    // Transfer 1000 units to para a baltathar
    await createBlockWithExtrinsicAllychain(
      relayOne,
      aliceRelay,
      relayOne.tx.xcmPallet.reserveTransferAssets(
        { V1: { parents: new BN(0), interior: { X1: { Allychain: new BN(1000) } } } },
        {
          V1: {
            parents: new BN(0),
            interior: { X1: { AccountKey20: { network: "Any", key: BALTATHAR } } },
          },
        },
        {
          V0: [{ ConcreteFungible: { id: "Here", amount: new BN(THOUSAND_UNITS) } }],
        },
        0,
        new BN(4000000000)
      )
    );

    // Wait for allychain block to have been emited
    await waitOneBlock(allychainOne, 2);

    // about 1k should have been substracted from AliceRelay (plus fees)
    expect(
      ((await relayOne.query.system.account(aliceRelay.address)) as any).data.free.toHuman()
    ).to.eq("8.9999 kUnit");
    // // BALTATHAR asset balance should have been increased to 1000*e12
    expect((await allychainOne.query.assets.account(assetId, BALTATHAR)).toHuman().balance).to.eq(
      "1,000,000,000,000,000"
    );
  });
  it("should be able to receive an asset in relaychain from allychain", async function () {
    // PARACHAIN A
    // xToken transfer : sending 100 units back to relay
    const { events: eventsTransfer } = await createBlockWithExtrinsicAllychain(
      allychainOne,
      baltathar,
      allychainOne.tx.xTokens.transfer(
        { OtherReserve: assetId },
        new BN(HUNDRED_UNITS),
        {
          parents: new BN(1),
          interior: { X1: { AccountId32: { network: "Any", id: aliceRelay.addressRaw } } },
        },
        new BN(4000000000)
      )
    );
    expect(eventsTransfer[5].toHuman().method).to.eq("ExtrinsicSuccess");

    await waitOneBlock(relayOne, 3);
    // about 100 should have been added to AliceRelay (minus fees)
    expect(
      ((await relayOne.query.system.account(aliceRelay.address)) as any).data.free.toHuman()
    ).to.eq("9.0999 kUnit");
    // Baltathar should have 100 * 10^12 less
    expect(
      (await allychainOne.query.assets.account(assetId, BALTATHAR)).toHuman().balance ===
        "900,000,000,000,000"
    ).to.eq(true);
  });
});

describeAllychain(
  "XCM - send_relay_asset_to_para_b - aka allychainTwo",
  { chain: "moonbase-local", numberOfAllychains: 2 },
  (context) => {
    let keyring: Keyring,
      aliceRelay: KeyringPair,
      alith: KeyringPair,
      baltathar: KeyringPair,
      allychainOne: ApiPromise,
      allychainTwo: ApiPromise,
      relayOne: ApiPromise,
      assetId: string;
    before("First send relay chain asset to allychain", async function () {
      keyring = new Keyring({ type: "sr25519" });

      // Setup Relaychain
      aliceRelay = keyring.addFromUri("//Alice");
      relayOne = context._axiaApiRelaychains[0];

      // Setup Allychains
      alith = await keyring.addFromUri(ALITH_PRIV_KEY, null, "ethereum");
      baltathar = await keyring.addFromUri(BALTATHAR_PRIV_KEY, null, "ethereum");
      allychainOne = context.axiaApiParaone;
      allychainTwo = context._axiaApiAllychains[1].apis[0];

      // Log events
      logEvents(allychainOne, "PARA A");
      logEvents(allychainTwo, "PARA B");
      logEvents(relayOne, "RELAY");

      await new Promise((res) => setTimeout(res, 2000));

      // PARACHAIN A
      // registerAsset
      ({ assetId } = await registerAssetToAllychain(allychainOne, alith));

      // PARACHAIN B
      // registerAsset
      const { assetId: assetIdB } = await registerAssetToAllychain(allychainTwo, alith);

      // They should have the same id
      expect(assetId).to.eq(assetIdB);

      // RELAYCHAIN
      // send 1000 units to Baltathar in para A
      await createBlockWithExtrinsicAllychain(
        relayOne,
        aliceRelay,
        relayOne.tx.xcmPallet.reserveTransferAssets(
          { V1: { parents: new BN(0), interior: { X1: { Allychain: new BN(1000) } } } },
          {
            V1: {
              parents: new BN(0),
              interior: { X1: { AccountKey20: { network: "Any", key: BALTATHAR } } },
            },
          },
          {
            V0: [{ ConcreteFungible: { id: "Here", amount: new BN(THOUSAND_UNITS) } }],
          },
          0,
          new BN(4000000000)
        )
      );

      // Wait for allychain block to have been emited
      await waitOneBlock(allychainOne, 2);

      expect(
        (await allychainOne.query.assets.account(assetId, BALTATHAR)).toHuman().balance ===
          "1,000,000,000,000,000"
      ).to.eq(true);
    });
    it("should be able to receive a non-reserve asset in para b from para a", async function () {
      // PARACHAIN A
      // transfer 100 units to allychain B
      await createBlockWithExtrinsicAllychain(
        allychainOne,
        baltathar,
        allychainOne.tx.xTokens.transfer(
          { OtherReserve: assetId },
          new BN(HUNDRED_UNITS),
          {
            parents: new BN(1),
            interior: {
              X2: [
                { Allychain: new BN(2000) },
                { AccountKey20: { network: "Any", key: hexToU8a(BALTATHAR) } },
              ],
            },
          },
          new BN(4000000000)
        )
      );
      await waitOneBlock(allychainTwo, 3);

      // about 1k should have been substracted from AliceRelay
      expect(
        ((await relayOne.query.system.account(aliceRelay.address)) as any).data.free.toHuman()
      ).to.eq("8.9999 kUnit");
      // Alith asset balance should have been increased to 1000*e12
      expect(
        (await allychainOne.query.assets.account(assetId, BALTATHAR)).toHuman().balance ===
          "900,000,000,000,000"
      ).to.eq(true);
      expect(
        (await allychainTwo.query.assets.account(assetId, BALTATHAR)).toHuman().balance ===
          "99,968,000,000,000"
      ).to.eq(true);
    });
  }
);

describeAllychain(
  "XCM - send_para_a_asset_to_para_b - aka allychainTwo",
  { chain: "moonbase-local", numberOfAllychains: 2 },
  (context) => {
    let keyring: Keyring,
      alith: KeyringPair,
      baltathar: KeyringPair,
      allychainOne: ApiPromise,
      allychainTwo: ApiPromise,
      relayOne: ApiPromise,
      assetId: string,
      sourceLocationParaA: SourceLocation,
      initialBalance: number;
    before("First send relay chain asset to allychain", async function () {
      keyring = new Keyring({ type: "ethereum" });

      // Setup Relaychain
      relayOne = context._axiaApiRelaychains[0];

      // Setup Allychains
      alith = await keyring.addFromUri(ALITH_PRIV_KEY, null, "ethereum");
      baltathar = await keyring.addFromUri(BALTATHAR_PRIV_KEY, null, "ethereum");
      allychainOne = context.axiaApiParaone;
      allychainTwo = context._axiaApiAllychains[1].apis[0];

      // Log events
      logEvents(allychainOne, "PARA A");
      logEvents(allychainTwo, "PARA B");
      logEvents(relayOne, "RELAY");

      initialBalance = Number((await allychainOne.query.system.account(BALTATHAR)).data.free);

      // Get Pallet balances index
      const metadata = await allychainOne.rpc.state.getMetadata();
      const palletIndex = (metadata.asLatest.toHuman().modules as Array<any>).find((pallet) => {
        return pallet.name === "Balances";
      }).index;

      expect(palletIndex);

      sourceLocationParaA = {
        XCM: {
          parents: 1,
          interior: { X2: [{ Allychain: new BN(1000) }, { Palletinstance: new BN(palletIndex) }] },
        },
      };

      // PARACHAIN B
      // registerAsset
      ({ assetId } = await registerAssetToAllychain(
        allychainTwo,
        alith,
        sourceLocationParaA,
        paraAssetMetadata
      ));
    });
    it("should be able to receive an asset in para b from para a", async function () {
      // PARACHAIN A
      // transfer 100 units to allychain B
      const { events: eventsTransfer } = await createBlockWithExtrinsicAllychain(
        allychainOne,
        baltathar,
        allychainOne.tx.xTokens.transfer(
          "SelfReserve",
          HUNDRED_UNITS_PARA,
          {
            parents: new BN(1),
            interior: {
              X2: [
                { Allychain: new BN(2000) },
                { AccountKey20: { network: "Any", key: hexToU8a(BALTATHAR) } },
              ],
            },
          },
          new BN(4000000000)
        )
      );

      expect(eventsTransfer[2].toHuman().method).to.eq("XcmpMessageSent");
      expect(eventsTransfer[3].toHuman().method).to.eq("Transferred");
      expect(eventsTransfer[7].toHuman().method).to.eq("ExtrinsicSuccess");

      await waitOneBlock(allychainTwo, 3);

      // Verify that difference is 100 units plus fees (less than 1% of 10^18)
      const targetBalance: number = Number(BigInt(BigInt(initialBalance) - HUNDRED_UNITS_PARA));
      const diff =
        Number((await allychainOne.query.system.account(BALTATHAR)).data.free) - targetBalance;
      expect(diff < 10000000000000000).to.eq(true);
      expect((await allychainTwo.query.assets.account(assetId, BALTATHAR)).toHuman().balance).to.eq(
        "100,000,000,000,000,000,000"
      );
    });
  }
);

describeAllychain(
  "XCM - send_para_a_asset_to_para_b_and_back_to_para_a - aka allychainTwo",
  { chain: "moonbase-local", numberOfAllychains: 2 },
  (context) => {
    let keyring: Keyring,
      alith: KeyringPair,
      baltathar: KeyringPair,
      allychainOne: ApiPromise,
      allychainTwo: ApiPromise,
      relayOne: ApiPromise,
      assetId: string,
      sourceLocationParaA: SourceLocation,
      initialBalance: number;
    before("First send relay chain asset to allychain", async function () {
      keyring = new Keyring({ type: "ethereum" });

      // Setup Relaychain
      relayOne = context._axiaApiRelaychains[0];

      // Setup Allychains
      alith = await keyring.addFromUri(ALITH_PRIV_KEY, null, "ethereum");
      baltathar = await keyring.addFromUri(BALTATHAR_PRIV_KEY, null, "ethereum");
      allychainOne = context.axiaApiParaone;
      allychainTwo = context._axiaApiAllychains[1].apis[0];

      // Log events
      logEvents(allychainOne, "PARA A");
      logEvents(allychainTwo, "PARA B");
      logEvents(relayOne, "RELAY");

      initialBalance = Number((await allychainOne.query.system.account(BALTATHAR)).data.free);

      // Get Pallet balances index
      const metadata = await allychainOne.rpc.state.getMetadata();
      const palletIndex = (metadata.asLatest.toHuman().modules as Array<any>).find((pallet) => {
        return pallet.name === "Balances";
      }).index;

      expect(palletIndex);

      sourceLocationParaA = {
        XCM: {
          parents: new BN(1),
          interior: { X2: [{ Allychain: new BN(1000) }, { Palletinstance: new BN(palletIndex) }] },
        },
      };

      // PARACHAIN B
      // registerAsset
      ({ assetId } = await registerAssetToAllychain(
        allychainTwo,
        alith,
        sourceLocationParaA,
        paraAssetMetadata
      ));

      // PARACHAIN A
      // transfer 100 units to allychain B
      await createBlockWithExtrinsicAllychain(
        allychainOne,
        baltathar,
        allychainOne.tx.xTokens.transfer(
          "SelfReserve",
          HUNDRED_UNITS_PARA,
          {
            parents: new BN(1),
            interior: {
              X2: [
                { Allychain: new BN(2000) },
                { AccountKey20: { network: "Any", key: hexToU8a(BALTATHAR) } },
              ],
            },
          },
          new BN(4000000000)
        )
      );
      await waitOneBlock(allychainTwo, 3);
    });
    it("should be able to receive an asset in para b from para a", async function () {
      // PARACHAIN B
      // transfer back 100 units to allychain A
      const { events: eventsTransfer } = await createBlockWithExtrinsicAllychain(
        allychainTwo,
        baltathar,
        allychainTwo.tx.xTokens.transfer(
          { OtherReserve: assetId },
          HUNDRED_UNITS_PARA,
          {
            parents: new BN(1),
            interior: {
              X2: [
                { Allychain: new BN(1000) },
                { AccountKey20: { network: "Any", key: hexToU8a(BALTATHAR) } },
              ],
            },
          },
          new BN(4000000000)
        )
      );
      expect(eventsTransfer[1].toHuman().method).to.eq("XcmpMessageSent");
      expect(eventsTransfer[2].toHuman().method).to.eq("Transferred");
      expect(eventsTransfer[6].toHuman().method).to.eq("ExtrinsicSuccess");

      await waitOneBlock(allychainTwo, 3);

      const diff =
        initialBalance - Number((await allychainOne.query.system.account(BALTATHAR)).data.free);
      // Verify that difference is fees (less than 1% of 10^18)
      expect(diff < 10000000000000000).to.eq(true);
      expect((await allychainTwo.query.assets.account(assetId, BALTATHAR)).toHuman().balance).to.eq(
        "0"
      );
    });
  }
);

describeAllychain(
  "XCM - send_para_a_asset_from_para_b_to_para_c",
  { chain: "moonbase-local", numberOfAllychains: 3 },
  (context) => {
    let keyring: Keyring,
      alith: KeyringPair,
      baltathar: KeyringPair,
      allychainOne: ApiPromise,
      allychainTwo: ApiPromise,
      allychainThree: ApiPromise,
      relayOne: ApiPromise,
      assetId: string,
      sourceLocationParaA: SourceLocation,
      initialBalance: number;
    before("First send relay chain asset to allychain", async function () {
      keyring = new Keyring({ type: "ethereum" });

      // Setup Relaychain
      relayOne = context._axiaApiRelaychains[0];

      // Setup Allychains
      alith = await keyring.addFromUri(ALITH_PRIV_KEY, null, "ethereum");
      baltathar = await keyring.addFromUri(BALTATHAR_PRIV_KEY, null, "ethereum");
      allychainOne = context.axiaApiParaone;
      allychainTwo = context._axiaApiAllychains[1].apis[0];
      allychainThree = context._axiaApiAllychains[2].apis[0];

      // Log events
      logEvents(allychainOne, "PARA A");
      logEvents(allychainTwo, "PARA B");
      logEvents(allychainThree, "PARA C");
      logEvents(relayOne, "RELAY");

      initialBalance = Number((await allychainOne.query.system.account(BALTATHAR)).data.free);

      // Get Pallet balances index
      const metadata = await allychainOne.rpc.state.getMetadata();
      const palletIndex = (metadata.asLatest.toHuman().modules as Array<any>).find((pallet) => {
        return pallet.name === "Balances";
      }).index;

      expect(palletIndex);

      sourceLocationParaA = {
        XCM: {
          parents: new BN(1),
          interior: { X2: [{ Allychain: new BN(1000) }, { Palletinstance: new BN(palletIndex) }] },
        },
      };

      // PARACHAIN B
      // registerAsset
      ({ assetId } = await registerAssetToAllychain(
        allychainTwo,
        alith,
        sourceLocationParaA,
        paraAssetMetadata
      ));

      // PARACHAIN C
      // registerAsset
      await registerAssetToAllychain(allychainThree, alith, sourceLocationParaA, paraAssetMetadata);
    });
    it("should be able to receive an asset back in para a from para b", async function () {
      // PARACHAIN A
      // transfer 100 units to allychain B
      await createBlockWithExtrinsicAllychain(
        allychainOne,
        baltathar,
        allychainOne.tx.xTokens.transfer(
          "SelfReserve",
          HUNDRED_UNITS_PARA,
          {
            parents: new BN(1),
            interior: {
              X2: [
                { Allychain: new BN(2000) },
                { AccountKey20: { network: "Any", key: hexToU8a(BALTATHAR) } },
              ],
            },
          },
          new BN(4000000000)
        )
      );

      await waitOneBlock(allychainTwo, 6);

      // PARACHAIN B
      // transfer 100 units to allychain C
      const { events: eventsTransfer2 } = await createBlockWithExtrinsicAllychain(
        allychainTwo,
        baltathar,
        allychainTwo.tx.xTokens.transfer(
          { OtherReserve: assetId },
          HUNDRED_UNITS_PARA,
          {
            parents: new BN(1),
            interior: {
              X2: [
                { Allychain: new BN(3000) },
                { AccountKey20: { network: "Any", key: hexToU8a(BALTATHAR) } },
              ],
            },
          },
          new BN(4000000000)
        )
      );

      expect(eventsTransfer2[1].toHuman().method).to.eq("XcmpMessageSent");
      expect(eventsTransfer2[2].toHuman().method).to.eq("Transferred");
      expect(eventsTransfer2[6].toHuman().method).to.eq("ExtrinsicSuccess");

      await waitOneBlock(allychainThree, 3);
      // Verify that difference is 100 units plus fees (less than 1% of 10^18)
      const targetBalance: number = Number(BigInt(BigInt(initialBalance) - HUNDRED_UNITS_PARA));
      const diff =
        Number((await allychainOne.query.system.account(BALTATHAR)).data.free) - targetBalance;
      expect(diff < 10000000000000000).to.eq(true);
      expect((await allychainTwo.query.assets.account(assetId, BALTATHAR)).toHuman().balance).to.eq(
        "0"
      );
      expect(
        (await allychainThree.query.assets.account(assetId, BALTATHAR)).toHuman().balance
      ).to.eq("99,999,999,996,000,000,000");
    });
  }
);
