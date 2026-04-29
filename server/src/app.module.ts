import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MicrosoftCalendarController } from './microsoft/microsoft-calendar.controller';
import { MicrosoftCalendarService } from './microsoft/microsoft-calendar.service';

@Module({
  imports: [],
  controllers: [AppController, MicrosoftCalendarController],
  providers: [AppService, MicrosoftCalendarService],
})
export class AppModule {}
