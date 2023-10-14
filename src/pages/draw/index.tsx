/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useState, useEffect } from "react";
import { useTimer } from "react-timer-hook";
import { useDispatch, useSelector } from "react-redux";
import ReactPlayer from "react-player";
import { setGameNumber, setStatus } from "~/store/drawSlice";
import type { RootState } from "~/store/store";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";

function MyTimer({ expiryTimestamp, timeStamp2 }: { expiryTimestamp: Date, timeStamp2: Date }) {
  const dispatch = useDispatch();
  const gameNumber = useSelector((state: RootState) => state.draw.gameNumber);
  const [ updatedGameNumber, setupdatedGameNumber] = useState<number>(gameNumber);
  const { mutate: createDraw, isLoading: isCreatingDraw,  } =
    api.draws.createDraw.useMutation({
      onSuccess: (res) => {
        console.log(res)
        toast.success("Draw done Successfully");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage?.[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to draw: Please try again later.");
        }
      },
      retry: 10
    });

    const { mutate: updateDraw, isLoading: isUpdatingDraw,  } = api.draws.updatePrematureDraw.useMutation({
      retry: 10
    })


  const [minute, setMinute] = useState<number>(0);
  const [second, setSecond] = useState<number>(0);
  // const minuteState = useSelector((state: RootState) => state.timer.minutes);
  // const secState = useSelector((state: RootState) => state.timer.seconds);

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

  // const draw = () => {
  //   createDraw({ data: {} });
  // };

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
    onExpire: () => {
      updateDraw()
      dispatch(setStatus("transition"))},
  });

  const { seconds: seconds2, minutes: minutes2 } = useTimer({expiryTimestamp: timeStamp2, onExpire: () => 
    {
      createDraw({ data: { } })
    }
  });

  useEffect(() => {
    handleChange({ minutes, seconds });
    console.log(minute);
  }, [seconds, minutes]);

  return (
    <div>
      <div
        className={`count-down count-down-text shadow-text ${
          seconds < 10 && minutes === 0 ? "blink-animation" : ""
        }`}
      >
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
    </div>
  );
}

