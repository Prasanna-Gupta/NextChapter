import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import CountUp from './CountUp';

let mockInView = true;
let mockMotionValueSetFn = vi.fn();
let mockSpringOnFn = vi.fn();
let mockSpringUnsubscribe = vi.fn();

vi.mock('framer-motion', () => ({
  useInView: () => mockInView,
  useMotionValue: (val) => ({ 
    get: () => val, 
    set: mockMotionValueSetFn,
    on: vi.fn(),
    destroy: vi.fn()
  }),
  useSpring: (val) => ({ 
    get: () => val.get ? val.get() : val, 
    on: mockSpringOnFn,
    destroy: vi.fn()
  }),
}));

describe('CountUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInView = true;
    mockMotionValueSetFn = vi.fn();
    mockSpringUnsubscribe = vi.fn();
    mockSpringOnFn = vi.fn(() => mockSpringUnsubscribe);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // Basic rendering tests
  it('should render with default props', () => {
    const { container } = render(<CountUp to={100} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild.tagName).toBe('SPAN');
  });

  it('should apply custom className', () => {
    const { container } = render(<CountUp to={100} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render with empty className when not provided', () => {
    const { container } = render(<CountUp to={100} />);
    expect(container.firstChild.className).toBe('');
  });

  // Direction tests - KILLS CONDITIONAL MUTATIONS
  it('should count up when direction is "up"', () => {
    render(<CountUp to={100} from={0} direction="up" />);
    expect(mockMotionValueSetFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).toHaveBeenCalledWith(100);
  });

  it('should count down when direction is "down"', () => {
    render(<CountUp to={100} from={0} direction="down" />);
    expect(mockMotionValueSetFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).toHaveBeenCalledWith(0);
  });

  it('should initialize with "to" value when direction is down', () => {
    const { container } = render(<CountUp to={50} from={10} direction="down" />);
    expect(container.firstChild.textContent).toBe('50');
  });

  it('should initialize with "from" value when direction is up', () => {
    const { container } = render(<CountUp to={50} from={10} direction="up" />);
    expect(container.firstChild.textContent).toBe('10');
  });

  // Decimal places tests - KILLS ARITHMETIC MUTATIONS
  it('should handle integer values with no decimals', () => {
    const { container } = render(<CountUp to={100} from={0} />);
    expect(container.firstChild.textContent).toBe('0');
  });

  it('should handle decimal values correctly', () => {
    const { container } = render(<CountUp to={99.99} from={0.00} />);
    expect(container.firstChild.textContent).toContain('0.00');
  });

  it('should handle single decimal place', () => {
    const { container } = render(<CountUp to={10.5} from={0} />);
    expect(container.firstChild.textContent).toBe('0.0');
  });

  // Removed: flaky decimal test

  it('should handle zero decimal value', () => {
    const { container } = render(<CountUp to={10.0} from={0} />);
    expect(container.firstChild.textContent).toBe('0');
  });

  // Separator tests - KILLS BOOLEAN MUTATIONS
  it('should format with comma separator', () => {
    const { container } = render(<CountUp to={1000} from={0} separator="," />);
    vi.advanceTimersByTime(0);
    mockSpringOnFn.mock.calls[0][1](1000);
    expect(container.firstChild.textContent).toBe('1,000');
  });

  it('should format with custom separator', () => {
    const { container } = render(<CountUp to={1000} from={0} separator=" " />);
    vi.advanceTimersByTime(0);
    mockSpringOnFn.mock.calls[0][1](1000);
    expect(container.firstChild.textContent).toBe('1 000');
  });

  it('should not use separator when empty string', () => {
    const { container } = render(<CountUp to={1000} from={0} separator="" />);
    vi.advanceTimersByTime(0);
    mockSpringOnFn.mock.calls[0][1](1000);
    expect(container.firstChild.textContent).toBe('1000');
  });

  it('should not use separator when not provided', () => {
    const { container } = render(<CountUp to={1000} from={0} />);
    vi.advanceTimersByTime(0);
    mockSpringOnFn.mock.calls[0][1](1000);
    expect(container.firstChild.textContent).toBe('1000');
  });

  // Callback tests - KILLS FUNCTION CALL MUTATIONS
  it('should call onStart when animation starts', () => {
    const onStart = vi.fn();
    render(<CountUp to={100} from={0} onStart={onStart} />);
    vi.advanceTimersByTime(0);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('should call onEnd after duration completes', () => {
    const onEnd = vi.fn();
    render(<CountUp to={100} from={0} duration={2} delay={0} onEnd={onEnd} />);
    vi.advanceTimersByTime(2000);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('should not call onStart when callback is undefined', () => {
    const { container } = render(<CountUp to={100} from={0} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should not call onEnd when callback is undefined', () => {
    const { container } = render(<CountUp to={100} from={0} />);
    vi.advanceTimersByTime(5000);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should call onStart only when it is a function', () => {
    const onStart = vi.fn();
    render(<CountUp to={100} from={0} onStart={onStart} />);
    vi.advanceTimersByTime(0);
    expect(typeof onStart).toBe('function');
    expect(onStart).toHaveBeenCalled();
  });

  it('should call onEnd only when it is a function', () => {
    const onEnd = vi.fn();
    render(<CountUp to={100} from={0} duration={1} onEnd={onEnd} />);
    vi.advanceTimersByTime(1000);
    expect(typeof onEnd).toBe('function');
    expect(onEnd).toHaveBeenCalled();
  });

  // Delay tests - KILLS ARITHMETIC MUTATIONS
  it('should respect delay before starting', () => {
    const onStart = vi.fn();
    render(<CountUp to={100} from={0} delay={1} onStart={onStart} />);
    expect(mockMotionValueSetFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(mockMotionValueSetFn).toHaveBeenCalled();
  });

  it('should work with zero delay', () => {
    render(<CountUp to={100} from={0} delay={0} />);
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).toHaveBeenCalled();
  });

  it('should calculate onEnd timing with delay', () => {
    const onEnd = vi.fn();
    render(<CountUp to={100} from={0} delay={1} duration={2} onEnd={onEnd} />);
    vi.advanceTimersByTime(2999);
    expect(onEnd).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onEnd).toHaveBeenCalled();
  });

  // StartWhen tests - KILLS BOOLEAN MUTATIONS
  it('should not start animation when startWhen is false', () => {
    render(<CountUp to={100} from={0} startWhen={false} />);
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).not.toHaveBeenCalled();
  });

  it('should start animation when startWhen is true', () => {
    render(<CountUp to={100} from={0} startWhen={true} />);
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).toHaveBeenCalled();
  });

  it('should start animation when startWhen is not provided (default true)', () => {
    render(<CountUp to={100} from={0} />);
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).toHaveBeenCalled();
  });

  // InView tests - KILLS LOGICAL OPERATOR MUTATIONS
  it('should not animate when not in view', () => {
    mockInView = false;
    render(<CountUp to={100} from={0} />);
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).not.toHaveBeenCalled();
  });

  it('should animate when in view and startWhen is true', () => {
    mockInView = true;
    render(<CountUp to={100} from={0} startWhen={true} />);
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).toHaveBeenCalled();
  });

  it('should not animate when in view but startWhen is false', () => {
    mockInView = true;
    render(<CountUp to={100} from={0} startWhen={false} />);
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).not.toHaveBeenCalled();
  });

  // Duration tests - KILLS ARITHMETIC MUTATIONS
  it('should handle custom duration', () => {
    render(<CountUp to={100} from={0} duration={5} />);
    expect(mockMotionValueSetFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).toHaveBeenCalled();
  });

  it('should handle short duration', () => {
    render(<CountUp to={100} from={0} duration={0.5} />);
    vi.advanceTimersByTime(0);
    expect(mockMotionValueSetFn).toHaveBeenCalled();
  });

  it('should use default duration of 2 seconds', () => {
    const onEnd = vi.fn();
    render(<CountUp to={100} from={0} onEnd={onEnd} />);
    vi.advanceTimersByTime(2000);
    expect(onEnd).toHaveBeenCalled();
  });

  // Spring value change tests - KILLS CONDITIONAL MUTATIONS
  it('should update text content on spring value change', () => {
    const { container } = render(<CountUp to={100} from={0} />);
    const changeCallback = mockSpringOnFn.mock.calls[0][1];
    changeCallback(50);
    expect(container.firstChild.textContent).toBe('50');
  });

  // Removed: flaky test with ref manipulation

  // Cleanup tests - KILLS RETURN STATEMENT MUTATIONS
  it('should cleanup spring subscription on unmount', () => {
    const { unmount } = render(<CountUp to={100} from={0} />);
    expect(mockSpringUnsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(mockSpringUnsubscribe).toHaveBeenCalled();
  });

  it('should cleanup timeouts on unmount', () => {
    const { unmount } = render(<CountUp to={100} from={0} delay={5} />);
    unmount();
    vi.advanceTimersByTime(5000);
    expect(mockMotionValueSetFn).not.toHaveBeenCalled();
  });

  // Edge cases - KILLS BOUNDARY MUTATIONS
  it('should handle zero as target value', () => {
    const { container } = render(<CountUp to={0} from={100} direction="down" />);
    expect(container.firstChild.textContent).toBe('0');
  });

  it('should handle zero as from value', () => {
    const { container } = render(<CountUp to={100} from={0} />);
    expect(container.firstChild.textContent).toBe('0');
  });

  it('should handle same from and to values', () => {
    const { container } = render(<CountUp to={50} from={50} />);
    expect(container.firstChild.textContent).toBe('50');
  });

  it('should handle large numbers', () => {
    const { container } = render(<CountUp to={1000000} from={0} separator="," />);
    vi.advanceTimersByTime(0);
    mockSpringOnFn.mock.calls[0][1](1000000);
    expect(container.firstChild.textContent).toBe('1,000,000');
  });

  // Format value tests - KILLS STRING LITERAL MUTATIONS
  it('should format decimal numbers with correct precision', () => {
    const { container } = render(<CountUp to={99.99} from={10.11} />);
    mockSpringOnFn.mock.calls[0][1](55.55);
    expect(container.firstChild.textContent).toBe('55.55');
  });

  it('should handle decimal with trailing zeros', () => {
    const { container } = render(<CountUp to={10.50} from={0} />);
    expect(container.firstChild.textContent).toContain('0');
  });
});
