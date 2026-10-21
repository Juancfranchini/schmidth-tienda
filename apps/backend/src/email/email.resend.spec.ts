import { EmailService, motivoDeResend } from './email.service';

const enviar = jest.fn();
jest.mock('resend', () => ({ Resend: jest.fn().mockImplementation(() => ({ emails: { send: enviar } })) }));

function servicio(config: Record<string, unknown> | null = { resendApiKey: 're_prueba', fromEmail: 'Schmidt <noreply@schmidt.example>' }) {
  const prisma = { siteSection: { findUnique: jest.fn().mockResolvedValue(config ? { data: config } : null) } };
  return new EmailService(prisma as never);
}

describe('EmailService.sendEmail con Resend', () => {
  beforeEach(() => enviar.mockReset());

  it('si Resend rechaza sin tirar excepción, el envío falla con el motivo (antes decía "enviado")', async () => {
    enviar.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'The schmidt.example domain is not verified.' } });
    await expect(servicio().sendEmail('cliente@x.com', 'Tu pedido', '<p>hola</p>')).rejects.toThrow(/no está verificado en Resend/);
  });

  it('un envío aceptado devuelve el id', async () => {
    enviar.mockResolvedValue({ data: { id: 'abc' }, error: null });
    await expect(servicio().sendEmail('cliente@x.com', 'Tu pedido', '<p>hola</p>')).resolves.toMatchObject({ data: { id: 'abc' } });
    expect(enviar).toHaveBeenCalledWith(expect.objectContaining({ from: 'Schmidt <noreply@schmidt.example>', to: 'cliente@x.com' }));
  });

  it('un error de red también se informa', async () => {
    enviar.mockRejectedValue(new Error('fetch failed'));
    await expect(servicio().sendEmail('cliente@x.com', 'Tu pedido', '<p>hola</p>')).rejects.toThrow('fetch failed');
  });

  it('sin clave configurada no intenta enviar', async () => {
    await expect(servicio(null).sendEmail('cliente@x.com', 'Tu pedido', '<p>hola</p>')).resolves.toBeNull();
    expect(enviar).not.toHaveBeenCalled();
  });
});

describe('motivoDeResend', () => {
  it('explica el caso de dominio sin verificar', () => {
    expect(motivoDeResend({ message: 'You can only send testing emails to your own email address' })).toMatch(/no está verificado/);
    expect(motivoDeResend({ name: 'invalid_api_key', message: 'API key is invalid' })).toBe('invalid_api_key: API key is invalid');
    expect(motivoDeResend(null)).toBe('error desconocido');
  });
});