function RightContentWText() {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 240);

  const timestamp2: Date = new Date();
  timestamp2.setSeconds(timestamp2.getSeconds() + 210);


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

  return (
    <div id="right-container" className="black-red-gradient-bg">
      <div id="right-top">
        <span className="draw-text gold-black-text shadow-text">DRAW </span>{" "}
        &nbsp; <span className="draw-number-text">6041</span>
      </div>
      <div style={{ marginTop: "1.8rem", marginLeft: "1.8rem" }}>
        <MyTimer expiryTimestamp={time} timeStamp2={timestamp2}/>
        <div style={{ position: "absolute", top: "16.5rem" }}>
          {currentContent === "content1" && (
            <div id="promo-special-b-container">
              <div className="squash">Play</div>
              <div>
                <span className="squash">The</span>{" "}
                <span
                  className="red-text"
                  style={{ fontFamily: "good-times-rg", fontSize: "4rem" }}
                >
                  PICK 10
                </span>{" "}
                <span className="squash">Game</span>
              </div>
              <div className="squash" style={{ marginTop: "1rem" }}>
                Get <span className="red-text">10</span> numbers
              </div>
              <div className="squash">
                correct, <span style={{ marginLeft: "0.2rem" }}>and</span>
              </div>
              <div className="squash">win the</div>
              <div style={{ marginTop: "1rem" }}>
                <span
                  className="red-text"
                  style={{ fontFamily: "good-times-rg", fontSize: "4rem" }}
                >
                  PICK 10
                </span>{" "}
                <span className="squash">JACKPOT</span>
              </div>
            </div>
          )}
          {currentContent === "content2" && (
            <div id="promo-special-a-container">
              <p>
                <span className="red-text">20</span> balls
              </p>
              <p style={{ marginTop: "-3.8rem" }}>drawn</p>
              <p style={{ marginTop: "-3.8rem" }}>
                from <span className="red-text">80</span>
              </p>
            </div>
          )}

          {currentContent === "content3" && (
            <div id="promo-special-c-container">
              <div className="red-text" style={{ fontFamily: "good-times-rg" }}>
                pick 3
              </div>
              <div style={{ fontFamily: "good-times-rg" }}>TO</div>
              <div className="red-text" style={{ fontFamily: "good-times-rg" }}>
                pick 10
              </div>
              <div className="squash">games have</div>
              <div style={{ fontFamily: "good-times-rg", color: "yellow" }}>
                MULTIPLE
              </div>
              <div style={{ fontFamily: "good-times-rg", color: "yellow" }}>
                PAY LEVELS
              </div>
              <div className="squash">on other spots.</div>
            </div>
          )}

          {currentContent === "content4" && (
            <div>
              <div className="pick-text">Pick 10</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash ">
                  <p>10</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>5000</p>
                </div>
                <div className="hit-win-table-value squash ">
                  <p>9</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>2500</p>
                </div>
                <div className="hit-win-table-value squash ">
                  <p>8</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>400</p>
                </div>
                <div className="hit-win-table-value squash ">
                  <p>7</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>40</p>
                </div>
                <div className="hit-win-table-value squash ">
                  <p>6</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>12</p>
                </div>
                <div className="hit-win-table-value squash ">
                  <p>5</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>4</p>
                </div>
                <div className="hit-win-table-value squash ">
                  <p>4</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>2</p>
                </div>
              </div>
            </div>
          )}

          {currentContent === "content5" && (
            <div>
              <div className="pick-text">Pick 9</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>9</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>4200</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>8</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>1800</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>7</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>120</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>6</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>18</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>5</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>6</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>4</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>3</p>
                </div>
              </div>
            </div>
          )}

          {currentContent === "content6" && (
            <div>
              <div className="pick-text">Pick 8</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>8</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>3,000</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>7</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>600</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>6</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>68</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>5</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>8</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>4</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>4</p>
                </div>
              </div>
            </div>
          )}
          {currentContent === "content7" && (
            <div>
              <div className="pick-text">Pick 7</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>7</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>2150</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>6</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>120</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>5</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>12</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>4</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>6</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>3</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>1</p>
                </div>
              </div>
            </div>
          )}

          {currentContent === "content8" && (
            <div>
              <div className="pick-text">Pick 6</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>6</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>1800</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>5</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>70</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>4</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>10</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>3</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>1</p>
                </div>
              </div>
            </div>
          )}

          {currentContent === "content9" && (
            <div>
              <div className="pick-text">Pick 5</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>5</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>300</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>4</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>15</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>3</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>3</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>2</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>1</p>
                </div>
              </div>
            </div>
          )}

          {currentContent === "content10" && (
            <div>
              <div className="pick-text">Pick 4</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>4</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>100</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>3</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>8</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>2</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>1</p>
                </div>
              </div>
            </div>
          )}
          {currentContent === "content11" && (
            <div>
              <div className="pick-text">Pick 3</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>3</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>35</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>2</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>3</p>
                </div>
              </div>
            </div>
          )}

          {currentContent === "content12" && (
            <div>
              <div className="pick-text">Pick 2</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>2</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>15</p>
                </div>
              </div>
            </div>
          )}

          {currentContent === "content13" && (
            <div>
              <div className="pick-text">Pick 1</div>
              <div id="hit-win-table-container">
                <div className="hit-win-table-head squash">
                  <p>HITS</p>
                  <p>WIN</p>
                </div>
                <div className="hit-win-table-value squash">
                  <p>1</p>
                  <p style={{ width: "9rem", textAlign: "left" }}>3.8</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GetNumberToShow() {
  const numbersToShow: number[] = [
    3, 50, 70, 20, 35, 42, 33, 21, 55, 1, 9, 45, 73, 79, 13, 58, 64, 80, 14, 19,
  ];
  const animationDuration = 3000; // Adjust this as needed
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

  return {
    drawnNumbers,
    showNumber: numbersToShow[currentIndex],
    currentIndex,
  };
}

function LeftContainer() {
  const selectedNumbers = [
    3, 50, 70, 20, 35, 42, 33, 21, 55, 1, 9, 45, 73, 79, 13, 58, 64, 80, 14, 19,
  ];
  const { showNumber, drawnNumbers, currentIndex } = GetNumberToShow();
  const [numberKey, setNumberKey] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (showNumber === undefined) {
      // Stop the animation here (you may need to use a ref or a state variable)
      // Dispatch the action to set the status to "countdown"
      dispatch(setStatus("countdown"));
      return;
    } else {
      // Delay the increment of numberKey by 2 seconds
      const timeoutId = setTimeout(() => {
        setNumberKey((prevKey) => prevKey + 1);
      }, 2800);

      // Clean up the timeout on component unmount or when showNumber changes
      return () => clearTimeout(timeoutId);
    }
  }, [showNumber, setNumberKey]);

  return (
    <div id="left-container">
      <div id="left-top">
        <span className="draw-text gold-black-text shadow-text">DRAW </span>
        &nbsp; <span className="draw-number-text">6012</span>
        <span
          className="heads white-special-gradient-bg"
          style={{ marginTop: "1rem" }}
        ></span>
      </div>
      <div id="left-center">
        <div className="number-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            return (
              <span
                key={num}
                className={`${
                  drawnNumbers.includes(num)
                    ? "number-selected yellow-gradient-bg"
                    : "number-unselected number-unselected-bg yellow-gradient-bg"
                }`}
              >
                <span className="number-text">{num}</span>
              </span>
            );
          })}
        </div>
        <div className="number-row">
          {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => {
            return (
              <span
                key={num}
                className={`${
                  drawnNumbers.includes(num)
                    ? "number-selected yellow-gradient-bg"
                    : "number-unselected number-unselected-bg yellow-gradient-bg"
                }`}
              >
                <span className="number-text">{num}</span>
              </span>
            );
          })}
        </div>
        <div className="number-row">
          {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((num) => {
            return (
              <span
                key={num}
                className={`${
                  drawnNumbers.includes(num)
                    ? "number-selected yellow-gradient-bg"
                    : "number-unselected number-unselected-bg yellow-gradient-bg"
                }`}
              >
                <span className="number-text">{num}</span>
              </span>
            );
          })}
        </div>
        <div className="number-row">
          {[31, 32, 33, 34, 35, 36, 37, 38, 39, 40].map((num) => {
            return (
              <span
                key={num}
                className={`${
                  drawnNumbers.includes(num)
                    ? "number-selected yellow-gradient-bg"
                    : "number-unselected number-unselected-bg yellow-gradient-bg"
                }`}
              >
                <span className="number-text">{num}</span>
              </span>
            );
          })}
        </div>
        <div className="number-row">
          {[41, 42, 43, 44, 45, 46, 47, 48, 49, 50].map((num) => {
            return (
              <span
                key={num}
                className={`${
                  drawnNumbers.includes(num)
                    ? "number-selected orange-gradient-bg"
                    : "number-unselected number-unselected-bg orange-gradient-bg"
                }`}
              >
                <span className="number-text">{num}</span>
              </span>
            );
          })}
        </div>
        <div className="number-row">
          {[51, 52, 53, 5, 55, 56, 57, 58, 59, 60].map((num) => {
            return (
              <span
                key={num}
                className={`${
                  drawnNumbers.includes(num)
                    ? "number-selected orange-gradient-bg"
                    : "number-unselected number-unselected-bg orange-gradient-bg"
                }`}
              >
                <span className="number-text">{num}</span>
              </span>
            );
          })}
        </div>
        <div className="number-row">
          {[61, 62, 63, 64, 65, 66, 67, 68, 69, 70].map((num) => {
            return (
              <span
                key={num}
                className={`${
                  drawnNumbers.includes(num)
                    ? "number-selected orange-gradient-bg"
                    : "number-unselected number-unselected-bg orange-gradient-bg"
                }`}
              >
                <span className="number-text">{num}</span>
              </span>
            );
          })}
        </div>
        <div className="number-row">
          {[71, 72, 73, 74, 75, 76, 77, 78, 79, 80].map((num) => {
            return (
              <span
                key={num}
                className={`${
                  drawnNumbers.includes(num)
                    ? "number-selected orange-gradient-bg"
                    : "number-unselected number-unselected-bg orange-gradient-bg"
                }`}
              >
                <span className="number-text">{num}</span>
              </span>
            );
          })}
        </div>
      </div>
      <div id="left-bottom">
        <span>
          <img src="/images/keno.png" style={{ height: "4.3rem" }} alt="" />
        </span>
        <span className="heads white-special-gradient-bg"></span>
      </div>
    </div>
  );
}

