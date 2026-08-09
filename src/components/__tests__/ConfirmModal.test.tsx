import { describe, expect, it, vi } from 'vitest';

import { ConfirmModal } from '@/components/ConfirmModal';
import { TestWrapper } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function renderModal(props?: { confirmVariant?: 'primary' | 'danger' }) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  const result = render(
    <TestWrapper>
      <ConfirmModal
        isOpen
        title='Test Title'
        message='Test Message'
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />
    </TestWrapper>
  );

  return { onConfirm, onCancel, result };
}

describe('ConfirmModal', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <TestWrapper>
        <ConfirmModal
          isOpen={false}
          title='Title'
          message='Message'
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      </TestWrapper>
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders title and message when open', () => {
    renderModal();

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    const { onConfirm } = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText('Confirmar'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', async () => {
    const { onCancel } = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText('Cancelar'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when clicking overlay', async () => {
    const { onCancel } = renderModal();
    const user = userEvent.setup();

    await user.click(document.querySelector('.fixed.inset-0')!);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not call onCancel when clicking inside modal', async () => {
    const { onCancel } = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText('Test Title'));

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('renders danger button when confirmVariant is danger', () => {
    renderModal({ confirmVariant: 'danger' });

    const confirmBtn = screen.getByText('Confirmar');
    expect(confirmBtn.className).toContain('bg-red-600');
  });

  it('renders primary button by default', () => {
    renderModal();

    const confirmBtn = screen.getByText('Confirmar');
    expect(confirmBtn.className).toContain('bg-blue-600');
  });
});
