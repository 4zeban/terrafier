export interface IAccount {
    address: string;
    wallet: IToken[];
    anchor: IAnchor;
    staking: IAsset;
    pylon: IAsset;
    spec: IAsset;
}

export interface IAsset {
    savings: ITokens[];
    deposits: ITokens[];
    farms: ITokens[];
    govStakings: ITokens[];
    delegated: ITokens[];
}

export interface IAnchor extends IAsset {
    borrows: ITokens[];
    safeRatio: number;
    debtRatio: number;
}

export interface IToken {
    symbol: string;
    balance: number;
    price: number;
}

export interface ITokens {
    tokens: IToken[];
    balance: number;
}
