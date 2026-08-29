import { Routes, Route } from "react-router-dom";
import MainSplash from "./pages/MainSplash.tsx";
import WindDraw from "./pages/WindDraw.tsx";
import DiceRoll from "./pages/DiceRoll.tsx";
import InGameDiceRoll from "./pages/InGameDiceRoll.tsx";
import FanPayout from "./pages/FanPayout.tsx";
import SideBets from "./pages/SideBets.tsx";
import PlayerResults from "./pages/PlayerResults.tsx";
import BeckonInvite from "./pages/BeckonInvite.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainSplash />} />
      <Route path="/wind-draw" element={<WindDraw />} />
      <Route path="/dice" element={<DiceRoll />} />
      <Route path="/in-game-dice" element={<InGameDiceRoll />} />
      <Route path="/fan-payout" element={<FanPayout />} />
      <Route path="/side-bets" element={<SideBets />} />
      <Route path="/player-results" element={<PlayerResults />} />
      <Route path="/beckon-invite" element={<BeckonInvite />} />
    </Routes>
  );
}
