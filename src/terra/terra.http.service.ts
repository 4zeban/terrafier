import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent } from 'https';
import { lastValueFrom, map } from 'rxjs';
import { AppConfigService } from 'src/config/app.config.service';

@Injectable()
export class TerraHttpService {

    constructor(private httpService: HttpService, private cfg: AppConfigService) {
    }

    async getAsset(assetPath: string, address: string): Promise<any> {
        let url = `${this.cfg.apeBoardBaseUrl}/${assetPath}/${address}`;
        return await lastValueFrom(this.httpService.get(url, this.cfg.apeBoardHeaders).pipe(map(response => response.data)));
    }

    async postLametric(data: any): Promise<any> {
        let url = `${this.cfg.laMetricBaseUrl}${this.cfg.laMetricPaths.widgetPath}`;
        return await lastValueFrom(this.httpService.post(url, data, this.cfg.laMetricHeaders).pipe(map(response => response.data)));
    }

    async postLametricNotification(data: any): Promise<any> {
        let url = `${this.cfg.laMetricBaseUrl}${this.cfg.laMetricPaths.notificationsPath}`;
        return await lastValueFrom(this.httpService.post(url, data, this.cfg.laMetricHeadersAuthorized).pipe(map(response => response.data)));
    }

}
