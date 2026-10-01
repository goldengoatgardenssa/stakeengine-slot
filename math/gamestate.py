import random
from game_config import GameConfig

class GameState:
    def __init__(self):
        self.config = GameConfig()
        self.reel_strips = [
            ["L1", "H1", "L2", "H3", "WILD", "L4", "L3", "H2", "SCATTER", "L1", "H4"],
            ["L2", "H2", "L3", "H1", "L1", "WILD", "L4", "H3", "L2", "H4", "SCATTER"],
            ["L3", "H3", "L4", "H2", "L2", "H1", "WILD", "L1", "H4", "L3", "SCATTER"],
            ["L4", "H4", "L1", "H3", "L3", "H2", "WILD", "H1", "L2", "SCATTER", "L1"],
            ["L1", "H1", "L2", "H4", "WILD", "L3", "H3", "L4", "H2", "L1", "SCATTER"]
        ]

    def run_spin(self, bet_level=1):
        board = []
        for col in range(self.config.cols):
            strip = self.reel_strips[col]
            idx = random.randint(0, len(strip) - 1)
            column_symbols = [strip[(idx + r) % len(strip)] for r in range(self.config.rows)]
            board.append(column_symbols)

        # Transpose board to row-major matrix [row][col]
        matrix = [[board[c][r] for c in range(self.config.cols)] for r in range(self.config.rows)]

        line_bet = self.config.base_bet * bet_level
        total_bet = self.config.base_bet  # base_bet is total bet per spin at level 1
        multiplier = self.config.paytable_multiplier

        total_payout = 0
        winning_lines = []

        for line_idx, line in enumerate(self.config.paylines):
            first_sym = matrix[line[0][0]][line[0][1]]
            match_sym = None if first_sym == "WILD" else first_sym
            match_count = 0

            for row, col in line:
                curr_sym = matrix[row][col]
                if curr_sym == "SCATTER":
                    break
                if match_sym is None and curr_sym != "WILD":
                    match_sym = curr_sym
                if curr_sym == "WILD" or curr_sym == match_sym:
                    match_count += 1
                else:
                    break

            target_sym = match_sym if match_sym else "WILD"
            if match_count >= 3:
                payout_mult = self.config.paytable[target_sym][match_count - 1]
                payout = payout_mult * line_bet * multiplier
                if payout > 0:
                    total_payout += payout
                    winning_lines.append({
                        "line": line_idx,
                        "payout": payout,
                        "count": match_count,
                        "symbol": target_sym
                    })

        return {
            "matrix": matrix,
            "payout": total_payout,
            "total_bet": total_bet * bet_level,
            "multiplier": total_payout / (total_bet * bet_level) if total_bet * bet_level > 0 else 0,
            "winning_lines": winning_lines
        }
