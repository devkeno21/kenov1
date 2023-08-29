import { Module } from '@nestjs/common';
import { DrawsService } from './draws.service';
import { DrawsController } from './draws.controller';
import { RngModule } from 'src/rng/rng.module';

@Module({
  imports: [RngModule],
  providers: [DrawsService],
  controllers: [DrawsController]
})
export class DrawsModule {}
