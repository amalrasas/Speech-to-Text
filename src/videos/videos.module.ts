import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
