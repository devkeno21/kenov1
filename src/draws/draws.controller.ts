import { Controller, Post } from '@nestjs/common';
import { DrawsService } from './draws.service';

@Controller('draws')
export class DrawsController {
    constructor(private drawsService: DrawsService){}

    @Post('new')
    newDraw(){
        return this.drawsService.newDraw()
    }

    getResults(){

    }
}

