import { Routes, Route } from "react-router-dom";
import WindDraw from "./pages/WindDraw.tsx";
import DiceRoll from "./pages/DiceRoll.tsx";
import InGameDiceRoll from "./pages/InGameDiceRoll.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WindDraw />} />
      <Route path="/dice" element={<DiceRoll />} />
      <Route path="/in-game-dice" element={<InGameDiceRoll />} />
    </Routes>
  );
}
