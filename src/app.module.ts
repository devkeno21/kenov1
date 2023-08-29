import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BetsModule } from './bets/bets.module';
import { DrawsModule } from './draws/draws.module';
import { RngModule } from './rng/rng.module';
import { OddsModule } from './odds/odds.module';

@Module({
  imports: [BetsModule, DrawsModule, RngModule, OddsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
