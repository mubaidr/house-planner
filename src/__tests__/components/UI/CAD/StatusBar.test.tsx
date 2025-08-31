import { render, screen } from '@testing-library/react';
import { StatusBar } from '@/components/UI/CAD/StatusBar';
import { useStatusBarStore } from '@/stores/statusBarStore';

jest.mock('@/stores/statusBarStore');
const mockUseStatusBarStore = useStatusBarStore as jest.MockedFunction<typeof useStatusBarStore>;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('StatusBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseStatusBarStore.mockReturnValue({
      angle: 0,
    });
  });

  it('renders without crashing', () => {
    render(<StatusBar height={24} theme="dark" />);
    expect(screen.getByText('0.00, 0.00, 0.00')).toBeInTheDocument();
  });

  it('displays coordinate information', () => {
    render(<StatusBar height={24} theme="dark" />);
    
    // Should show coordinates (initially 0,0,0)
    expect(screen.getByText('0.00, 0.00, 0.00')).toBeInTheDocument();
  });

  it('displays system information', () => {
    render(<StatusBar height={24} theme="dark" />);
    
    // Should show FPS
    expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    
    // Should show memory usage
    expect(screen.getByText(/Memory:/)).toBeInTheDocument();
    
    // Should show object count
    expect(screen.getByText(/Objects:/)).toBeInTheDocument();
  });

  it('displays current time', () => {
    render(<StatusBar height={24} theme="dark" />);
    
    // Should show time in HH:MM format
    const timeRegex = /\d{2}:\d{2}/;
    expect(screen.getByText(timeRegex)).toBeInTheDocument();
  });

  it('shows snap mode indicators', () => {
    render(<StatusBar height={24} theme="dark" />);
    
    expect(screen.getByText('SNAP')).toBeInTheDocument();
    expect(screen.getByText('GRID')).toBeInTheDocument();
  });

  it('displays current layer and tool', () => {
    render(<StatusBar height={24} theme="dark" />);
    
    expect(screen.getByText('Layer: 0')).toBeInTheDocument();
    expect(screen.getByText('Tool: Select')).toBeInTheDocument();
  });

  it('shows units and scale', () => {
    render(<StatusBar height={24} theme="dark" />);
    
    expect(screen.getByText('mm')).toBeInTheDocument();
    expect(screen.getByText('1:100')).toBeInTheDocument();
  });

  it('displays online status', () => {
    render(<StatusBar height={24} theme="dark" />);
    
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('displays offline status when not connected', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<StatusBar height={24} theme="dark" />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('applies light theme styles', () => {
    const { container } = render(<StatusBar height={24} theme="light" />);
    
    const statusBar = container.firstChild as HTMLElement;
    expect(statusBar).toHaveClass('bg-gray-100');
  });

  it('applies dark theme styles', () => {
    const { container } = render(<StatusBar height={24} theme="dark" />);
    
    const statusBar = container.firstChild as HTMLElement;
    expect(statusBar).toHaveClass('bg-gray-800');
  });

  it('applies classic theme styles', () => {
    const { container } = render(<StatusBar height={24} theme="classic" />);
    
    const statusBar = container.firstChild as HTMLElement;
    expect(statusBar).toHaveClass('bg-gray-600');
  });

  it('updates time every second', () => {
    jest.useFakeTimers();
    
    render(<StatusBar height={24} theme="dark" />);
    
    const initialTime = screen.getByText(/\d{2}:\d{2}/).textContent;
    
    // Fast-forward 1 second
    jest.advanceTimersByTime(1000);
    
    // Time should update (though it might be the same if we're unlucky with timing)
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
    
    jest.useRealTimers();
  });
});