function OvalRight() {
  const { showNumber, drawnNumbers, currentIndex } = GetNumberToShow();
  const [numberKey, setNumberKey] = useState(0);

  useEffect(() => {
    if (showNumber === undefined) {
      // Stop the animation here (you may need to use a ref or a state variable)
      // Dispatch the action to set the status to "countdown"
      //   dispatch(setStatus("countdown"));
      return;
    } else {
      // Delay the increment of numberKey by 2 seconds
      const timeoutId = setTimeout(() => {
        setNumberKey((prevKey) => prevKey + 1);
      }, 3000);

      // Clean up the timeout on component unmount or when showNumber changes
      return () => clearTimeout(timeoutId);
    }
  }, [showNumber, setNumberKey]);

  return (
    <div id="right-container">
      <div id="draw-counter">
        <span style={{ marginTop: "1rem" }}>{currentIndex}</span>
        <span style={{ marginTop: "-2rem", marginLeft: "2.8rem" }}>/</span>
        <span style={{ marginTop: "-1.5rem", marginLeft: "4.2rem" }}>20</span>
      </div>
      <img
        className="pipe-image-transparent"
        src="/images/pipet.png"
        alt="text"
      />
      <img className="pipe-image" src="/images/pipe.png" alt="" />
      <img
        key={numberKey}
        className="animate-draw-ball ball-image"
        src={`/images/balls/${showNumber}.png`}
        alt=""
      />
    </div>
  );
}

function TransitionAnimation() {
  const dispatch = useDispatch();

  const handleOnEnd = () => {
    dispatch(setStatus("showing"));
  };

  return (
    <div className="overflow-clip overflow-y-hidden">
      {
        <ReactPlayer
          url={"/shuffle.webm"}
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

function DrawsPage() {
  const drawState = useSelector((state: RootState) => state.draw.status);

  return (
    <div>
      <div id="video-parent-container">
        <div id="video-container">
          <div id="main-container">
            {(drawState === "showing" || drawState === "countdown") && (
              <LeftContainer />
            )}
            {drawState === "countdown" && <RightContentWText />}
            {drawState === "showing" && <OvalRight />}
            {drawState === "transition" && <TransitionAnimation />}
          </div>
          <video
            src="/shuffle.webm"
            preload="auto"
            playsInline={true}
            style={{ display: "none", pointerEvents: "none" }}
          ></video>
        </div>
      </div>
    </div>
  );
}

export default DrawsPage;
