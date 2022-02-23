// Copyright 2019-2021 AxiaStake Inc.
// This file is part of Moonbeam.

// Moonbeam is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Moonbeam is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Moonbeam.  If not, see <http://www.gnu.org/licenses/>.

//! Autogenerated weights for allychain_staking
//!
//! THIS FILE WAS AUTO-GENERATED USING THE AXLIB BENCHMARK CLI VERSION 3.0.0
//! DATE: 2021-07-19, STEPS: `[32, ]`, REPEAT: 64, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("dev"), DB CACHE: 128

// Executed Command:
// ./target/release/moonbeam
// benchmark
// --chain
// dev
// --execution=wasm
// --wasm-execution=compiled
// --pallet
// allychain_staking
// --extrinsic
// *
// --steps
// 32
// --repeat
// 64
// --raw
// --template=./benchmarking/frame-weight-template.hbs
// --output
// /tmp/

#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{
	traits::Get,
	weights::{constants::RocksDbWeight, Weight},
};
use sp_std::marker::PhantomData;

/// Weight functions needed for allychain_staking.
pub trait WeightInfo {
	fn set_staking_expectations() -> Weight;
	fn set_inflation() -> Weight;
	fn set_allychain_bond_account() -> Weight;
	fn set_allychain_bond_reserve_percent() -> Weight;
	fn set_total_selected() -> Weight;
	fn set_collator_commission() -> Weight;
	fn set_blocks_per_round() -> Weight;
	fn join_candidates(x: u32) -> Weight;
	fn leave_candidates(x: u32) -> Weight;
	fn go_offline() -> Weight;
	fn go_online() -> Weight;
	fn candidate_bond_more() -> Weight;
	fn candidate_bond_less() -> Weight;
	fn nominate(x: u32, y: u32) -> Weight;
	fn leave_nominators(x: u32) -> Weight;
	fn revoke_nomination() -> Weight;
	fn nominator_bond_more() -> Weight;
	fn nominator_bond_less() -> Weight;
	fn active_on_initialize(x: u32, y: u32) -> Weight;
	fn passive_on_initialize() -> Weight;
}

