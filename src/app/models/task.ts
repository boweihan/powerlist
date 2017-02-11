export class Task {
  constructor(
      public id: number,
      public title: string,
      public date: string,
      public allDay: boolean,
      public start: string,
      public end: string,
      public url: string
  ) { }
}