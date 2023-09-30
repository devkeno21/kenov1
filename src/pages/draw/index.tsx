import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTimer } from "react-timer-hook";
import { setMinutes, setSeconds } from "~/store/timerSlice";
import type { RootState } from "~/store/store";
import { api } from "~/utils/api";
import Image from "next/image";
import top from "../../../public/top.png";
import bottom from "../../../public/bottom.png";
import middle from "../../../public/middle.png";
import ReactPlayer from "react-player";
import { setStatus } from "~/store/drawSlice";

function TransitionAnimation() {
  const dispatch = useDispatch();
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    setIsClient(true);
    setIsPlaying(true);
  }, []);

  const handleOnEnd = () => {
    dispatch(setStatus("showing"));
  };

  return (
    <div className="overflow-clip overflow-y-hidden">
      {
        <ReactPlayer
          url={"/transitionAnimation.mp4"}
          controls={false}
          playing={true}
          muted={true}
          onEnded={handleOnEnd}
          width="100vw"
          height={"auto"}
        />
      }
    </div>
  );
}

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
          setDrawnNumbers((prevDrawnNumbers) => [
            ...prevDrawnNumbers,
            numbersToShow[currentIndex]!,
          ]);
          setCurrentIndex(currentIndex + 1);
        }, animationDuration);
      }
    };

    addNextNumber();
  }, [currentIndex, numbersToShow]);

  return { drawnNumbers, showNumber: numbersToShow[currentIndex] };
}

