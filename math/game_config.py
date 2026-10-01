class GameConfig:
    def __init__(self):
        self.game_name = "GoldenGoatGardenSSA"
        self.currency = "USD"

        # Bet configuration
        self.base_bet = 10
        self.bet_levels = [1, 2, 3, 5, 10, 25, 50, 100]
        self.default_bet_level = 1

        # RTP target
        self.rtp_target = 0.9620
        self.max_win_multiplier = 220.77

        # Game modes - only base mode (no bonus/buy features)
        self.game_modes = ["base"]

        # Grid dimensions
        self.rows, self.cols = 3, 5

        # Symbol set
        self.symbols = ["H1", "H2", "H3", "H4", "L1", "L2", "L3", "L4", "WILD", "SCATTER"]

        # Paytable values are multipliers of base_bet, so payouts scale with
        # bet_level and base_bet (currency), keeping RTP constant.
        # paytable[symbol][0..4] = multipliers for 1,2,3,4,5 matching symbols
        self.paytable = {
            "H1": [0, 0, 4.5, 22.5, 112.5],
            "H2": [0, 0, 3.6, 13.5, 67.5],
            "H3": [0, 0, 2.3, 9.0, 45.0],
            "H4": [0, 0, 1.8, 6.8, 33.8],
            "L1": [0, 0, 0.9, 3.6, 13.5],
            "L2": [0, 0, 0.9, 2.7, 11.3],
            "L3": [0, 0, 0.5, 2.3, 9.0],
            "L4": [0, 0, 0.5, 1.8, 6.8],
            "WILD": [0, 0, 6.8, 45.0, 225.0],
            "SCATTER": [0, 0, 0, 0, 0]
        }

        # Scaling factor applied to all paytable multipliers to hit RTP target
        # Calibrated via 1M-spin Monte Carlo simulation (seed=42).
        # base_RTP = 96.534 / 0.9846 = 98.0434%
        # multiplier = 96.20 / 98.0434 = 0.9812 to achieve 96.20% RTP
        self.paytable_multiplier = 0.9812

        # Fixed 5-line payline configuration (243-way evaluation handled separately)
        self.paylines = [
            [(1, 0), (1, 1), (1, 2), (1, 3), (1, 4)],
            [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4)],
            [(2, 0), (2, 1), (2, 2), (2, 3), (2, 4)],
            [(0, 0), (1, 1), (2, 2), (1, 3), (0, 4)],
            [(2, 0), (1, 1), (0, 2), (1, 3), (2, 4)],
        ]
        self.num_paylines = len(self.paylines)
