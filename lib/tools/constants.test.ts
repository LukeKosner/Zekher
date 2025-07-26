import { describe, test, expect } from 'bun:test';
import {
  toolDescriptions,
  nextStepsInstructions,
  errorMessages
} from './index';

describe('Tool Constants', () => {
  test('toolDescriptions has correct structure', () => {
    expect(toolDescriptions.lexiconTool.maxTerms).toBe(6);
    expect(toolDescriptions.testimonyTool.maxTerms).toBe(3);
    expect(toolDescriptions.showUsersAudio.maxSegments).toBe(3);
    
    expect(typeof toolDescriptions.lexiconTool.description).toBe('string');
    expect(typeof toolDescriptions.testimonyTool.description).toBe('string');
    expect(typeof toolDescriptions.showUsersAudio.description).toBe('string');
  });

  test('nextStepsInstructions has expected keys', () => {
    expect(typeof nextStepsInstructions.lexicon).toBe('string');
    expect(typeof nextStepsInstructions.testimony).toBe('string');
    expect(typeof nextStepsInstructions.audio).toBe('string');
    expect(typeof nextStepsInstructions.noResults).toBe('string');
    expect(typeof nextStepsInstructions.noResultsTestimony).toBe('string');
    expect(typeof nextStepsInstructions.noResultsLexicon).toBe('string');
    expect(typeof nextStepsInstructions.noSearchTerms).toBe('string');
    expect(typeof nextStepsInstructions.noSearchTermsTestimony).toBe('string');
  });

  test('errorMessages has nested structure for each tool', () => {
    expect(typeof errorMessages.lexicon.noTerms).toBe('string');
    expect(typeof errorMessages.lexicon.noResults).toBe('string');
    expect(typeof errorMessages.lexicon.systemError).toBe('string');
    
    expect(typeof errorMessages.testimony.noTerms).toBe('string');
    expect(typeof errorMessages.testimony.noResults).toBe('string');
    expect(typeof errorMessages.testimony.systemError).toBe('string');
    
    expect(typeof errorMessages.audio.noSegments).toBe('string');
    expect(typeof errorMessages.audio.processingError).toBe('string');
  });

  test('tool descriptions contain expected keywords', () => {
    expect(toolDescriptions.lexiconTool.description).toContain('Holocaust Lexicon');
    expect(toolDescriptions.testimonyTool.description).toContain('survivor testimonies');
    expect(toolDescriptions.showUsersAudio.description).toContain('audio segment');
  });
});