const Grid: React.FC = () => {
  const numRows = 8;
  const numCols = 10;

  const generateGridData = () => {
    const gridData = [];
    let currentNumber = 1;

    for (let i = 0; i < numRows; i++) {
      const row = [];
      for (let j = 0; j < numCols; j++) {
        row.push(currentNumber);
        currentNumber++;
      }
      gridData.push(row);
    }

    return gridData;
  };

  const gridData = generateGridData();

  const { drawnNumbers } = GetNumberToShow();

  return (
    <div className="flex w-[74vw] flex-col">
      <div className="flex gap-2">
        <p className="text-4xl font-extrabold text-yellow-400">DRAW</p>
        <p className="flex gap-2 text-4xl font-extrabold text-white"> 152 </p>
      </div>
      <div className="grid h-[85vh] grid-cols-10 gap-2">
        {gridData.map((row, rowIndex) =>
          row.map((cellValue, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              // className="bg-gray-200 p-2 text-center"
              className={`m-1 flex min-h-[3rem] min-w-[4rem] flex-grow items-center justify-center  rounded-lg text-6xl shadow-sm 
            ${
              drawnNumbers.includes(cellValue)
                ? "animate-zoom-in-out bg-yellow-500 text-black"
                : "bg-gradient-to-t from-red-900 to-red-600 text-white text-opacity-20"
            }`}
            >
              {cellValue}
            </div>
          )),
        )}
      </div>
      <p className="text-4xl font-semibold text-red-300">KENO</p>
    </div>
  );
};

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
    onExpire: () => dispatch(setStatus("transition")),
  });

  useEffect(() => {
    handleChange({ minutes, seconds });
    console.log(minute);
  }, [seconds, minutes]);

  return (
    <div>
      <div className="text-9xl text-yellow-400">
        <span>
          {minutes < 10 ? "0" : ""}
          {minutes}
        </span>
        :
        <span>
          {seconds < 10 ? "0" : ""}
          {seconds}
        </span>
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

function RightContent() {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 240);

  const [currentContent, setCurrentContent] = useState<string>("content1");
  const contentArray: string[] = [
    "content1",
    "content2",
    "content3",
    "content4",
    "content5",
    "content6",
    "content7",
    "content8",
    "content9",
    "content10",
    "content11",
    "content12",
    "content13",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = contentArray.indexOf(currentContent);
      const nextIndex = (currentIndex + 1) % contentArray.length;
      setCurrentContent(contentArray[nextIndex]!);
    }, 6000);

    return () => {
      clearInterval(interval);
    };
  }, [currentContent]);

  console.log({ currentContent });

  return (
    <div className="flex max-h-screen w-[30vw] flex-col items-center overflow-hidden bg-gradient-to-t from-black to-red-900">
      <div>
        <div className="flex justify-center gap-2">
          <p className="text-5xl font-extrabold text-yellow-400">DRAW</p>
          <p className="flex gap-2 text-5xl font-extrabold text-white"> 152 </p>
        </div>
        <MyTimer expiryTimestamp={time} />
      </div>
      {currentContent === "content1" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center gap-20 text-center text-7xl">
          <p className="text-white">
            PICK <span className="text-red-600">1</span> TO{" "}
            <span className="text-red-600">10</span>
          </p>
          <p className="text-white">NUMBERS</p>
          <p className="text-white">
            FROM <span className="text-red-600">80</span>
          </p>
        </div>
      )}
      {currentContent === "content2" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-6xl">
          <p className="text-red-600">20</p>
          <p className="text-white">BALLS DRAWN FROM</p>
          <p className="text-red-600">80</p>
        </div>
      )}
      {currentContent === "content3" && (
        <>
          <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-6xl">
            <p className="text-white">Play</p>
            <div className="flex gap-2">
              <p className="text-white">The</p>
              <p className="text-red-600">PICK 10</p>
              <p className="text-white">Game</p>
            </div>
          </div>
          <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-6xl">
            <span className="text-white">
              GET<span className="text-center text-red-600"> 10</span> numbers
              <br></br> correct, and<br></br> win the
            </span>
          </div>
          <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-6xl">
            <div className="flex gap-2">
              <p className="text-red-600">PICK 10</p>
              <p className="text-white">JACKPOT</p>
            </div>
          </div>
        </>
      )}
      {currentContent === "content4" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 3</p>
          <p className="text-white">TO</p>
          <p className="text-red-600">PICK 10</p>
          <p className="text-white">games have</p>
          <p className="text-yellow-500">MULTIPLE</p>
          <p className="text-yellow-500">PAY LEVELS</p>
          <p className="text-white">on other spots.</p>
        </div>
      )}
      {currentContent === "content5" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 10</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">9</div>
            <div className="text-white">2888</div>
            <div className="text-white">8</div>
            <div className="text-white">128</div>
            <div className="text-white">7</div>
            <div className="text-white">48</div>
            <div className="text-white">6</div>
            <div className="text-white">12</div>
            <div className="text-white">5</div>
            <div className="text-white">4</div>
            <div className="text-white">4</div>
            <div className="text-white">1</div>
          </div>
        </div>
      )}
      {currentContent === "content6" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 9</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">8</div>
            <div className="text-white">1888</div>
            <div className="text-white">7</div>
            <div className="text-white">88</div>
            <div className="text-white">6</div>
            <div className="text-white">20</div>
            <div className="text-white">5</div>
            <div className="text-white">4</div>
            <div className="text-white">4</div>
            <div className="text-white">2</div>
          </div>
        </div>
      )}
      {currentContent === "content7" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 8</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">7</div>
            <div className="text-white">628</div>
            <div className="text-white">6</div>
            <div className="text-white">58</div>
            <div className="text-white">5</div>
            <div className="text-white">8</div>
            <div className="text-white">4</div>
            <div className="text-white">2</div>
          </div>
        </div>
      )}
      {currentContent === "content8" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 7</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">6</div>
            <div className="text-white">90</div>
            <div className="text-white">5</div>
            <div className="text-white">10</div>
            <div className="text-white">4</div>
            <div className="text-white">3</div>
            <div className="text-white">3</div>
            <div className="text-white">1</div>
          </div>
        </div>
      )}
      {currentContent === "content9" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 6</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">6</div>
            <div className="text-white">1800</div>
            <div className="text-white">5</div>
            <div className="text-white">80</div>
            <div className="text-white">4</div>
            <div className="text-white">5</div>
            <div className="text-white">3</div>
            <div className="text-white">1</div>
          </div>
        </div>
      )}
      {currentContent === "content10" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 5</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">5</div>
            <div className="text-white">640</div>
            <div className="text-white">4</div>
            <div className="text-white">14</div>
            <div className="text-white">3</div>
            <div className="text-white">2</div>
          </div>
        </div>
      )}
      {currentContent === "content11" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 4</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">4</div>
            <div className="text-white">120</div>
            <div className="text-white">3</div>
            <div className="text-white">4</div>
            <div className="text-white">2</div>
            <div className="text-white">1</div>
          </div>
        </div>
      )}
      {currentContent === "content12" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 3</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">3</div>
            <div className="text-white">4</div>
            <div className="text-white">2</div>
            <div className="text-white">1</div>
          </div>
        </div>
      )}
      {currentContent === "content13" && (
        <div className="mb-auto mt-auto flex flex-col items-center justify-center text-center text-7xl">
          <p className="text-red-600">PICK 1</p>
          <div className="mt-4 grid grid-cols-2 gap-x-28 gap-y-2 text-5xl">
            <div className="text-yellow-400">HITS</div>
            <div className="text-yellow-400">WIN</div>
            <div className="text-white">1</div>
            <div className="text-white">3</div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawContent() {
  const { showNumber } = GetNumberToShow();
  const [numberKey, setNumberKey] = useState(0);
  const drawState = useSelector((state: RootState) => state.draw.status);
  const dispatch = useDispatch();

  useEffect(() => {
    if (showNumber === undefined) {
      // Stop the animation here (you may need to use a ref or a state variable)
      // Dispatch the action to set the status to "countdown"
      dispatch(setStatus("countdown"));
    } else {
      // Delay the increment of numberKey by 2 seconds
      const timeoutId = setTimeout(() => {
        setNumberKey((prevKey) => prevKey + 1);
      }, 2000);

      // Clean up the timeout on component unmount or when showNumber changes
      return () => clearTimeout(timeoutId);
    }
  }, [showNumber, dispatch, setNumberKey]);

  return (
    <>
      <Grid />
      {drawState === "showing" && (
        <>
          <div className="flex w-[26vw]">
            {/* <div className="min-h-screen">
        <div className="flex gap-2">
          <p className="text-4xl font-extrabold text-yellow-400">DRAW</p>
          <p className="flex gap-2 text-4xl font-extrabold text-white"> 152 </p>
        </div>
        <div className="flex flex-col items-start">{NumberArray()}</div>
        <p className="text-4xl text-red-300">KENO</p>
      </div> */}
            <div className="flex min-h-screen w-[33vw] flex-col">
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
                <div
                  key={numberKey}
                  style={{
                    background:
                      "radial-gradient(circle at 100px 100px, #eae032, #000)",
                  }}
                  className={`flex h-[90%] w-[80%] animate-drop-zoom-in-out items-center justify-center rounded-full bg-yellow-400`}
                >
                  <p className="p-0 text-9xl">{showNumber}</p>
                </div>
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
        </>
      )}
      {drawState === "countdown" && <RightContent />}

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
    </>
  );
}

export default function App() {
  const drawState = useSelector((state: RootState) => state.draw.status);

  return (
    <div className="flex min-h-screen flex-row bg-red-700">
      {(drawState === "showing" || drawState === "countdown") && (
        <DrawContent />
      )}
      {drawState === "transition" && <TransitionAnimation />}
    </div>
  );
}
