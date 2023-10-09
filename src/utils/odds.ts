type KenoMapping = Record<number, Record<number, number>>;
  
 export const oddsMapping: KenoMapping = {
    1: { 1: 3.8 },
    2: { 2: 15 },
    3: { 2: 3, 3: 35 },
    4: { 2: 1, 3: 8, 4: 100 },
    5: { 2: 1, 3: 3, 4: 15, 5: 300 },
    6: { 3: 1, 4: 10, 5: 70, 6: 1800 },
    7: { 3: 1, 4: 6, 5: 12, 6: 120, 7: 2150 },
    8: { 4: 4, 5: 8, 6: 68, 7: 600, 8: 3000 },
    9: { 4: 3, 5: 6, 6: 18, 7: 120, 8: 1800, 9: 4200 },
    10: { 4: 2, 5: 4, 6: 12, 7: 40, 8: 400, 9: 2500, 10: 5000 },
  };
  
  export const getWinningsFromOdds = (num_of_picks: number, hits: number) => {
    if (oddsMapping[num_of_picks]?.[hits] !== undefined) {
      return oddsMapping[num_of_picks]?.[hits];
    } else {
      return 0;
    }
  };