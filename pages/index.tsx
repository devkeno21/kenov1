import React, { useEffect } from "react";
import { useState } from "react";
import { Chance } from "chance";

const Keno = () => {
  const [picked, setPicked] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

  const chance = new Chance();

  const toggleNumber = (number: number) => {
    if (picked.includes(number)) {
      setPicked(picked.filter((n) => n !== number));
    } else {
      setPicked([...picked, number]);
    }
  };

  const numbers = Array.from({ length: 80 }, (_, index) => index + 1);

  const rows = [];
  for (let i = 0; i < numbers.length; i += 10) {
    const rowNumbers = numbers.slice(i, i + 10);
    const row = (
      <div className="flex" key={i}>
        {rowNumbers.map((number) => (
          <button
            className={`w-12 h-12 border border-black rounded-full flex justify-center items-center m-1 hover:bg-slate-600 hover:text-white ${
              picked.includes(number) ? "bg-red-500 text-white" : "border-black"
            }`}
            key={number}
            onClick={() => toggleNumber(number)}
          >
            {number}
          </button>
        ))}
      </div>
    );
    rows.push(row);

    if (i === 30) {
      rows.push(<hr className="my-2" />);
    }
  }

  const drawNumbers = () => {
    const winningDraw = chance.unique(chance.natural, 5, { min: 1, max: 80 });
    setDrawnNumbers(winningDraw);
    setPicked([]);
  };

  const SelectedNumbers = () => (
    <div className="border p-2 h-fit shadow-md flex flex-col">
      <span className="text-xl">Your selected numbers: </span>
      <div className="flex flex-row">
        {picked.map((num) => (
          <div
            key={num}
            className="w-12 h-12 border border-black rounded-full flex justify-center items-center bg-slate-600 text-white m-1"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );

  const DrawnNumbers = () => (
    <div className="border p-2 h-fit shadow-md flex flex-col">
      <span className="text-xl">Drawn numbers: </span>
      <div className="flex flex-row">
        {drawnNumbers.map((num) => (
          <div
            key={num}
            className="w-12 h-12 border border-black rounded-full flex justify-center items-center bg-slate-600 text-white m-1"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex mt-20">
      <div className="flex flex-col items-start">{rows}</div>
      <div className="flex flex-col">
        <SelectedNumbers />
        <DrawnNumbers />

        <button
          className="bg-green-700 h-fit text-white px-4 py-2 rounded-lg m-2"
          disabled={picked.length === 0}
          onClick={() => drawNumbers()}
        >
          Place bet
        </button>
        <button
          className="bg-red-700 h-fit text-white px-4 py-2 rounded-lg m-2"
          onClick={() => setPicked([])}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Keno;
