import { test, expect, describe, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import AboutPage from '../page';

// Mock framer-motion
const mockMotionDiv = ({ children, ...props }: any) => <div {...props}>{children}</div>;

// Mock Next.js Link
const mockLink = ({ children, href, ...props }: any) => (
  <a href={href} {...props}>
    {children}
  </a>
);

// Mock lucide-react icons
const mockIcon = () => <span data-testid="icon" />;
const ArrowUpRight = () => <span data-testid="arrow-up-right" />;
const MessagesSquare = () => <span data-testid="messages-square" />;
const Server = () => <span data-testid="server" />;
const Database = () => <span data-testid="database" />;

// Apply mocks
Object.defineProperty(global, 'motion', {
  value: { div: mockMotionDiv },
});

// Mock modules
mock.module('framer-motion', () => ({
  motion: { div: mockMotionDiv },
  Variants: {},
}));

mock.module('next/link', () => ({
  default: mockLink,
}));

mock.module('lucide-react', () => ({
  ArrowUpRight,
  MessagesSquare,
  Server,
  Database,
}));

describe('AboutPage', () => {
  test('should render main sections', () => {
    render(<AboutPage />);
    
    expect(screen.getByText('Mission')).toBeInTheDocument();
    expect(screen.getByText('Problem')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  test('should contain Zekher mission statement', () => {
    render(<AboutPage />);
    
    expect(screen.getAllByText(/זכר, remembrance in Hebrew/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/preserve Holocaust memory with AI/)[0]).toBeInTheDocument();
  });

  test('should have internal navigation links', () => {
    render(<AboutPage />);
    
    const links = screen.getAllByRole('link');
    const chatLinks = links.filter(link => link.getAttribute('href') === '/chat');
    const mcpLinks = links.filter(link => link.getAttribute('href') === '/developers/mcp');
    const sourceLinks = links.filter(link => link.getAttribute('href') === '/sources');
    
    expect(chatLinks.length).toBeGreaterThan(0);
    expect(mcpLinks.length).toBeGreaterThan(0);
    expect(sourceLinks.length).toBeGreaterThan(0);
  });
});