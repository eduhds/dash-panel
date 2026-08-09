import { describe, expect, it, vi } from 'vitest';

import { Card } from '@/entities/grid';
import { TestWrapper } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const defaultCard = {
  id: 'card-1',
  content: '<p>Hello World</p>'
};

function renderCard(card = defaultCard, overrides?: Record<string, unknown>) {
  const onDragStart = vi.fn();
  const onDragEnd = vi.fn();
  const onRemoveCard = vi.fn();
  const onUpdateContent = vi.fn();

  const result = render(
    <TestWrapper>
      <Card
        card={card}
        cellId='cell-1'
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onRemoveCard={onRemoveCard}
        onUpdateContent={onUpdateContent}
        {...overrides}
      />
    </TestWrapper>
  );

  return { onDragStart, onDragEnd, onRemoveCard, onUpdateContent, result };
}

describe('Card', () => {
  it('renders card content via dangerouslySetInnerHTML', () => {
    renderCard();

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders edit and delete action buttons', () => {
    renderCard();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('enters edit mode when edit button clicked', async () => {
    renderCard();
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button')[0]);
  });

  it('shows save and cancel buttons in edit mode', async () => {
    renderCard();
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button')[0]);

    const allBtns = screen.getAllByRole('button');
    const hasSaveButton = allBtns.some(btn => btn.className.includes('bg-green-500'));
    const hasCancelButton = allBtns.some(btn => btn.className.includes('bg-gray-400'));
    expect(hasSaveButton).toBe(true);
    expect(hasCancelButton).toBe(true);
  });

  it('calls onUpdateContent with edited content when save clicked', async () => {
    const { onUpdateContent } = renderCard();
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button')[0]);

    const allBtns = screen.getAllByRole('button');
    const greenBtn = allBtns.find(b => b.className.includes('bg-green-500'))!;

    await user.click(greenBtn);

    expect(onUpdateContent).toHaveBeenCalledWith('cell-1', '<p>Hello World</p>');
  });

  it('exits edit mode without saving when cancel clicked', async () => {
    renderCard();
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button')[0]);

    const allBtns = screen.getAllByRole('button');
    const cancelBtn = allBtns.find(b => b.className.includes('bg-gray-400'))!;

    await user.click(cancelBtn);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('shows delete confirmation modal when trash button clicked', async () => {
    renderCard();
    const user = userEvent.setup();
    const allBtns = screen.getAllByRole('button');
    const trashBtn = allBtns.find(
      b => b.className.includes('border-red-300') || b.innerHTML.includes('Trash2Icon')
    )!;

    await user.click(trashBtn);

    expect(screen.getByText('Excluir card')).toBeInTheDocument();
    expect(
      screen.getByText('Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.')
    ).toBeInTheDocument();
  });

  it('calls onRemoveCard when delete confirmed', async () => {
    const { onRemoveCard } = renderCard();
    const user = userEvent.setup();
    const allBtns = screen.getAllByRole('button');
    const trashBtn = allBtns.find(
      b => b.className.includes('border-red-300') || b.innerHTML.includes('Trash2Icon')
    )!;

    await user.click(trashBtn);

    const confirmBtn = screen.getByText('Confirmar');
    await user.click(confirmBtn);

    expect(onRemoveCard).toHaveBeenCalledWith('cell-1');
  });

  it('does not call onRemoveCard when delete cancelled', async () => {
    const { onRemoveCard } = renderCard();
    const user = userEvent.setup();
    const allBtns = screen.getAllByRole('button');
    const trashBtn = allBtns.find(
      b => b.className.includes('border-red-300') || b.innerHTML.includes('Trash2Icon')
    )!;

    await user.click(trashBtn);

    const cancelBtn = screen.getByText('Cancelar');
    await user.click(cancelBtn);

    expect(onRemoveCard).not.toHaveBeenCalled();
  });
});
