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
import {
  Button,
  Loader,
  LoadingOverlay,
  Modal,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

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
  const [lastGameNo, setLastGameNo] = useState<number>();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const { mutate: placeBet, isLoading: isBetPlacing } =
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
          toast.error("Failed to place bet: Please try again later.");
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

  const combinedNumbers: number[] = bets.reduce<number[]>(
    (accumulator, bet) => {
      return accumulator.concat(bet.numbersPicked);
    },
    [],
  );

  const totalWagerAmount = bets.reduce((sum, bet) => sum + bet.wagerAmount, 0);

  const {
    data: lastDrawID,
    isLoading: isLastDrawLoading,
    refetch,
  } = api.draws.getLastDraw.useQuery();

  useEffect(() => {
    if (lastDrawID) {
      setLastGameNo(lastDrawID?.gameNumber + 1);
    }
  }, [lastDrawID?.gameNumber, isLastDrawLoading, lastDrawID]);

  if (isLastDrawLoading || typeof lastGameNo !== "number") {
    return <Loader color="white" />;
  }

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
                    <p className="text-xs">2023/10/07 ID{lastGameNo}</p>
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
          <Button
            size="md"
            loading={isBetPlacing}
            onClick={() => {
              placeBet({
                data: bets,
                cashier_id: cashier,
                totalWager: totalWagerAmount,
                picked_list: combinedNumbers,
                gameNumber: lastGameNo,
              });
            }}
            className="flex w-9/12 flex-row items-center justify-center gap-1 bg-green-600 px-2 py-2 text-white hover:opacity-90"
          >
            <p>PLACE BET</p>
            <span className="rounded-sm bg-green-500 bg-opacity-50 p-2">
              Br {bets.reduce((sum, bet) => sum + bet.wagerAmount, 0)}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

const ReedemAndCancelModal = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [mode, setMode] = useState<"reedem" | "cancel">("reedem");
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const [getTicket, setGetTicket] = useState<boolean>(false);
  const [cancelTicket, setCancelTicket] = useState<boolean>(false);
  const {
    data: ticketInfo,
    isFetching: ticketInfoLoading,
    isError: isTicketInfoError,
    isSuccess: isTicketInfoSuccess,
  } = api.tickets.getTicketByTicketNumber.useQuery(
    { ticket_num: parseInt(ticketNumber) },
    { enabled: getTicket },
  );

  const { mutate: reedemTicket, isLoading: reedemTicketLoading } =
    api.tickets.redeemTicket.useMutation();

  useEffect(() => {
    if (isTicketInfoError || isTicketInfoSuccess) {
      console.log(ticketInfo);
      setGetTicket(false);
    }
  }, [isTicketInfoError, isTicketInfoSuccess, ticketInfo]);

  return (
    <>
      <Modal
        className="bg-white text-black"
        opened={opened}
        onClose={() => {
          setTicketNumber("");
          close();
        }}
        title={`${mode === "reedem" ? "Reedem" : "Cancel"}`}
        size="75%"
        centered
        closeOnClickOutside
      >
        <div className="flex w-full flex-row rounded-b-md bg-white p-6">
          <div className="flex w-1/3 flex-col border-r px-6">
            <p className="text-orange-500">Enter betslip code or scan</p>
            <div className="flex flex-row items-center gap-3">
              <input
                type="text"
                onChange={(e) => setTicketNumber(e.target.value)}
                className="w-full rounded border border-gray-400 px-4 py-1.5 outline-none focus:shadow-lg"
                value={ticketNumber}
              />
            </div>
            <div className="mt-4 flex w-full flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div key={n} className="w-1/3 p-3">
                  <button
                    onClick={() => setTicketNumber((prevNum) => prevNum + n)}
                    className="h-10 w-full rounded-md bg-orange-500 py-2 text-center text-white hover:shadow-md"
                  >
                    {n}
                  </button>
                </div>
              ))}
              <div className="w-1/3 p-3"></div>
              <div className="w-1/3 p-3">
                <button
                  onClick={() => setTicketNumber((prevNum) => prevNum + 0)}
                  className="h-10 w-full rounded-md bg-orange-500 py-2 text-center text-white hover:shadow-md"
                >
                  0
                </button>
              </div>
              <div className="w-1/3 p-3">
                <button className="flex h-10 w-full flex-col items-center justify-center rounded-md bg-orange-500 py-2 text-center text-white hover:shadow-md">
                  <Image height={20} width={20} alt="" src="/backspace.svg" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-row justify-between px-4">
              <button
                onClick={() => setTicketNumber("")}
                className="h-10 rounded bg-gray-300 px-6 text-gray-800 hover:bg-gray-400"
              >
                Clear
              </button>
              <Button
                loading={ticketInfoLoading}
                onClick={() => setGetTicket(true)}
                className="h-10 rounded bg-orange-500 px-6 text-white hover:shadow-md"
              >
                Enter
              </Button>
            </div>
            <div></div>
          </div>
          {ticketInfoLoading && (
            <div className="w-2/3 p-4">
              <Loader color="black" />
            </div>
          )}
          {ticketInfo && isTicketInfoSuccess && (
            <div className="w-2/3 p-4">
              <div>
                <div>
                  <div>
                    <div className="h-auto max-h-64 w-full overflow-y-auto p-2">
                      <table className="w-full border border-gray-400 text-sm text-gray-700">
                        <thead>
                          <tr className="bg-gray-100 font-semibold">
                            <td className="p-2">No</td>
                            <td className="p-2">Game</td>
                            <td className="p-2">Picks</td>
                            <td className="p-2">Game Id</td>
                            <td className="p-2">Stake</td>
                            <td className="p-2">Win</td>
                            <td className="p-2">Status</td>
                          </tr>
                        </thead>
                        <tbody>
                          {ticketInfo?.map((ticket, index) => {
                            return (
                              <tr
                                key={index}
                                className="border-t border-t-gray-400"
                              >
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3"> Keno </td>
                                <td className="p-3">
                                  {typeof ticket.picked_list === "string"
                                    ? (
                                        JSON.parse(
                                          ticket.picked_list,
                                        ) as string[]
                                      ).join(", ")
                                    : ""}
                                </td>
                                <td className="p-3">{ticket.game_number}</td>
                                <td className="p-3">{ticket.wager_amount}</td>
                                <td className="p-3">
                                  {ticket.reedeemed_amount}
                                </td>
                                <td className="p-3">LOST</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex flex-row justify-between gap-2 rounded-md bg-gray-100 p-1.5 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <p className="font-semibold">Gross Stake</p>
                        <p>
                          {ticketInfo?.reduce(
                            (sum, ticket) => sum + ticket.wager_amount,
                            0,
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold">Net Stake</p>
                        <p>
                          {ticketInfo?.reduce(
                            (sum, ticket) => sum + ticket.wager_amount,
                            0,
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold">Gross Winning</p>
                        <p>0</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold">Net Winning</p>
                        <p>0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {mode === "reedem" && (
                <div>
                  <div className="flex flex-row items-end gap-4">
                    <Button className="mt-4 flex h-12 flex-row items-center gap-2 rounded bg-green-600 px-8 py-2 font-semibold text-white hover:bg-green-700">
                      Redeem{" "}
                    </Button>
                    <p className="text-lg font-semibold text-gray-700">
                      Not a winning ticket!
                    </p>
                  </div>
                </div>
              )}
              {mode === "cancel" && ticketInfo[0]?.hits !== null && (
                <Button className="mt-4 flex h-12 flex-row items-center gap-2 rounded bg-green-600 px-8 py-2 font-semibold text-white hover:bg-green-700">
                  Cancel{" "}
                </Button>
              )}
              {mode === "cancel" && ticketInfo[0]?.hits === null && (
                <p className="mt-4">You cant cancel on passed game.</p>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Button
        onClick={() => {
          setMode("cancel");
          open();
        }}
        className="mr-2 rounded-md bg-yellow-500 text-lg text-white"
        size="md"
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          setMode("reedem");
          open();
        }}
        className="rounded-md bg-green-600 text-lg text-white"
        size="md"
      >
        Reedem
      </Button>
    </>
  );
};

const Keno = () => {
  const [picked, setPicked] = useState<number[]>([]);
  const [numbersToPass, setNumbersToPass] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

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
        <div className="ml-auto mt-4 text-white">
          <ReedemAndCancelModal />
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
                onClick={() => {
                  updateNumbers({ picked });
                  setModalVisible(true);
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
