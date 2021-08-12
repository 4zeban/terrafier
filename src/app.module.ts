import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TerraModule } from './terra/terra.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from './http.config.service';
import { DbService } from './db/db.service';
import { TypedConfigModule, fileLoader } from 'nest-typed-config';
import { AppConfig } from './config/app.config';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: AppConfig,
      load: fileLoader({ /* options */ }),
  }),    
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
    TerraModule,
    EventEmitterModule.forRoot({
    // set this to `true` to use wildcards
    wildcard: false,
    // the delimiter used to segment namespaces
    delimiter: '.',
    // set this to `true` if you want to emit the newListener event
    newListener: false,
    // set this to `true` if you want to emit the removeListener event
    removeListener: false,
    // the maximum amount of listeners that can be assigned to an event
    maxListeners: 10,
    // show event name in memory leak message when more than maximum amount of listeners is assigned
    verboseMemoryLeak: false,
    // disable throwing uncaughtException if an error event is emitted and it has no listeners
    ignoreErrors: false,
  }), ScheduleModule.forRoot() ],
  controllers: [AppController],
  providers: [AppService, DbService],
})
export class AppModule {} 
