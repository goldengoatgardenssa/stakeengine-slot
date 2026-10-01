import gzip
import json
import os
import random
from gamestate import GameState
from game_config import GameConfig

def create_books(num_simulations=1000000, verify_simulations=1000000):
    config = GameConfig()

    os.makedirs("library/books_compressed", exist_ok=True)
    os.makedirs("library/lookup_tables", exist_ok=True)
    os.makedirs("library/configs", exist_ok=True)
    os.makedirs("library/books", exist_ok=True)
    os.makedirs("library/forces", exist_ok=True)

    print(f"Generating {num_simulations} simulations for Stake Engine...")
    print(f"Game: {config.game_name} | Currency: {config.currency} | Target RTP: {config.rtp_target*100:.2f}%")

    RANDOM_SEED = 42

    # Run main simulation at base bet level for output files
    random.seed(RANDOM_SEED)
    state = GameState()
    total_wagered = 0
    total_returned = 0
    lookup_table = []

    for sim_id in range(1, num_simulations + 1):
        result = state.run_spin(bet_level=1)
        total_wagered += result["total_bet"]
        total_returned += result["payout"]
        lookup_table.append(f"{sim_id},1,{result['multiplier']:.6f}")

    rtp = (total_returned / total_wagered) * 100 if total_wagered > 0 else 0
    rtp_by_level = {1: round(rtp, 4)}
    print(f"  Bet level   1x: RTP = {rtp:.4f}%  (wagered={total_wagered}, returned={total_returned:.2f})")

    with open("library/lookup_tables/lookup.csv", "w") as f:
        f.write("Simulation,Weight,Multiplier\n")
        f.write("\n".join(lookup_table))

    # Write book files (compressed simulation outcomes)
    with open("library/books/simulations_book.json", "w") as f:
        book = {
            "total_simulations": num_simulations,
            "total_wagered": total_wagered,
            "total_returned": round(total_returned, 2),
            "rtp": round(rtp, 4),
            "paylines_evaluated": config.num_paylines,
            "symbols": config.symbols,
            "game_modes": config.game_modes,
            "mode_rtp": {"base": round(rtp, 4)},
        }
        json.dump(book, f, indent=2)

    with gzip.open("library/books_compressed/simulations_book.json.gz", "wt", encoding="utf-8") as f:
        json.dump({"compressed": True, "rtp": round(rtp, 4), "total_sims": num_simulations}, f)

    # Write forces file (expected value calculations)
    with open("library/forces/ev_forces.json", "w") as f:
        forces = {
            "base_ev_per_spin": round(total_returned / num_simulations, 4),
            "base_bet": config.base_bet,
            "total_bet": config.base_bet,
            "paytable_multiplier": config.paytable_multiplier,
            "num_paylines": config.num_paylines,
            "game_modes": config.game_modes,
            "mode_rtp": {"base": round(rtp, 4)},
        }
        json.dump(forces, f, indent=2)

    # Verify RTP at other bet levels using the SAME seed and sample count.
    # Since payout and total_bet both scale linearly with bet_level,
    # the RTP must be identical across all bet levels.
    print("\nVerifying bet-level independence (same seed, should be identical):")
    for level in [2, 5, 10, 50, 100]:
        random.seed(RANDOM_SEED)
        verify_state = GameState()
        v_wagered = 0
        v_returned = 0

        for _ in range(verify_simulations):
            result = verify_state.run_spin(bet_level=level)
            v_wagered += result["total_bet"]
            v_returned += result["payout"]

        v_rtp = (v_returned / v_wagered) * 100 if v_wagered > 0 else 0
        rtp_by_level[level] = round(v_rtp, 4)
        match = "MATCH" if abs(v_rtp - rtp) < 0.001 else "DIFF"
        print(f"  Bet level {level:>3}x: RTP = {v_rtp:.4f}%  [{match}]")

# Write frontend configuration
    config_fe = {
        "gameName": config.game_name,
        "currency": config.currency,
        "grid": {"rows": config.rows, "cols": config.cols},
        "paylines": config.num_paylines,
        "betLevels": config.bet_levels,
        "baseBet": config.base_bet,
        "rtp": round(rtp_by_level.get(1, 0), 2),
        "rtpTarget": round(config.rtp_target * 100, 2),
        "maxWin": round(config.max_win_multiplier, 2),
        "symbols": config.symbols,
        "gameModes": config.game_modes,
        "paytable": config.paytable,
        "paytableMultiplier": config.paytable_multiplier,
    }

    with open("library/configs/config_fe.json", "w") as f:
        json.dump(config_fe, f, indent=2)

    rtp_base = rtp_by_level.get(1, 0)
    all_consistent = all(abs(v - rtp_base) < 0.01 for v in rtp_by_level.values())
    print(f"\nSimulation Complete. Base RTP: {rtp_base}%")
    if all_consistent:
        print("RTP is consistent across all bet levels (bet-level independent).")
    else:
        print("WARNING: RTP varies across bet levels!")

if __name__ == "__main__":
    create_books(1000000, 1000000)
