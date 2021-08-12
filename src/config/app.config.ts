import { Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested, IsObject, IsNumber, IsArray } from 'class-validator';

export class AccountConfig {
  @IsDefined()
  @IsArray()
  public readonly addresses!: string[];
 
  @IsDefined()
  @IsArray()
  public readonly assetPaths!: string[];
}

export class LaMetricSettingsConfig {
  @IsNumber()
  public readonly goalUST!: number;
}

export class AnchorSettingsConfig {
  @IsDefined()
  @IsNumber()
  public readonly tvlLimitHigh!: number;
  
  @IsDefined()
  @IsNumber()
  public readonly tvlLimitLow!: number;
}

export class ApeboardHeadersConfig {
  @IsObject()
  @IsDefined()
  public readonly base!: any;
  
  @IsDefined()
  @IsString()
  public readonly secret!: string;
  
  @IsString()
  @IsDefined()
  public readonly passcode!: string;
}

export class ApeBoardConfig {
  @Type(() => ApeboardHeadersConfig)
  @ValidateNested()
  @IsDefined()
  public readonly headers!: ApeboardHeadersConfig;
  
  @IsString()
  @IsDefined()
  public readonly baseUrl!: string;
}

export class LaMetricPaths {
  @IsDefined()
  @IsObject()
  public readonly base!: any;
  
  @IsDefined()
  @IsString()
  public readonly auth!: string;
}

export class LaMetricHeadersConfig {
  @IsDefined()
  @IsObject()
  public readonly base!: any;
  
  @IsDefined()
  @IsString()
  public readonly auth!: string;
}

export class LaMetricPathsConfig {
  @IsDefined()
  @IsString()
  public readonly widgetPath!: any;
  
  @IsDefined()
  @IsString()
  public readonly notificationsPath!: string;
}

export class LaMetricConfig {
  @Type(() => LaMetricHeadersConfig)
  @ValidateNested()
  @IsDefined()
  public readonly headers!: LaMetricHeadersConfig;
  
  @Type(() => LaMetricPathsConfig)
  @ValidateNested()
  @IsDefined()
  public readonly paths!: LaMetricPathsConfig;
  
  @IsDefined()
  @IsString()
  public readonly baseUrl!: string;
}

export class SettingsConfig {
  @Type(() => AnchorSettingsConfig)
  @ValidateNested()
  @IsDefined()
  public readonly anchor!: AnchorSettingsConfig;
  
  @Type(() => LaMetricSettingsConfig)
  @ValidateNested()
  @IsDefined()
  public readonly lametric!: LaMetricSettingsConfig;
}

export class HttpConfig {
  @Type(() => ApeBoardConfig)
  @ValidateNested()
  @IsDefined()
  public readonly apeboard!: ApeBoardConfig;
  
  @Type(() => LaMetricConfig)
  @ValidateNested()
  @IsDefined()
  public readonly lametric!: LaMetricConfig;
}

export class AppConfig {
  @Type(() => HttpConfig)
  @ValidateNested()
  @IsDefined()
  public readonly http!: HttpConfig;

  @Type(() => AccountConfig)
  @ValidateNested()
  @IsDefined()
  public readonly account!: AccountConfig;

  @Type(() => SettingsConfig)
  @ValidateNested()
  @IsDefined()
  public readonly settings!: SettingsConfig;
}