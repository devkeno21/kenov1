import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto'

@Injectable()
export class RngService {
    newRNG(count:number=20, minValue:number=0, maxValue:number=80):number[]{
        let selected = [];
        const rangeSize = Math.abs(maxValue - minValue)

        while(selected.length < count){
            const randomBuffer = crypto.randomBytes(Math.ceil(Math.log2(rangeSize) / 8));
            const randomNum = randomBuffer.readUIntLE(0, randomBuffer.length) % rangeSize;
            
            if (selected.indexOf(randomNum) === -1){
                selected.push(randomNum);
            }            
        }

        return selected
    }
}
