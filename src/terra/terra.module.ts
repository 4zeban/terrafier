import { HttpModule, HttpService } from '@nestjs/axios';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { TerraService } from './terra.service'
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from 'src/config/app.config.service';
import { TerraHttpService } from './terra.http.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  providers: [TerraService, DbService, TerraHttpService, AppConfigService],
})
export class TerraModule implements OnModuleInit {

  constructor(private httpService: HttpService) { }

  public onModuleInit() {

    const logger = new Logger("Axios");

    // Add request interceptor and response interceptor to log request infos
    const axios = this.httpService.axiosRef;
    axios.interceptors.request.use(function (config) {
      // Please don't tell my Typescript compiler...
      config['metadata'] = { ...config['metadata'], startDate: new Date() };
      
      return config;
    });
    axios.interceptors.response.use(
      (response) => {
        const { config } = response;
        config['metadata'] = { ...config['metadata'], endDate: new Date() };
        const duration = config['metadata'].endDate.getTime() - config['metadata'].startDate.getTime();

        // Log some request infos (you can actually extract a lot more if you want: the content type, the content size, etc.)
        logger.debug(`${config && config.method && config.method && config.method.toUpperCase()} ${config.url} ${duration}ms`);

        return response;
      },
      (err) => {
        logger.error(`/${err.request.method} ${err.config.url} - ${err}`, JSON.stringify(err.request._header));

        // Don't forget this line like I did at first: it makes your failed HTTP requests resolve with "undefined" :-(
        return Promise.reject(err);
      });

    this.httpService.axiosRef.interceptors.request.use((req) => {
      logger.debug('request', req);
      return req;
    })

    this.httpService.axiosRef.interceptors.response.use((response) => {
      logger.debug(`GET Response:\n${JSON.stringify(response.data)}`);
      return response;
    });
  }
}