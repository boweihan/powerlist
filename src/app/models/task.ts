export class Task {
  constructor(
      public id: number,
      public title: string,
      public tip: string,
      public start: string,
      public end: string,
      public url: string,
      public category_id: number,
      public user_id: number,
      public backgroundColor: string,
      public overdue: boolean
  ) { }
}