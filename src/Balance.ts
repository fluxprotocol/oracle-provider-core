import Big from 'big.js';

class Balance {
    public balance: Big = new Big(0);
    public staked: Big = new Big(0);
    public claimed: Big = new Big(0);

    constructor(public symbol: string, public decimals: number, public contractId: string) {}

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

    public stake(amount: string): boolean {
        if (this.withdraw(amount)) {
            this.staked = this.staked.add(amount);
            return true;
        }

        return false;
    }

    public addClaimed(amount: string) {
        this.deposit(amount);
        
        this.staked = this.staked.sub(amount);
        this.claimed = this.claimed.add(amount);
    }

    public resetBalance(amount: string, symbol = "FLX", decimals = 18) {
        this.balance = new Big(amount);
        this.symbol = symbol;
        this.decimals = decimals;
    }
}

export default Balance;