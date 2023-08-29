import { Injectable } from '@nestjs/common';
import { BetsDto } from './dto';

@Injectable()
export class BetsService {

    createBet(dto: BetsDto){
        console.log("create bets");
    }
}
 