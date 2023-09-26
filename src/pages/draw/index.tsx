import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTimer } from "react-timer-hook";
import { setMinutes, setSeconds } from "~/store/timerSlice";
import type { RootState } from "~/store/store";
import { api } from "~/utils/api";
import Image from "next/image";
import top from "../../../public/top.png";
import bottom from "../../../public/bottom.png";
import middle from "../../../public/middle.png";

function GetNumberToShow() {
  const numbersToShow: number[] = [23, 74, 55, 10];
  const animationDuration = 2000; // Adjust this as needed
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

  // Function to add the next number from numbersToShow to drawnNumbers with a delay

  // Run the function when the component mounts to start the animation
  useEffect(() => {
    const addNextNumber = () => {
      if (currentIndex !== undefined && currentIndex < numbersToShow.length) {
        setTimeout(() => {
          setDrawnNumbers((prevDrawnNumbers) => {
            return [...prevDrawnNumbers, numbersToShow[currentIndex]];
          });
          setCurrentIndex(currentIndex + 1);
        }, animationDuration);
      }
    };

    addNextNumber();
  }, [currentIndex, numbersToShow]);

  return { drawnNumbers, showNumber: numbersToShow[currentIndex] };
}

function NumberArray() {
  const numbers = Array.from({ length: 80 }, (_, index) => index + 1);
  const { drawnNumbers } = GetNumberToShow();

  // Function to reset the animation when currentIndex reaches the end
  // useEffect(() => {
  //   if (currentIndex === numbersToShow.length) {
  //     setCurrentIndex(0);
  //     setDrawnNumbers([]);
  //     addNextNumber();
  //   }
  // }, [currentIndex]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = [];
  for (let i = 0; i < numbers.length; i += 10) {
    const rowNumbers = numbers.slice(i, i + 10);
    const row = (
      <div className="flex" key={i}>
        {rowNumbers.map((number) => (
          <div
            // className={`m-1 flex h-12 w-12 items-center justify-center rounded-full border border-black hover:bg-slate-600 hover:text-white ${
            //   picked.includes(number) ? "bg-red-500 text-white" : "border-black"
            // }`}
            className={`m-1 flex min-h-[3rem] min-w-[4rem] flex-grow items-center justify-center rounded-lg  text-6xl  shadow-sm 
            ${
              drawnNumbers.includes(number)
                ? "animate-zoom-in-out bg-yellow-500 text-black"
                : "bg-gradient-to-t from-red-900 to-red-600 text-white text-opacity-20"
            }`}
            key={number}
          >
            {number}
          </div>
        ))}
      </div>
    );
    rows.push(row);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return rows;
}

function MyTimer({ expiryTimestamp }: { expiryTimestamp: Date }) {
  const { mutate: createDraw, isLoading: isCreatingDraw } =
    api.draws.createDraw.useMutation();

  const [minute, setMinute] = useState<number>(0);
  const [second, setSecond] = useState<number>(0);
  const minuteState = useSelector((state: RootState) => state.timer.minutes);
  const secState = useSelector((state: RootState) => state.timer.seconds);
  const dispatch = useDispatch();

  const handleChange = ({
    minutes,
    seconds,
  }: {
    minutes: number;
    seconds: number;
  }) => {
    setMinute(minutes);
    setSecond(seconds);
    localStorage.setItem("minutes", minute?.toString());
    localStorage.setItem("seconds", second?.toString());
  };

  const draw = () => {
    createDraw({ data: {} });
  };

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    // onExpire: () => draw(),
  });

  useEffect(() => {
    handleChange({ minutes, seconds });
    console.log(minute);
  }, [seconds, minutes]);

  return (
    <div>
      <div>
        <span>{minutes}</span>:<span>{seconds}</span>
      </div>
      {/* <p>{isRunning ? "Running" : "Not running"}</p>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button> */}
      {/* <button
        onClick={() => {
          // Restarts to 5 minutes timer
          const time = new Date();
          time.setSeconds(time.getSeconds() + 5);
          restart(time);
        }}
      >
        Restart
      </button> */}
    </div>
  );
}

function DrawContent() {
  const { showNumber } = GetNumberToShow();
  const [number, isNumberChanging] = useState<boolean>(false);

  useEffect(() => {
    isNumberChanging(true);
  }, [showNumber]);

  return (
    <div className="flex">
      {/* <div className="min-h-screen">
        <div className="flex gap-2">
          <p className="text-4xl font-extrabold text-yellow-400">DRAW</p>
          <p className="flex gap-2 text-4xl font-extrabold text-white"> 152 </p>
        </div>
        <div className="flex flex-col items-start">{NumberArray()}</div>
        <p className="text-4xl text-red-300">KENO</p>
      </div> */}
      <div className="ml-auto flex min-h-screen w-1/3 flex-col">
        <div className="flex min-h-screen flex-col">
          {/* <Image src="/top.png" width={400} height={20} alt="top" className="border "/> */}
          <div
            style={{
              backgroundImage: `url(${top.src})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              height: "25vh",
            }}
            className=""
          />
          <div
            style={{
              backgroundImage: `url(${middle.src})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
            className="flex h-[50vh] items-center  justify-center rounded-full border-black border-opacity-80"
          >
            <div style={{background: "radial-gradient(circle at 100px 100px, #eae032, #000)"}} className="animate-drop-zoom-in-out bg-yellow-400 w-[80%] h-[90%] rounded-full flex justify-center items-center"><p className="p-0 text-9xl">{showNumber}</p></div>
          </div>
          <div
            style={{
              backgroundImage: `url(${bottom.src})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              height: "25vh",
            }}
            className="mt-auto"
          />
        </div>
      </div>

      {/* Old way of trying to implement */}
      {/* <div className="ml-auto border">
        <div className="w-[22rem] h-[19rem] absolute rounded-full bg-yellow-400 top-[26%] right-[6%]">
          <p className="absolute top-[25%] left-[30%] text-9xl text-black animate-zoom-in-out">{showNumber}</p>
        </div>
        <div className="border absolute top-1/2 h-10 w-inherit"></div>
        <Image
          src="/NormalDraw.png"
          width="400"
          height={500}
          alt="Draw bucket"
          className="h-screen w-auto"
        />
      </div> */}
    </div>
  );
}

export default function App() {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 600); // 10 minutes timer
  return (
    <div className="min-h-screen bg-red-700">
      <DrawContent />
      {/* <div className="absolute right-4">
      <MyTimer expiryTimestamp={time} />
      </div> */}
    </div>
  );
}
