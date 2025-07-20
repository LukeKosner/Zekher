/**
 * LexiconCard Component Tests
 * 
 * Tests for the interactive lexicon card component including hover states,
 * accessibility, and proper URL generation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LexiconCard } from './LexiconCard';
import { LexiconSource } from '@/lib/types';

// Mock the blob URL utility
vi.mock('@/lib/utils/blob-urls', () => ({
  getLexiconUrl: vi.fn((filename: string) => `https://storage.googleapis.com/zekher-storage/lexicon/pdf/${filename}`)
}));

// Mock the prompts
vi.mock('@/lib/prompts', () => ({
  sourcesPageConstants: {
    lexiconOverlay: {
      title: 'Holocaust Lexicon',
      actionText: 'View Full PDF',
      actionIcon: 'FileText'
    }
  }
}));

// Mock the utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}));

describe('LexiconCard', () => {
  const mockSource: LexiconSource = {
    id: 'lexicon-1',
    filename: 'holocaust-history.pdf',
    title: 'Holocaust History',
    description: 'Holocaust Lexicon entry: Holocaust History',
    featured: false
  };

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(<LexiconCard source={mockSource} />);
      
      expect(screen.getByText('Holocaust History')).toBeInTheDocument();
      expect(screen.getByText('Holocaust Lexicon entry')).toBeInTheDocument();
    });

    it('should use filename as title when title is not provided', () => {
      const sourceWithoutTitle = { ...mockSource, title: undefined };
      render(<LexiconCard source={sourceWithoutTitle} />);
      
      expect(screen.getByText('holocaust-history')).toBeInTheDocument();
    });

    it('should remove .pdf extension from filename when used as title', () => {
      const sourceWithPdfFilename = { 
        ...mockSource, 
        title: undefined,
        filename: 'test-document.pdf'
      };
      render(<LexiconCard source={sourceWithPdfFilename} />);
      
      expect(screen.getByText('test-document')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <LexiconCard source={mockSource} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Hover Overlay', () => {
    it('should render overlay link with correct href', () => {
      render(<LexiconCard source={mockSource} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://storage.googleapis.com/zekher-storage/lexicon/pdf/holocaust-history.pdf');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });

    it('should have proper accessibility attributes', () => {
      render(<LexiconCard source={mockSource} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'View full PDF: Holocaust History');
    });

    it('should render action text and icon', () => {
      render(<LexiconCard source={mockSource} />);
      
      expect(screen.getByText('View Full PDF')).toBeInTheDocument();
      // Icon should be present but hidden from screen readers
      const icon = screen.getByText('View Full PDF').previousElementSibling;
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have proper CSS classes for hover effect', () => {
      render(<LexiconCard source={mockSource} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('opacity-0', 'group-hover:opacity-100', 'focus:opacity-100');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<LexiconCard source={mockSource} />);
      
      const link = screen.getByRole('link');
      link.focus();
      
      expect(link).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      render(<LexiconCard source={mockSource} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label');
    });

    it('should hide decorative icon from screen readers', () => {
      render(<LexiconCard source={mockSource} />);
      
      const icon = screen.getByText('View Full PDF').previousElementSibling;
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('URL Generation', () => {
    it('should generate correct PDF URL', () => {
      const { getLexiconUrl } = require('@/lib/utils/blob-urls');
      render(<LexiconCard source={mockSource} />);
      
      expect(getLexiconUrl).toHaveBeenCalledWith('holocaust-history.pdf');
    });

    it('should handle filenames with special characters', () => {
      const specialSource = {
        ...mockSource,
        filename: 'test file (1) & more.pdf'
      };
      
      render(<LexiconCard source={specialSource} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      const sourceWithEmptyTitle = { ...mockSource, title: '' };
      render(<LexiconCard source={sourceWithEmptyTitle} />);
      
      expect(screen.getByText('holocaust-history')).toBeInTheDocument();
    });

    it('should handle missing filename', () => {
      const sourceWithoutFilename = { ...mockSource, filename: '' };
      render(<LexiconCard source={sourceWithoutFilename} />);
      
      // Should still render without crashing
      expect(screen.getByText('Holocaust History')).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(200);
      const sourceWithLongTitle = { ...mockSource, title: longTitle };
      
      render(<LexiconCard source={sourceWithLongTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should handle click events', () => {
      render(<LexiconCard source={mockSource} />);
      
      const link = screen.getByRole('link');
      fireEvent.click(link);
      
      // Link should still have correct href after click
      expect(link).toHaveAttribute('href', 'https://storage.googleapis.com/zekher-storage/lexicon/pdf/holocaust-history.pdf');
    });

    it('should handle keyboard navigation', () => {
      render(<LexiconCard source={mockSource} />);
      
      const link = screen.getByRole('link');
      
      fireEvent.keyDown(link, { key: 'Enter' });
      fireEvent.keyDown(link, { key: ' ' });
      
      // Should not throw errors
      expect(link).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper card structure', () => {
      const { container } = render(<LexiconCard source={mockSource} />);
      
      const card = container.firstChild;
      expect(card).toHaveClass('relative', 'group', 'w-full', 'rounded', 'border');
    });

    it('should have proper overlay styling', () => {
      render(<LexiconCard source={mockSource} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('absolute', 'inset-0', 'flex', 'items-center', 'justify-center');
    });
  });
});