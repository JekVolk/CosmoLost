class EloService:
    K = 32

    def calculate(self, score_p1: int, score_p2: int, elo1: int, elo2: int) -> tuple[int, int]:
        """
        Calculates ELO rating delta for player 1 and player 2.
        Returns: (delta_p1, delta_p2)
        """
        e1 = 1 / (1 + 10 ** ((elo2 - elo1) / 400))
        s1 = 1.0 if score_p1 > score_p2 else (0.5 if score_p1 == score_p2 else 0.0)
        d1 = round(self.K * (s1 - e1))
        d2 = round(self.K * ((1 - s1) - (1 - e1)))
        return d1, d2
