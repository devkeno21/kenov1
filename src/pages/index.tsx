import React, { useEffect } from "react";
import { useState } from "react";
import { Chance } from "chance";
import { api } from "~/utils/api";
import Countdown from "react-countdown";

type DrawNumbers = Record<number, string>;
type Timer = {
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

const Keno = () => {
  const [picked, setPicked] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

  // const { data, isLoading } = api.example.hello.useQuery({text: "Keno"})

  // const { data: bets, isLoading: isBetsLoaidng} = api.bets.getAllBets.useQuery()

  // const { data: draws, isLoading: isDrawsLoading} = api.bets.getAllDraws.useQuery()

  // const { data: selectedBet, isLoading: isSelectedBetLoading} = api.bets.getBetById.useQuery({ ticket_number: 2})

  const { mutate, isLoading: isBetPlaced } = api.bets.placeBet.useMutation();

  const { mutate: updateBet, isLoading: isBetUpdating } =
    api.bets.updateBetByTicketNumber.useMutation();

  const { mutate: deleteBet, isLoading: isBetDeleting } =
    api.bets.deleteBetByTicketNumber.useMutation();

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
            className={`m-1 flex h-12 w-12 items-center justify-center rounded-full border border-black hover:bg-slate-600 hover:text-white ${
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
      rows.push(<hr key={1} className="my-2" />);
    }
  }

  // const drawNumbers = () => {
  //   const winningDraw = chance.unique(chance.natural, 5, { min: 1, max: 80 });
  //   setDrawnNumbers(winningDraw);
  //   setPicked([]);
  // };

  const SelectedNumbers = () => (
    <div className="flex h-fit flex-col border p-2 shadow-md">
      <span className="text-xl">Your selected numbers: </span>
      <div className="flex flex-row">
        {picked.map((num) => (
          <div
            key={num}
            className="m-1 flex h-12 w-12 items-center justify-center rounded-full border border-black bg-slate-600 text-white"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );

  const DrawnNumbers = () => (
    <div className="flex h-fit flex-col border p-2 shadow-md">
      <span className="text-xl">Drawn numbers: </span>
      <div className="flex flex-row">
        {drawnNumbers.map((num) => (
          <div
            key={num}
            className="m-1 flex h-12 w-12 items-center justify-center rounded-full border border-black bg-slate-600 text-white"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );

  // console.log(bets)
  // if(!draws) return

  // draws.map(draw => console.log(draw))
  // bets?.map(bets => console.log(bets.ticketNumber))
  // const numbersDrawn: DrawNumbers | undefined = draws[0]?.numbersDrawn as DrawNumbers
  // console.log(numbersDrawn)
  // const arrayOfValues = Object.values(numbersDrawn).map(value => parseInt(value));

  // console.log(arrayOfValues.map(item => console.log(item)));

  // mutate({ data: {ticketNumber: 4, gameNumber: 5, hits: 3, isReedeemed: 1, odds: 5, reedeemedAmount: 10, wagerAmount: 10 }})

  // console.log(selectedBet)

  // mutate({ data: { ticketNumber: 5, gameNumber: 5, hits: 3, isReedeemed: 1, odds: 5, reedeemedAmount: 10, wagerAmount: 10 }})

  const Callback = () => {
    
    return ( <p>Timer up close game and draw numbers.</p>)
  }
  
  const renderer = ({
    hours,
    minutes,
    seconds,
    completed,
  }: Timer) => {
    if (completed) {
      // Render a complete state
      return <Callback />;
    } else {
      // Render a countdown
      return (
        <span>
          {hours}:{minutes}:{seconds}
        </span>
      );
    }
  };

  return (
    <div className="mt-20 flex">
      <div className="flex flex-col items-start">{rows}</div>
      <div className="flex flex-col">
        <Countdown date={Date.now() + 240000} renderer={renderer} />
        <SelectedNumbers />
        <DrawnNumbers />

        <button
          className="m-2 h-fit cursor-pointer rounded-lg bg-green-700 px-4 py-2 text-white"
          // disabled={picked.length === 0}
          // onClick={() => drawNumbers()}
          onClick={() => {
            console.log("place clicked");
            // updateBet({ ticketNumber: 10, data: {reedeemedAmount: 100000}})
            deleteBet({ ticketNumber: 3 });
            // mutate({ data: { gameNumber: 6, hits: 3, isReedeemed: 0, odds: 5, reedeemedAmount: 10, wagerAmount: 10 }})
          }}
        >
          Place bet
        </button>
        <button
          className="m-2 h-fit rounded-lg bg-red-700 px-4 py-2 text-white"
          onClick={() => setPicked([])}
        >
          Clear
        </button>
        {/* <div>{data?.greeting}</div> */}
      </div>
    </div>
  );
};

export default Keno;
