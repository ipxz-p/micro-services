import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './login-page';

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  it('shows a validation error for each invalid field on submit', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Enter a valid email address.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Must be at least 8 characters.')
    ).toBeInTheDocument();
  });

  it('marks invalid inputs with aria-invalid so they are announced', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'nope');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByLabelText(/email/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('does not report errors before the first submit', () => {
    renderLogin();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
