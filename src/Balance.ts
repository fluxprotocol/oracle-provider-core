import Big from 'big.js';
import { DB_TABLE_BALANCES, IDatabase } from './Core';

export interface BalanceDoc {
    balance: string;
    profit: string;
    symbol: string;
    decimals: number;
    contractId: string;
    stakes?: {
        [requestId: string]: string;
    }
}

class Balance {
    public balance: Big = new Big(0);
    public profit: Big = new Big(0);

    /**
     * We keep track of our stakes per request
     * When slashed we know how much we lose exactly
     *
     * @type {Map<string, Big>}
     * @memberof Balance
     */
    public stakes: Map<string, Big> = new Map();

    constructor(
        public database: IDatabase,
        public key: string,
        public symbol: string, 
        public decimals: number, 
        public contractId: string
    ) {}

    public get amountStaked(): string {
        return Array.from(this.stakes).reduce((prev, curr) => prev.add(curr[1]), new Big(0)).toString();
    }

    public async restore() {
        const doc = await this.database.findDocumentById<BalanceDoc>(DB_TABLE_BALANCES, this.key);
        if (!doc) return;

        this.balance = new Big(doc.balance);
        this.profit = new Big(doc.profit);

        if (doc.stakes) {
            const convertedStakes: [string, Big][] = Object.entries(doc.stakes).map((value) => {
                return [value[0], new Big(value[1])];
            });
    
            this.stakes = new Map(convertedStakes);
        }

        this.symbol = doc.symbol;
        this.decimals = doc.decimals;
        this.contractId = doc.contractId;
    }

    public async save() {
        // Converting all big js nums to strings
        const stakes = Array.from(this.stakes).map((value) => [value[0], value[1].toString()]);

        await this.database.createDocument(DB_TABLE_BALANCES, this.key, {
            balance: this.balance.toString(),
            profit: this.profit.toString(),
            symbol: this.symbol,
            decimals: this.decimals,
            contractId: this.contractId,
            stakes: Object.fromEntries(stakes),
        } as BalanceDoc);
    }

    public deposit(amount: string) {
        this.balance = this.balance.add(amount);
    }

    public withdraw(amount: string): boolean {
        const newBalance = this.balance.sub(amount);

        if (newBalance.lt(0)) {
            return false;
        }

        this.balance = newBalance;
        return true;
    }

    public slashSelf(requestId: string) {
        this.stakes.delete(requestId);
    }

    public stake(requestId: string, amount: string): boolean {
        // You can't withdraw negative or 0
        if (new Big(amount).lte(0)) {
            return false;
        }

        if (this.withdraw(amount)) {
            const currentlyStaked = this.stakes.get(requestId);
            this.stakes.set(requestId, new Big(amount).add(currentlyStaked ?? 0));
    
            return true;
        }

        return false;
    }

    public unstake(requestId: string, amount: string) {
        const currentlyStaked = this.stakes.get(requestId);
        const newStakedAmount = new Big(currentlyStaked ?? 0).sub(amount);
        
        if (newStakedAmount.lte(0)) {
            this.stakes.delete(requestId)
        } else {
            this.stakes.set(requestId, newStakedAmount);
        }

        this.deposit(amount);
    }

    public addProfit(amount: string) {
        this.profit = this.profit.add(amount);
        this.deposit(amount);
    }

    public resetBalance(amount: string, symbol = "FLX", decimals = 18) {
        this.balance = new Big(amount);
        this.symbol = symbol;
        this.decimals = decimals;
    }
}

export default Balance;