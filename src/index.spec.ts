import helloWorld from './index';
import { expect } from 'chai';

describe('Hello world function', () => {
  it('Should return hello world', () => {
    const result = helloWorld();
    expect(result).to.equal('Hello world!');
  });
});
