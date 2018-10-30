import { Injectable } from '@angular/core';

export interface Output {
  id: string;
  customer_id: string;
  accepted: boolean;
}

export interface Input {
  id: string,
  customer_id: string,
  load_amount: string,
  time: string
};

@Injectable()
export class VelocityService {
  allAttemptedTransactions: {
    id: string;
    customer_id: string;
    load_amount: string;
    time: string;
    accepted: boolean;
  }[] = [];

  outputPretendTable: Output[] = [];

  validateAllInputs(inputsList): Output[] {
    inputsList.forEach(inputLine => {
      this.validateLoad(inputLine)
    });

    return this.outputPretendTable;
  }

  validateLoad(inputLine: Input): Output {
    if (this.outputPretendTable.find(a => a.id === inputLine.id &&
        a.customer_id === inputLine.customer_id)) {
      return undefined; // id exists
    }

    const outputLine = {
      id: inputLine.id,
      customer_id: inputLine.customer_id,
      accepted: false
    };

    this.outputPretendTable = [...this.outputPretendTable, outputLine];
    this.allAttemptedTransactions = [
      ...this.allAttemptedTransactions,
      { ...inputLine, accepted: false }
    ];

    let transactionsById = this.getAcceptedTransactionsById(inputLine);
    let transactionsByDay = this.getTransactionsByDay(transactionsById, inputLine.time);
    let transactionsByWeek = this.getTransactionsByWeek(transactionsById, inputLine.time);

    if (this.parseAmount(inputLine.load_amount) > 5000 ||
        transactionsByDay.length > 3 ||
        this.getLoadAmountTotal(transactionsByDay) > 5000 ||
        this.getLoadAmountTotal(transactionsByWeek) > 20000
      ) {
      return outputLine;
    }

    this.allAttemptedTransactions[this.allAttemptedTransactions.length-1].accepted = true;
    this.outputPretendTable[this.outputPretendTable.length-1].accepted = true;

    return { ...outputLine, accepted: true };
  }

  getLoadAmountTotal(transactions: Input[]) {
    return transactions.reduce((total, item) => total + this.parseAmount(item.load_amount), 0);
  }

  getTransactionsByDay(transactions: Input[], time: string) {
    return transactions.filter(transaction => this.isInDay(transaction.time, time))
  }

  getTransactionsByWeek(transactions: Input[], time: string) {
    return transactions.filter(transaction => this.isInWeek(transaction.time, time));
  }

  getAcceptedTransactionsById(inputTransaction) {
    return [
      ...this.allAttemptedTransactions
        .filter(transaction =>
          transaction.customer_id === inputTransaction.customer_id &&
          transaction.accepted),
        inputTransaction
    ]
  }

  parseAmount(amount: string): number {
    return parseFloat(amount.substring(1));
  }

  isInDay(a: string, b: string): boolean {
    const dateA = new Date(a);
    const dateB = new Date(b);

    return dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
      dateA.getUTCMonth() === dateB.getUTCMonth() &&
      dateA.getUTCDate() === dateB.getUTCDate();
  }

  isInWeek(a: string, b: string): boolean {
    return this.getMondayOfDate(a) === this.getMondayOfDate(b);
  }

  private getMondayOfDate(date: string): number {
    let monday = new Date(date.split('T')[0]);
    return monday.setDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  }
}