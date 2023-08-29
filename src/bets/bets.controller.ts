import { Body, Controller, Post } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsDto } from './dto';

@Controller('bets')
export class BetsController {
    constructor(private betsService: BetsService){}

    @Post('newbet')
    createBet(@Body() dto: BetsDto){
        this.createBet(dto)   
    }
     
    

}
