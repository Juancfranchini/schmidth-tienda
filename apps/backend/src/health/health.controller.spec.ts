import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('responde ok sin depender de nada más', () => {
    expect(new HealthController().check()).toEqual({ status: 'ok' });
  });
});
