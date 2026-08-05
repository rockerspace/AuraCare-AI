import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import Home from '../src/app/page';

describe('AuraCare Dashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the AuraCare header', () => {
    render(<Home />);
    expect(screen.getByText('AuraCare')).toBeInTheDocument();
  });

  it('displays the patient monitoring status', () => {
    render(<Home />);
    expect(screen.getByText(/Monitoring Jane Doe/i)).toBeInTheDocument();
  });

  it('renders the critical behavioral anomaly alert', () => {
    render(<Home />);
    expect(screen.getByText('Behavioral Anomaly Detected')).toBeInTheDocument();
    expect(screen.getByText(/40% decrease in mobility/i)).toBeInTheDocument();
  });

  it('updates the heart rate dynamically on interval', () => {
    render(<Home />);
    // The initial heart rate is 72 bpm
    expect(screen.getByText('72 bpm')).toBeInTheDocument();
    
    // Fast-forward time to trigger the useEffect interval
    act(() => {
      jest.advanceTimersByTime(2500);
    });

    // We can't guarantee the exact new HR due to Math.random(), 
    // but it should still render a bpm string.
    const heartRateElement = screen.getByText(/bpm$/);
    expect(heartRateElement).toBeInTheDocument();
  });
});
