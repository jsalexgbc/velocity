import { Component } from '@angular/core';
import { input } from './input';
import { output } from './output';

export interface Output {
  id: string;
  customer_id: string;
  accepted: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  allAttemptedTransactions: {
    id: string;
    customer_id: string;
    load_amount: string;
    time: string;
    accepted: boolean;
  }[] = [];

  output: Output[];

  // validateLoad(inputLine): Output {
  //   return;
  // }

  ngOnInit() {
    this.output = input.reduce((previousResponses, inputTransaction) => {
      if (previousResponses.find(a => a.id === inputTransaction.id &&
          a.customer_id === inputTransaction.customer_id)) {
        return previousResponses;
      }

      previousResponses = [
        ...previousResponses,
        {
          id: inputTransaction.id,
          customer_id: inputTransaction.customer_id,
          accepted: false
        }
      ];

      this.allAttemptedTransactions = [
        ...this.allAttemptedTransactions,
        {
          ...inputTransaction,
          accepted: false
        }
      ];

      if (this.parseAmount(inputTransaction.load_amount) > 5000) {
        return previousResponses;
      }

      let transactionsById = this.getTransactionsById(inputTransaction);

      let transactionsByDay = transactionsById
        .filter(transaction => this.isSameDay(transaction.time, inputTransaction.time));

      if (transactionsByDay.length > 3) {
        return previousResponses;
      }

      let dayTotal = transactionsByDay
        .reduce((dayTotalMemo, item) => dayTotalMemo + this.parseAmount(item.load_amount), 0);

      if (dayTotal > 5000) {
        return previousResponses;
      }

      let transactionsByWeek = transactionsById
        .filter(transaction => this.isInWeek(transaction.time, inputTransaction.time));

      let weekTotal = transactionsByWeek
        .reduce((weekTotalMemo, item) => weekTotalMemo + this.parseAmount(item.load_amount), 0);

      if (weekTotal > 20000) {
        return previousResponses;
      }

      this.allAttemptedTransactions[this.allAttemptedTransactions.length-1].accepted = true;
      previousResponses[previousResponses.length-1].accepted = true;

      return previousResponses;
    }, []);

    console.log(
      'real test:',
      JSON.stringify( this.output ) ===
      JSON.stringify( output )
    );

    console.log(
      this.output.filter((item, index) =>
        JSON.stringify(item) !==
        JSON.stringify(output[index])
      )
    );
  }

  getTransactionsById(inputTransaction) {
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

  isSameDay(a: string, b: string): boolean {
    const dateA = new Date(a);
    const dateB = new Date(b);

    return dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
      dateA.getUTCMonth() === dateB.getUTCMonth() &&
      dateA.getUTCDate() === dateB.getUTCDate();
  }

  isInWeek(a: string, b: string): boolean {
    return this.getMondayOfDate(a) === this.getMondayOfDate(b);
  }

  getMondayOfDate(date: string): number {
    let monday = new Date(date);
    return monday.setDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  }
}