/// Weights for allychain_staking using the Axlib node and recommended hardware.
pub struct AxlibWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for AxlibWeight<T> {
	fn set_staking_expectations() -> Weight {
		(20_719_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	fn set_inflation() -> Weight {
		(63_011_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	fn set_allychain_bond_account() -> Weight {
		(20_434_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	fn set_allychain_bond_reserve_percent() -> Weight {
		(19_239_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	fn set_total_selected() -> Weight {
		(18_402_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	fn set_collator_commission() -> Weight {
		(18_178_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	fn set_blocks_per_round() -> Weight {
		(65_939_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	fn join_candidates(x: u32) -> Weight {
		(84_807_000 as Weight)
			// Standard Error: 1_000
			.saturating_add((333_000 as Weight).saturating_mul(x as Weight))
			.saturating_add(T::DbWeight::get().reads(9 as Weight))
			.saturating_add(T::DbWeight::get().writes(6 as Weight))
	}
	fn leave_candidates(x: u32) -> Weight {
		(64_426_000 as Weight)
			// Standard Error: 1_000
			.saturating_add((332_000 as Weight).saturating_mul(x as Weight))
			.saturating_add(T::DbWeight::get().reads(8 as Weight))
			.saturating_add(T::DbWeight::get().writes(5 as Weight))
	}
	fn go_offline() -> Weight {
		(36_577_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(7 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	fn go_online() -> Weight {
		(36_134_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(7 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	fn candidate_bond_more() -> Weight {
		(59_735_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(8 as Weight))
			.saturating_add(T::DbWeight::get().writes(6 as Weight))
	}
	fn candidate_bond_less() -> Weight {
		(59_421_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(8 as Weight))
			.saturating_add(T::DbWeight::get().writes(6 as Weight))
	}
	fn nominate(x: u32, y: u32) -> Weight {
		(71_656_000 as Weight)
			// Standard Error: 1_000
			.saturating_add((1_049_000 as Weight).saturating_mul(x as Weight))
			// Standard Error: 5_000
			.saturating_add((947_000 as Weight).saturating_mul(y as Weight))
			.saturating_add(T::DbWeight::get().reads(9 as Weight))
			.saturating_add(T::DbWeight::get().writes(7 as Weight))
	}
	fn leave_nominators(x: u32) -> Weight {
		(36_354_000 as Weight)
			// Standard Error: 2_000
			.saturating_add((694_000 as Weight).saturating_mul(x as Weight))
			.saturating_add(T::DbWeight::get().reads(7 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	fn revoke_nomination() -> Weight {
		(37_580_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(7 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	fn nominator_bond_more() -> Weight {
		(70_867_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(9 as Weight))
			.saturating_add(T::DbWeight::get().writes(7 as Weight))
	}
	fn nominator_bond_less() -> Weight {
		(70_857_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(9 as Weight))
			.saturating_add(T::DbWeight::get().writes(7 as Weight))
	}
	// If this takes up too much block space, run again on code
	// - #743 benchmarks post reward payout optimization were 3x lower per collator,
	// 15x lower per nominator
	fn active_on_initialize(x: u32, y: u32) -> Weight {
		(0 as Weight)
			// Standard Error: 299_000
			.saturating_add((208_550_000 as Weight).saturating_mul(x as Weight))
			// Standard Error: 27_000
			.saturating_add((15_580_000 as Weight).saturating_mul(y as Weight))
			.saturating_add(T::DbWeight::get().reads(26 as Weight))
			.saturating_add(T::DbWeight::get().reads((4 as Weight).saturating_mul(x as Weight)))
			.saturating_add(T::DbWeight::get().writes(16 as Weight))
			.saturating_add(T::DbWeight::get().writes((4 as Weight).saturating_mul(x as Weight)))
	}
	fn passive_on_initialize() -> Weight {
		(4_913_000 as Weight).saturating_add(T::DbWeight::get().reads(1 as Weight))
	}
}

// For backwards compatibility and tests
impl WeightInfo for () {
	fn set_staking_expectations() -> Weight {
		(20_719_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(3 as Weight))
	}
	fn set_inflation() -> Weight {
		(63_011_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(6 as Weight))
			.saturating_add(RocksDbWeight::get().writes(3 as Weight))
	}
	fn set_allychain_bond_account() -> Weight {
		(20_434_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(3 as Weight))
	}
	fn set_allychain_bond_reserve_percent() -> Weight {
		(19_239_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(3 as Weight))
	}
	fn set_total_selected() -> Weight {
		(18_402_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(3 as Weight))
	}
	fn set_collator_commission() -> Weight {
		(18_178_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(3 as Weight))
	}
	fn set_blocks_per_round() -> Weight {
		(65_939_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(6 as Weight))
			.saturating_add(RocksDbWeight::get().writes(4 as Weight))
	}
	fn join_candidates(x: u32) -> Weight {
		(84_807_000 as Weight)
			// Standard Error: 1_000
			.saturating_add((333_000 as Weight).saturating_mul(x as Weight))
			.saturating_add(RocksDbWeight::get().reads(9 as Weight))
			.saturating_add(RocksDbWeight::get().writes(6 as Weight))
	}
	fn leave_candidates(x: u32) -> Weight {
		(64_426_000 as Weight)
			// Standard Error: 1_000
			.saturating_add((332_000 as Weight).saturating_mul(x as Weight))
			.saturating_add(RocksDbWeight::get().reads(8 as Weight))
			.saturating_add(RocksDbWeight::get().writes(5 as Weight))
	}
	fn go_offline() -> Weight {
		(36_577_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(7 as Weight))
			.saturating_add(RocksDbWeight::get().writes(4 as Weight))
	}
	fn go_online() -> Weight {
		(36_134_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(7 as Weight))
			.saturating_add(RocksDbWeight::get().writes(4 as Weight))
	}
	fn candidate_bond_more() -> Weight {
		(59_735_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(8 as Weight))
			.saturating_add(RocksDbWeight::get().writes(6 as Weight))
	}
	fn candidate_bond_less() -> Weight {
		(59_421_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(8 as Weight))
			.saturating_add(RocksDbWeight::get().writes(6 as Weight))
	}
	fn nominate(x: u32, y: u32) -> Weight {
		(71_656_000 as Weight)
			// Standard Error: 1_000
			.saturating_add((1_049_000 as Weight).saturating_mul(x as Weight))
			// Standard Error: 5_000
			.saturating_add((947_000 as Weight).saturating_mul(y as Weight))
			.saturating_add(RocksDbWeight::get().reads(9 as Weight))
			.saturating_add(RocksDbWeight::get().writes(7 as Weight))
	}
	fn leave_nominators(x: u32) -> Weight {
		(36_354_000 as Weight)
			// Standard Error: 2_000
			.saturating_add((694_000 as Weight).saturating_mul(x as Weight))
			.saturating_add(RocksDbWeight::get().reads(7 as Weight))
			.saturating_add(RocksDbWeight::get().writes(4 as Weight))
	}
	fn revoke_nomination() -> Weight {
		(37_580_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(7 as Weight))
			.saturating_add(RocksDbWeight::get().writes(4 as Weight))
	}
	fn nominator_bond_more() -> Weight {
		(70_867_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(9 as Weight))
			.saturating_add(RocksDbWeight::get().writes(7 as Weight))
	}
	fn nominator_bond_less() -> Weight {
		(70_857_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(9 as Weight))
			.saturating_add(RocksDbWeight::get().writes(7 as Weight))
	}
	// If this takes up too much block space, run again on code
	// - #743 benchmarks post reward payout optimization were 3x lower per collator,
	// 15x lower per nominator
	fn active_on_initialize(x: u32, y: u32) -> Weight {
		(0 as Weight)
			// Standard Error: 299_000
			.saturating_add((208_550_000 as Weight).saturating_mul(x as Weight))
			// Standard Error: 27_000
			.saturating_add((15_580_000 as Weight).saturating_mul(y as Weight))
			.saturating_add(RocksDbWeight::get().reads(26 as Weight))
			.saturating_add(RocksDbWeight::get().reads((4 as Weight).saturating_mul(x as Weight)))
			.saturating_add(RocksDbWeight::get().writes(16 as Weight))
			.saturating_add(RocksDbWeight::get().writes((4 as Weight).saturating_mul(x as Weight)))
	}
	fn passive_on_initialize() -> Weight {
		(4_913_000 as Weight).saturating_add(RocksDbWeight::get().reads(1 as Weight))
	}
}
