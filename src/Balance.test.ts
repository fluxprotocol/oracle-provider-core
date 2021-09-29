import Big from "big.js";
import Balance, { BalanceDoc } from "./Balance";

describe('Balance', () => {
    describe('amountStaked', () => {
        it('Should combine all the amount staked correctly', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');
            
            balance.deposit('1000000000');

            expect(balance.stake('1', '10000')).toBe(true);
            expect(balance.stake('2', '1000000')).toBe(true);
            
            expect(balance.amountStaked).toBe('1010000');
        });
    });

    describe('restore', () => {
        it('Should combine all the amount staked correctly', async () => {
            const balance = new Balance({
                findDocumentById: jest.fn(() => ({
                    balance: '1000000000',
                    contractId: 'test.near',
                    decimals: 18,
                    profit: '1023',
                    stakes: {
                        '1': '10000',
                        '2': '1000000',
                    },
                    symbol: 'TEST',
                } as BalanceDoc) ),
            } as any, 'testKey', 'TESTOLD', 24, 'test2.near');

            await balance.restore();

            expect(balance.database.findDocumentById).toHaveBeenCalledWith('balances', 'testKey');
            expect(balance.balance.toString()).toBe('1000000000');
            expect(balance.profit.toString()).toBe('1023');
            expect(balance.decimals).toBe(18);
            expect(balance.symbol).toBe('TEST');
            expect(balance.stakes.size).toBe(2);
            expect(balance.stakes.get('1')?.toString()).toBe('10000');
            expect(balance.stakes.get('2')?.toString()).toBe('1000000');
        });
    });

    describe('save', () => {
        it('should save all the document entries and store them correctly', async () => {
            const balance = new Balance({
                createDocument: jest.fn((tableKey, balanceKey, doc) => {
                    expect(tableKey).toBe('balances');
                    expect(balanceKey).toBe('testKey');

                    expect(doc.balance).toBe('1132');
                    expect(doc.profit).toBe('2');
                    expect(doc.symbol).toBe('TEST');
                    expect(doc.decimals).toBe(24);
                    expect(doc.contractId).toBe('test2.near');
                    expect(doc.stakes).toStrictEqual({
                        '1': '100',
                        '2': '3',
                    });
                }),
            } as any, 'testKey', 'TEST', 24, 'test2.near');

            balance.deposit('1233');
            balance.addProfit('2');

            balance.stake('1', '100');
            balance.stake('2', '3');

            await balance.save();
        });
    });

    describe('deposit', () => {
        it('should deposit an amount to the balance', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');

            balance.deposit('45');
            balance.deposit('56');

            expect(balance.balance.toString()).toBe('101');
        });
    });

    describe('withdraw', () => {
        it('Should be able to withdraw from the balance if its has enough balance', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');

            balance.deposit('100');

            expect(balance.withdraw('5')).toBe(true);
            expect(balance.balance.toString()).toBe('95');
        });

        it('Should be able to withdraw from the balance if its has enough balance', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');

            balance.deposit('100');

            expect(balance.withdraw('105')).toBe(false);
            expect(balance.balance.toString()).toBe('100');
        });
    });

    describe('stake', () => {
        it('Should be able to withdraw for staking if it has enough balance', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');

            balance.deposit('100');

            expect(balance.stake('1', '20')).toBe(true);
            expect(balance.stake('2', '20')).toBe(true);
            expect(balance.balance.toString()).toBe('60');
            expect(balance.stakes.get('1')?.toString()).toBe('20');
        });

        it('Should be able to add more stake to the same request id', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');

            balance.deposit('100');

            expect(balance.stake('1', '20')).toBe(true);
            expect(balance.stake('2', '20')).toBe(true);
            expect(balance.stake('1', '20')).toBe(true);
            expect(balance.balance.toString()).toBe('40');
            expect(balance.stakes.get('1')?.toString()).toBe('40');
        });

        it('Should not be able to add more stake to the same request id when the balance is too low', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');

            balance.deposit('100');

            expect(balance.stake('1', '20')).toBe(true);
            expect(balance.stake('2', '20')).toBe(true);
            expect(balance.stake('1', '100')).toBe(false);
            expect(balance.balance.toString()).toBe('60');
            expect(balance.stakes.get('1')?.toString()).toBe('20');
        });
    });

    describe('unstake', () => {
        it('Should be able to unstake from an existing stake entry', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');

            balance.deposit('100');

            expect(balance.stake('1', '20')).toBe(true);
            expect(balance.stake('2', '20')).toBe(true);
            expect(balance.balance.toString()).toBe('60');

            balance.unstake('1', '10');

            expect(balance.stakes.get('1')?.toString()).toBe('10');
            expect(balance.balance.toString()).toBe('70');
        });

        it('Should remove the stake entry when there is no more stake', () => {
            const balance = new Balance({} as any, 'test', 'TEST', 18, 'test.near');

            balance.deposit('100');

            expect(balance.stake('1', '20')).toBe(true);
            expect(balance.stake('2', '20')).toBe(true);
            expect(balance.balance.toString()).toBe('60');

            balance.unstake('1', '20');

            expect(balance.stakes.has('1')).toBe(false);
            expect(balance.balance.toString()).toBe('80');
        });
    });
});