import { Routes, Route } from "react-router-dom";
import WindDraw from "./pages/WindDraw.tsx";
import DiceRoll from "./pages/DiceRoll.tsx";
import InGameDiceRoll from "./pages/InGameDiceRoll.tsx";
import FanPayout from "./pages/FanPayout.tsx";
import SideBets from "./pages/SideBets.tsx";
import PlayerResults from "./pages/PlayerResults.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WindDraw />} />
      <Route path="/dice" element={<DiceRoll />} />
      <Route path="/in-game-dice" element={<InGameDiceRoll />} />
      <Route path="/fan-payout" element={<FanPayout />} />
      <Route path="/side-bets" element={<SideBets />} />
      <Route path="/player-results" element={<PlayerResults />} />
    </Routes>
  );
}
