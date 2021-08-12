import { Injectable } from "@nestjs/common";
import { Agent } from "https";
import { AppConfig } from "./app.config";

@Injectable()
export class AppConfigService {
  constructor(private cfg: AppConfig) { }

  get accountAddresses(): string[] {
    return this.cfg.account.addresses;
  }

  get assetPaths(): string[] {
    return this.cfg.account.assetPaths;
  }

  get apeBoardBaseUrl(): string {
    return this.cfg.http.apeboard.baseUrl
  }

  get laMetricBaseUrl(): string {
    return this.cfg.http.lametric.baseUrl
  }

  get apeBoardHeaders(): { headers: any } {
    const headers = Object.assign({}, this.cfg.http.apeboard.headers.base, { "passcode": this.cfg.http.apeboard.headers.passcode, "ape-secret": this.cfg.http.apeboard.headers.secret });
    return { headers };
  }

  get laMetricHeaders(): { headers: any, httpsAgent: Agent } {
    return { headers: this.cfg.http.lametric.headers.base, httpsAgent: new Agent({ rejectUnauthorized: false }) };
  }

  get laMetricHeadersAuthorized(): { headers: any, httpsAgent: Agent } {
    let headers = this.cfg.http.lametric.headers.base
    headers["authorization"] = this.cfg.http.lametric.headers.auth;
    return { headers, httpsAgent: new Agent({ rejectUnauthorized: false }) };
  }

  get laMetricPaths(): { widgetPath: string, notificationsPath: string } {
    return { widgetPath: this.cfg.http.lametric.paths.widgetPath, notificationsPath: this.cfg.http.lametric.paths.notificationsPath };
  }

  get settings(): { anchor: { tvlLimitHigh: number, tvlLimitLow: number }, lametric: { goalUST: number } } {
    return this.cfg.settings; 
  }
}
