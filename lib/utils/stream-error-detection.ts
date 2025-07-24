/**
 * Utility for detecting problematic streaming patterns from AI models
 */

export class StreamErrorDetector {
  private buffer: string = '';
  private ctrl46Count: number = 0;
  private readonly CTRL46_PATTERN = /<ctrl46>/g;
  private readonly MAX_CTRL46_OCCURRENCES = 3;
  private readonly BUFFER_SIZE_LIMIT = 1000;

  /**
   * Process a chunk of streamed text and detect error patterns
   * @param chunk - The text chunk to analyze
   * @returns Object containing error status and processed text
   */
  processChunk(chunk: string): { 
    hasError: boolean; 
    errorType?: string; 
    processedText: string;
    shouldStop: boolean;
  } {
    // Add chunk to buffer
    this.buffer += chunk;
    
    // Limit buffer size to prevent memory issues
    if (this.buffer.length > this.BUFFER_SIZE_LIMIT) {
      this.buffer = this.buffer.slice(-this.BUFFER_SIZE_LIMIT);
    }

    // Count <ctrl46> occurrences in the current buffer
    const matches = this.buffer.match(this.CTRL46_PATTERN);
    this.ctrl46Count = matches ? matches.length : 0;

    // Check for repeated <ctrl46> pattern
    if (this.ctrl46Count >= this.MAX_CTRL46_OCCURRENCES) {
      return {
        hasError: true,
        errorType: 'REPEATED_CTRL46',
        processedText: this.cleanText(chunk),
        shouldStop: true
      };
    }

    return {
      hasError: false,
      processedText: this.cleanText(chunk),
      shouldStop: false
    };
  }

  /**
   * Clean text by removing problematic patterns
   * @param text - Text to clean
   * @returns Cleaned text
   */
  private cleanText(text: string): string {
    return text.replace(this.CTRL46_PATTERN, '');
  }

  /**
   * Reset the detector state
   */
  reset(): void {
    this.buffer = '';
    this.ctrl46Count = 0;
  }

  /**
   * Get current error statistics
   */
  getStats(): { ctrl46Count: number; bufferLength: number } {
    return {
      ctrl46Count: this.ctrl46Count,
      bufferLength: this.buffer.length
    };
  }
}

/**
 * Create a streaming error for problematic model behavior
 */
export function createStreamingError(errorType: string): Error {
  const errorMessages = {
    REPEATED_CTRL46: 'Model is repeatedly streaming <ctrl46> pattern. This indicates a processing error.',
  };

  const message = errorMessages[errorType as keyof typeof errorMessages] || 'Unknown streaming error';
  const error = new Error(message);
  error.name = 'StreamingError';
  
  return error;
}