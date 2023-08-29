import { Injectable } from '@nestjs/common';
import {db} from 'db'
import { RngService } from 'src/rng/rng.service';
import { NewUser, User, users } from 'db/schema';
@Injectable()
export class DrawsService {
    constructor(private rngService: RngService){}

    async newDraw(){
        const draw = this.rngService.newRNG();
        // await db.insert('users').values({
        //     fullName: 'John Doe'
        // })
        
 
        const insertUser = async (user: NewUser) => {
        return db.insert(users).values(user);
        }
        
        const newUser: NewUser = {fullName: "John Doe"};
        await insertUser(newUser);
        console.log(draw)

        // const oldUser: User[] = await db.select().from(users)
        
        return {
            numbersDrawn: draw,
            // user: oldUser,
            newuser: newUser
        };
    }
}


