export interface QuoteInterface {
    c: number;
    d: number;
    dp: number;
    h: number;
    l: number;
    o: number;
    pc: number;
    t: number;
}

export interface CompanyProfileInterface {
    ipo: string;
    logo: string;
    ticker: string;
    weburl: string;
    marketCapitalization: number;
    name: string;
    phone: string;
    shareOutstanding: number;
    country: string;
    currency: string;
    exchange: string;
    finnhubIndustry: string;
}

export interface PeersResult {
    description: string;
    symbol: string;
    type: string;
    primary: string[];
    displaySymbol: string;
}

export interface PeersInterface {
    count: number;
    result: PeersResult[];
}

export interface StockCandlesInterface {
    c: number[];
    h: number[];
    l: number[];
    o: number[];
    t: number[];
    v: number[];
    s: string;
}

export interface Reddit {
    atTime: string;
    mention: number;
    positiveScore: number;
    negativeScore: number;
    positiveMention: number;
    negativeMention: number;
    score: number;
}

export interface Twitter {
    atTime: string;
    mention: number;
    positiveScore: number;
    negativeScore: number;
    positiveMention: number;
    negativeMention: number;
    score: number;
}

export interface NewsInterface {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

export interface SentimentInterface {
    twitter: Twitter[];
    reddit: Reddit[];
    symbol: string;
}

export interface RecTrendsInterface {
    buy: number;
    hold: number;
    period: string;
    sell: number;
    strongBuy: number;
    strongSell: number;
    symbol: string;
}

export interface userStockPurchaseInterface{
    isBuy: boolean;
    ticker: string;
    currPrice: number;
    name: string;
};

export interface PortfolioItemInterface {
    quantity: number;
    totalCost: number;
    ticker: string,
    name: string
}

export interface PortfolioInterface {
    [x: string]: PortfolioItemInterface;
}
