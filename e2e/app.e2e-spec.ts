import { PowerlistPage } from './app.po';

describe('powerlist App', function() {
  let page: PowerlistPage;

  beforeEach(() => {
    page = new PowerlistPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
