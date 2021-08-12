import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DbService } from 'src/db/db.service';
import { IAccount, IAnchor, IAsset, ITokens } from 'src/types/types';
import { AppConfigService } from 'src/config/app.config.service';
import _ from "lodash";
import { TerraHttpService } from './terra.http.service';

const enum Events {
    AssetUpdated = "assetUpdated",
    WalletsSynced = "walletsSynced",
    TVLUpdated = "TVLUpdated"
}

@Injectable()
export class TerraService {

    constructor(private fire: EventEmitter2, private db: DbService, private cfg: AppConfigService, private http: TerraHttpService) {

    }

    private readonly logger = new Logger("TerraService");
    private isLocked: boolean = false;
    private usdFormat = Intl.NumberFormat('US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // @Cron(CronExpression.EVERY_10_SECONDS)
    @Cron(CronExpression.EVERY_30_MINUTES)
    async intervalSyncWallets() {
        try {
            await this.syncWallets(this.cfg.accountAddresses, this.cfg.assetPaths);
        } catch (error) {
            this.logger.error(`Error syncing wallets from intervalSyncWallets`, error);
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async intervalSyncPrices() {
        try {
            await this.syncWallets([_.first(this.cfg.accountAddresses)], [_.first(this.cfg.assetPaths)]);
        } catch (error) {
            this.logger.error(`Error syncing wallets from intervalSyncWallets`, error);
        }
    }

    @OnEvent(Events.WalletsSynced, { async: true })
    private async handleWalletsSynced(addresses: string[]) {
        this.logger.debug(`Handling wallets synced for addresses ${addresses.join(", ")}`);

        const netWorth = _.sum(await Promise.all(_.map(await this.db.getAccounts(addresses), async account => await this.getNetWorth(account))));
        const currentPercentToGoal = Math.round(netWorth / this.cfg.settings.lametric.goalUST * 100);

        const data = {
            frames: [
                {
                    "text": `${this.usdFormat.format(netWorth / 1000)}K`,
                    "icon": 39557,
                    "duration": 5000
                },
                {
                    "goalData": {
                        "start": 0,
                        "current": currentPercentToGoal,
                        "end": 100,
                        "unit": "%"
                    },
                    "icon": 25093,
                    "duration": 2000
                }
            ]
        }

        try {
            await this.http.postLametric(data);
        } catch (error) {
            this.logger.error("Error trying to post to Lametric", error, data);
        }

        this.logger.log(`Posted Net Worth: ${this.usdFormat.format(netWorth / 1000)}K`);
    }

    @OnEvent(Events.TVLUpdated, { async: true })
    private async handleTVLUpdate(address: string, tvl: number) {
        this.logger.debug("Handling TVL Update for address " + address);
        if (tvl >= this.cfg.settings.anchor.tvlLimitHigh) {
            await this.postNotification(`TVL ${(tvl * 100).toFixed(0)}%`);
        }
        // else if (tvl <= this.configService.get("TVL_LOW")) {
        //     await this.postNotification(`TVL ${(tvl * 100).toFixed(0)}%`);
        // }
    }

    @OnEvent(Events.AssetUpdated, { async: true })
    private async handleAssetUpdate(assetPath: string, address: string, data: any) {

        switch (assetPath) {
            case "wallet/terra":
                await this.db.update(address, { address, wallet: data });
                await this.db.pushPrices(data);
                break;
            case "anchorTerra":
                if (data.borrows && data.borrows.length > 0 && data.borrows[0].debtRatio)
                    await this.fire.emitAsync(Events.TVLUpdated, address, data.borrows[0].debtRatio);

                const existing = await this.db.get(address) as IAccount;
                const a = data as IAnchor;
                const lunaPrice = existing && existing.wallet.find(w => w.symbol.toLowerCase() == "luna");

                if (lunaPrice) {
                    _.first(a.deposits).tokens.find(t => t.symbol.toLocaleLowerCase() == "bluna").price = lunaPrice.price;
                }

                await this.db.update(address, { anchor: data });
                break;
            case "lunastakingTerra":
                await this.db.update(address, { staking: data });
                break;
            case "pylonTerra":
                await this.db.update(address, { pylon: data });
                break;
            case "specTerra":
                await this.db.update(address, { spec: data });
                break;
        }
        this.logger.debug(assetPath + "\n" + JSON.stringify(await this.db.get(address) as IAccount));
    }

    private async syncWallets(addresses: string[], assetPaths: string[]) {
        this.logger.debug(`syncWallets for ${this.cfg.accountAddresses.join(", ")} with paths ${this.cfg.accountAddresses.join(", ")}`);
        await Promise.all(addresses.map(async a => await this.syncWallet(a, assetPaths)));
        await this.fire.emitAsync(Events.WalletsSynced, this.cfg.accountAddresses);
    }

    private async syncWallet(address: string, assetPaths: string[]) {
        for (const assetPath of assetPaths) {
            try {
                const data = await this.http.getAsset(assetPath, address);
                await this.fire.emitAsync(Events.AssetUpdated, assetPath, address, data);
            } catch (error) {
                this.logger.error(`GET ${assetPath}: ${error}`);
            }
        }
    }

    private async postNotification(message: string) {
        let url = `${this.cfg.laMetricBaseUrl}${this.cfg.laMetricPaths.notificationsPath}`;

        const data = {
            priority: "warning",
            model: {
                cycles: 3,
                frames: [
                    {
                        icon: 555,
                        text: message
                    }
                ],
                sound: {
                    category: "notifications",
                    id: "notification"
                }
            }
        }

        try {
            const response = await this.http.postLametricNotification(data);
            this.logger.debug(response);
        }
        catch (error) {
            this.logger.error(`Failed to post notification to ${url}`, error);
            this.logger.debug(url, this.cfg.laMetricHeadersAuthorized, data, error)
        }
    }

    private async getNetWorth(account: IAccount): Promise<number> {

        let shortAddress = account.address.substring(account.address.length - 3);
        let netUST = 0;

        // Wallet amount has to be handled manually
        if (account.wallet) {
            let walletAmount = _.sum(_.map(account.wallet, t => t.balance * t.price));
            this.logger.debug(`Net UST ${shortAddress}/wallet ${this.usdFormat.format(walletAmount)}`);
            netUST = walletAmount;
        }

        // IAssets can be handled automatically 
        const props = Object.getOwnPropertyNames(account).filter(p => p != "wallet" && p != "address");
        const assets = _.map(props, n => Object.assign({}, { id: shortAddress + "/" + n, asset: Reflect.get(account, n) as IAsset }));
        netUST += _.sum(_.map(assets, a => this.getNetUST(a)));

        // Debt has to be handled manually
        const debt = _.sum(_.map(account.anchor.borrows, b => _.sum(b.tokens.map(t => t.balance))));

        this.logger.debug(`Net UST ${shortAddress}/total ${this.usdFormat.format(netUST - debt)} (${this.usdFormat.format(netUST)}-${this.usdFormat.format(debt)})`);

        return netUST - debt;
    }

    private getNetUST(assetGroup: { id: string, asset: IAsset }): number {
        let props = Object.getOwnPropertyNames(assetGroup.asset).filter(p => p != "borrows");
        const assets = props.map(n => Object.assign({}, { id: assetGroup.id + "/" + n, tokens: Reflect.get(assetGroup.asset, n) as ITokens[] }));
        return _.sum(assets.map(a => a.tokens.length > 0 ? this.getNetUSTFromTokens(a) : 0))
    }

    private getNetUSTFromTokens(tokenAsset: { id: string, tokens: ITokens[] }) {
        try {
            const total = _.sum(_.map(tokenAsset.tokens, c => c && c.tokens && _.sum(c.tokens.map(t => t.balance * t.price))));
            if (total > 0)
                this.logger.debug(`Net UST ${tokenAsset.id} ${this.usdFormat.format(total)}`);
            return total;
        } catch (error) {
            this.logger.error(`Failed to get UST from tokens for ${tokenAsset.id}`, error);
            return 0;
        }
    }
}
