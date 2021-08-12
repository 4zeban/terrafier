import Josh from "@joshdb/core";
import provider from "@joshdb/json";
import { IAccount, IAsset, IToken, ITokens } from 'src/types/types';
import _ from 'lodash';

export class DbService {
  private db: Josh;

  constructor(
  ) {
    this.db = new Josh({
      name: "terra",
      provider,
    });
  }

  async getAccounts(addresses: string[]): Promise<IAccount[]> {
    const accounts = addresses.map(async a => await this.db.get<IAccount>(a));
    return await Promise.all(accounts);
  }

  async pushPrices(tokens: IToken[]) {
    const accounts = (await this.db.keys).map(async k => await this.db.get(k) as IAccount);
    
    for (const token of tokens) {
      for (const account of accounts) {
        if(token.symbol=="bluna")
          token.price = tokens.find(t=>t.symbol=="luna").price

        const props = Object.getOwnPropertyNames(account).filter(p => p != "wallet" && p != "address");
        const assets = _.map(props, n => Object.assign({}, Reflect.get(account, n) as IAsset));
        _.map(assets, a => Object.getOwnPropertyNames(a).map(t => Reflect.get(a, t) as ITokens).map(d => d.tokens.find(t => t.symbol.toLowerCase() == token.symbol.toLowerCase())).map(t => t.price = token.price));
      }
    }
  }

  get(
    key: string
  ): Promise<unknown> {
    return this.db.get(key);
  }

  set(
    key: string,
    value: any
  ): Promise<unknown> {
    return this.db.set(key, value);
  }

  update(
    key: string,
    value: any
  ): Promise<unknown> {
    return this.db.update(key, value);
  }

}