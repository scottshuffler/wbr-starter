import App from './app';
import Sum from './sum';

test('adds 1 + 2 to equal 3', () => {
  expect(Sum(1, 2)).toBe(3);
});

test('adds 1 + 2 to equal 3', () => {
  expect(App.prototype.sum(1, 2)).toBe(3);
});
