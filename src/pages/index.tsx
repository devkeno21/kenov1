import React, { useEffect } from "react";
import { useState } from "react";
import { api } from "~/utils/api";
import { useSelector } from "react-redux";
import { RootState } from "~/store/store";
import { UserButton, useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { getWinningsFromOdds } from "~/utils/odds";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import toast from "react-hot-toast";


type DrawNumbers = Record<number, string>;

type ModalProps = {
  numbers: number[];
  cashier: string;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};
type Batch = number[];
type NumberHistory = Batch[];
type Bets = {
  numbersPicked: number[];
  wagerAmount: number;
  odds: number;
}[];

const TicketContent = ({ bets }: { bets: Bets }) => {
  return (
    <div className="w-1/3">
      <div className="flex flex-col">
        <div className="ml-auto justify-items-end">
          <p>0000001</p>
          <p>61aw61</p>
          <p>61aw61.cashier1</p>
          <p>2023/08/15</p>
        </div>
        <div>
          {bets.map((bet, index) => {
            return (
              <div
                key={index}
                className="flex flex-row items-center justify-between"
              >
                <div>
                  <p className="font-medium">Win</p>
                  <p>Keno 2023/08/16 09:22:25 #5995</p>
                  <p>
                    {bet.numbersPicked.join(", ")} {bet.odds}
                  </p>
                </div>
                <div>
                  <p className="font-bold">Br {bet.wagerAmount}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex w-fit items-center justify-center">
          <Barcode value="00063247964923" />
        </div>
      </div>
    </div>
  );
};

function BetModal({ numbers, setModalVisible, cashier }: ModalProps) {
  const [numberHistory, setNumberHistory] = useState<number[][]>([]);
  const [bets, setBets] = useState<Bets>([]);
  const [isOptionsVisibile, setIsOptionsVisibile] = useState<boolean>(false);

  const componentRef = React.useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const { mutate: placeBet, isLoading: isPosting } =
    api.bets.placeBet.useMutation({
      onSuccess: () => {
        toast.success("Bet Placed Successfully");
        handlePrint();
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage?.[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to post: Please try again later.");
        }
      },
    });

  useEffect(() => {
    if (numbers.length > 0) {
      // Append newly incoming numbers as a new batch
      setNumberHistory((prevHistory) => [...prevHistory, numbers]);

      // Create a new bet object for the batch and add it to the bets array
      const newBet = {
        numbersPicked: numbers,
        wagerAmount: 10,
        odds: getWinningsFromOdds(numbers.length, numbers.length)!,
      }; // Customize wagerAmount and odds as needed
      setBets((prevBets) => [...prevBets, newBet]);
    }
  }, [numbers]);

  const deleteBatch = (batchIndex: number) => {
    // Create copies of numberHistory and bets arrays
    const updatedNumberHistory = [...numberHistory];
    const updatedBets = [...bets];

    // Remove the batch to be deleted from both arrays
    updatedNumberHistory.splice(batchIndex, 1);
    updatedBets.splice(batchIndex, 1);

    // Update state with the modified arrays
    setNumberHistory(updatedNumberHistory);
    setBets(updatedBets);
  };

  const modifyBet = ({
    batchIndex,
    amount,
    mode,
  }: {
    batchIndex: number;
    amount: number;
    mode: "increase" | "set" | "decrease";
  }) => {
    // Create copies of numberHistory and bets arrays
    const updatedNumberHistory = [...numberHistory];
    const updatedBets: Bets = [...bets];

    if (updatedBets[batchIndex] && mode === "set") {
      updatedBets[batchIndex] = {
        ...updatedBets[batchIndex],
        wagerAmount: amount,
      } as Bets[number];
    } else if (updatedBets[batchIndex] && mode === "increase") {
      updatedBets[batchIndex] = {
        ...updatedBets[batchIndex],
        wagerAmount: (updatedBets[batchIndex]?.wagerAmount ?? 10) + amount,
      } as Bets[number];
    } else if (updatedBets[batchIndex] && mode === "decrease") {
      updatedBets[batchIndex] = {
        ...updatedBets[batchIndex],
        wagerAmount: (updatedBets[batchIndex]?.wagerAmount ?? 10) - amount,
      } as Bets[number];
    }

    setBets(updatedBets);
  };

  const modifyAllBets = ({ amount }: { amount: number }) => {
    // Create copies of numberHistory and bets arrays
    const updatedNumberHistory = [...numberHistory];
    const updatedBets = [...bets];

    updatedBets.forEach((bet) => {
      bet.wagerAmount = bet.wagerAmount + amount;
    });

    setBets(updatedBets);
  };

  console.log({ numberHistory });
  console.log({ bets });

  return (
    <div className="ml-auto mt-10 flex w-3/12 flex-col bg-black px-1 pb-4 text-white">
      <div>
        {/* <button
          onClick={handlePrint}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Print Ticket
        </button> */}
        <div style={{ display: "none" }}>
          <div ref={componentRef}>
            <TicketContent bets={bets} />
          </div>
        </div>
      </div>

      <div className="mx-auto flex flex-row rounded border-2 border-amber-600 text-xs text-white">
        <div className="bg-amber-600 px-4">SINGLE</div>
        <div className="px-4">MULTIPLES</div>
      </div>
      <div></div>
      {numberHistory.map((batch, batchIndex) => (
        <div
          key={batchIndex}
          className="flex flex-col"
          onClick={() => setIsOptionsVisibile(true)}
        >
          <div className="mt-4 flex w-full flex-col pr-4">
            <div className="max-h-[30rem] overflow-y-auto">
              <div className="mt-0.5 w-full rounded-sm bg-stone-400 bg-opacity-80 p-1">
                <div className="flex flex-row items-start">
                  <div className="w-1/12 p-0.5">
                    <p className="text-gray-200"></p>
                    <Image src="/8ball.svg" alt="" height={20} width={20} />
                  </div>

                  <div className="flex w-10/12 flex-col px-1 text-gray-100">
                    <p className="text-xs">Win</p>
                    <div className="flex flex-row items-start gap-1">
                      <div className="flex flex-row text-xs">
                        {batch.join(",")}
                      </div>
                      <span className="rounded bg-amber-500 px-0.5 text-xs text-black">
                        {bets[batchIndex]?.odds}
                      </span>
                    </div>
                    <p className="text-xs">2023/10/07 ID5975</p>
                    <div className="flex flex-row">
                      <button
                        onClick={() =>
                          modifyBet({
                            batchIndex: batchIndex,
                            amount: 10,
                            mode: "decrease",
                          })
                        }
                        className="rounded-l border border-gray-300 bg-stone-400 bg-opacity-80 px-2 font-bold text-gray-300 hover:opacity-90"
                      >
                        -{" "}
                      </button>
                      <input
                        className="w-48 border border-gray-300 text-right text-sm text-black outline-none"
                        type="number"
                        value={bets[batchIndex]?.wagerAmount}
                        onChange={(e) =>
                          modifyBet({
                            batchIndex: batchIndex,
                            amount: e.currentTarget.valueAsNumber,
                            mode: "set",
                          })
                        }
                      />
                      <button
                        onClick={() =>
                          modifyBet({
                            batchIndex: batchIndex,
                            amount: 10,
                            mode: "increase",
                          })
                        }
                        className="rounded-r border border-gray-300 bg-stone-400 bg-opacity-80 px-2 font-bold text-gray-300 hover:opacity-90"
                      >
                        +{" "}
                      </button>
                    </div>

                    {isOptionsVisibile && (
                      <div
                        key={batchIndex}
                        className="mt-2 flex w-full flex-row items-start gap-2"
                      >
                        <button
                          onClick={() =>
                            modifyBet({
                              batchIndex: batchIndex,
                              amount: 10,
                              mode: "set",
                            })
                          }
                          className="flex w-1/4 flex-col items-center rounded bg-orange-600 px-1 py-0.5 text-center text-white hover:opacity-90"
                        >
                          <p className="w-full text-left text-xs">Br</p>
                          <p className="flex flex-row justify-center">10</p>
                        </button>
                        <button
                          onClick={() =>
                            modifyBet({
                              batchIndex: batchIndex,
                              amount: 20,
                              mode: "set",
                            })
                          }
                          className="flex w-1/4 flex-col items-center rounded bg-pink-600 px-1 py-0.5 text-center text-white hover:opacity-90"
                        >
                          <p className="w-full text-left text-xs">Br</p>
                          <p className="flex flex-row justify-center">20</p>
                        </button>
                        <button
                          onClick={() =>
                            modifyBet({
                              batchIndex: batchIndex,
                              amount: 50,
                              mode: "set",
                            })
                          }
                          className="flex w-1/4 flex-col items-center rounded bg-purple-700 px-1 py-0.5 text-center text-white hover:opacity-90"
                        >
                          <p className="w-full text-left text-xs">Br</p>
                          <p className="flex flex-row justify-center">50</p>
                        </button>
                        <button
                          onClick={() =>
                            modifyBet({
                              batchIndex: batchIndex,
                              amount: 100,
                              mode: "set",
                            })
                          }
                          className="flex w-1/4 flex-col items-center rounded bg-blue-400 px-1 py-0.5 text-center text-white hover:opacity-90"
                        >
                          <p className="w-full text-left text-xs">Br</p>
                          <p className="flex flex-row justify-center">100</p>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex w-1/12 flex-row justify-end p-0.5">
                    <button
                      className="text-white hover:opacity-80"
                      onClick={() => deleteBatch(batchIndex)}
                    >
                      <Image src="/close.svg" height={20} width={20} alt="" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="mx-auto flex w-8/12 flex-row justify-end">
                    <p className="text-sm font-bold text-black">
                      To Win: Br{" "}
                      {(bets[batchIndex]?.odds ?? 0) *
                        (bets[batchIndex]?.wagerAmount ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-2 flex w-full flex-row items-start gap-2">
        <button
          onClick={() => modifyAllBets({ amount: 10 })}
          className="flex w-1/4 flex-col items-center rounded bg-orange-600 px-1 py-0.5 text-center text-white hover:opacity-90"
        >
          <p className="w-full text-left text-xs">Br</p>
          <p className="flex flex-row justify-center">10</p>
        </button>
        <button
          onClick={() => modifyAllBets({ amount: 20 })}
          className="flex w-1/4 flex-col items-center rounded bg-pink-600 px-1 py-0.5 text-center text-white hover:opacity-90"
        >
          <p className="w-full text-left text-xs">Br</p>
          <p className="flex flex-row justify-center">20</p>
        </button>
        <button
          onClick={() => modifyAllBets({ amount: 50 })}
          className="flex w-1/4 flex-col items-center rounded bg-purple-700 px-1 py-0.5 text-center text-white hover:opacity-90"
        >
          <p className="w-full text-left text-xs">Br</p>
          <p className="flex flex-row justify-center">50</p>
        </button>
        <button
          onClick={() => modifyAllBets({ amount: 100 })}
          className="flex w-1/4 flex-col items-center rounded bg-blue-400 px-1 py-0.5 text-center text-white hover:opacity-90"
        >
          <p className="w-full text-left text-xs">Br</p>
          <p className="flex flex-row justify-center">100</p>
        </button>
      </div>

      <div className="mt-2 flex flex-col text-white">
        <p className="ml-6">STAKE</p>
        <div className="ml-6 flex flex-row">
          <button className="rounded-l border border-gray-300 bg-stone-400 bg-opacity-80 px-2 font-bold text-gray-300 hover:opacity-70">
            -{" "}
          </button>
          <input
            className="w-56 border border-gray-300 text-right text-sm text-black outline-none"
            type="number"
          />
          <button className="rounded-r border border-gray-300 bg-stone-400 bg-opacity-80 px-2 font-bold text-gray-300 hover:opacity-70">
            +{" "}
          </button>
        </div>
        <div className="mt-2 flex flex-row justify-between px-4">
          <p>TOTAL STAKE</p>
          <p>Br {bets.reduce((sum, bet) => sum + bet.wagerAmount, 0)}</p>
        </div>
        <div className="mt-1 flex flex-row justify-between px-4">
          <p className="text-lg">TOTAL TO WIN</p>
          <p>
            Br {bets.reduce((sum, bet) => sum + bet.wagerAmount * bet.odds, 0)}
          </p>
        </div>
        <div className="mt-4 flex flex-row gap-0.5 px-0.5">
          <button
            onClick={() => {
              setNumberHistory([]);
              setModalVisible(false);
            }}
            className="w-3/12 bg-red-400 py-2 text-center text-white hover:bg-opacity-90"
          >
            <p>CLEAR</p>
          </button>
          <button
            onClick={() => {
              placeBet({ data: bets, cashier_id: cashier, total_redeemed: 0 });
            }}
            className="flex w-9/12 flex-row items-center justify-center gap-1 bg-green-600 px-2 py-2 text-white hover:opacity-90"
          >
            <p>PLACE BET</p>
            <span className="rounded-sm bg-green-500 bg-opacity-50 p-2">
              Br {bets.reduce((sum, bet) => sum + bet.wagerAmount, 0)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}


const Keno = () => {
  const [picked, setPicked] = useState<number[]>([]);
  const [numbersToPass, setNumbersToPass] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
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
      <div className="flex text-xl" key={i}>
        {rowNumbers.map((number) => (
          <button
            className={`hover:cursor-pointerer:text-white m-1 ml-4 mt-1 flex h-16 w-16 items-center justify-center rounded-full border p-2 text-center text-gray-100 hover:bg-green-900 ${
              picked.includes(number)
                ? "bg-green-900 text-white"
                : "bg-orange-700"
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

  const minuteState = useSelector((state: RootState) => state.timer.minutes);
  const secState = useSelector((state: RootState) => state.timer.seconds);

  const [minute, setMinute] = useState<string>();
  const [second, setSecond] = useState<string>();

  if (typeof window !== "undefined") {
    const minute =
      localStorage.getItem("minutes") == null
        ? "0"
        : localStorage.getItem("minutes")!;
    const seconds =
      localStorage.getItem("seconds") == null
        ? "0"
        : localStorage.getItem("seconds")!;
    // setMinute(minute)
    // setSecond(seconds)
  }
  // console.log(minute);

  const { isLoaded, isSignedIn, user } = useUser();

  // In case the user signs out while on the page.
  if (!isLoaded || !user || typeof user.username !== "string") {
    return null;
  }

  console.log(user.username);

  const updateNumbers = ({ picked }: { picked: number[] }) => {
    setNumbersToPass(picked);
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="flex min-w-full">
        <div className="ml-auto text-white">
        </div>
        <div className="ml-auto mr-4 mt-4">
          <UserButton
            appearance={{
              elements: {
                userButtonOuterIdentifier: "text-white",
                userButtonPopoverFooter: "hidden",
              },
            }}
            showName={true}
            afterSignOutUrl="/"
          />
        </div>
      </header>
      <div className="flex">
        <div className="flex flex-col items-start pt-24 text-white">{rows}</div>
        <div className="flex max-w-xs flex-col pt-24">
          {minuteState}:{secState}
          <button
            className="m-2 h-fit w-fit rounded-lg bg-red-700 px-4 py-2 text-white"
            onClick={() => setPicked([])}
          >
            Clear
          </button>
          <div>
            {picked.length === 0 && (
              <div className="relative z-10 mt-5 flex w-48 flex-row items-center rounded bg-stone-500 text-white">
                <div className="-ml-3 h-6 w-6 rotate-45 bg-stone-500 px-3"></div>
                <div className="h-full p-4 text-sm">
                  Pick 1 to 10 numbers from 80. Pick which numbers you think
                  will be randomly selected. The more you pick the more you
                  could win.
                </div>
              </div>
            )}{" "}
            {picked.length > 0 && (
              <button
                className="m-2 h-fit cursor-pointer rounded-lg bg-green-700 px-4 py-2 text-white"
                // disabled={picked.length === 0}
                // onClick={() => drawNumbers()}
                onClick={() => {
                  updateNumbers({ picked });
                  setModalVisible(true);
                  // updateBet({ ticketModalVisible(true);Number: 10, data: {reedeemedAmount: 100000}})
                  // deleteBet({ ticketNumber: 3 });
                  // mutate({ data: { gameNumber: 6, hits: 3, isReedeemed: 0, odds: 5, reedeemedAmount: 10, wagerAmount: 10 }})
                }}
              >
                ADD TO BETSLIP
              </button>
            )}
          </div>
        </div>
        {modalVisible && (
          <BetModal
            setModalVisible={setModalVisible}
            numbers={numbersToPass}
            cashier={user.username}
          />
        )}
      </div>
    </div>
  );
};

export default Keno;
