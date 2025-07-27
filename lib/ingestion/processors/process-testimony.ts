import fs from 'fs/promises';
import path from 'path';
import * as Sentry from '@sentry/node';
import type { TestimonyEntry } from './types';

const logger = Sentry;

export function extractMetadata(content: string) {
  const lines = content.split('\n');
  let metadata: any = {};
  let transcriptionStart = -1;

  // Find the title line (second line usually contains the interview info)
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim();

    // Extract interview details from title line - more flexible pattern
    if (
      line.includes('David P. Boder Interviews') ||
      line.includes(' Interviews ')
    ) {
      // Main pattern: "David P. Boder Interviews Henry Sochami, August 12, 1946, Paris, France"
      // Need to handle dates like "September 25, 1946" as a single unit
      const mainPattern =
        /(.*?)\s+Interviews\s+([^,]+),\s+([A-Za-z]+\s+\d{1,2},\s+\d{4}),\s+(.+)/;
      const titleMatch = line.match(mainPattern);

      if (titleMatch) {
        metadata.interviewer = titleMatch[1].trim();
        metadata.interviewee = titleMatch[2].trim();

        // Third group should be the date
        const potentialDate = titleMatch[3].trim();
        // Fourth group should be the location
        const potentialLocation = titleMatch[4].trim();

        // Check if the third group looks like a date (month name + day + year)
        const datePattern =
          /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}$/i;

        if (datePattern.test(potentialDate)) {
          metadata.date = potentialDate;
          metadata.location = potentialLocation;
        } else {
          // If not a clear date pattern, might be arranged differently
          // Try to find date pattern in either position
          if (datePattern.test(potentialLocation)) {
            metadata.date = potentialLocation;
            metadata.location = potentialDate;
          } else {
            // Fallback - assign as best guess
            metadata.date = potentialDate;
            metadata.location = potentialLocation;
          }
        }

        metadata.title = `${metadata.interviewer} Interviews ${metadata.interviewee}`;
      } else {
        // Fallback patterns for different formats
        const fallbackPatterns = [
          // Handle cases with no location
          /(.*?)\s+Interviews\s+(.*?),\s+(.*?)$/,
          // Just name extraction
          /(.*?)\s+Interviews\s+(.*?)$/,
        ];

        for (const pattern of fallbackPatterns) {
          const fallbackMatch = line.match(pattern);
          if (fallbackMatch) {
            metadata.interviewer = fallbackMatch[1].trim();
            metadata.interviewee = fallbackMatch[2].trim();

            if (fallbackMatch[3]) {
              const thirdPart = fallbackMatch[3].trim();
              const datePattern =
                /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}$/i;

              if (datePattern.test(thirdPart)) {
                metadata.date = thirdPart;
              } else {
                metadata.location = thirdPart;
              }
            }

            metadata.title = `${metadata.interviewer} Interviews ${metadata.interviewee}`;
            break;
          }
        }
      }
    }

    // Extract URL
    if (line.startsWith('https://') || line.startsWith('http://')) {
      metadata.url = line;
    }

    // Extract media file
    if (line.startsWith('Media File:')) {
      metadata.mediaFile = line.replace('Media File:', '').trim();
    }

    // Extract transcription file
    if (line.startsWith('Transcription File:')) {
      metadata.transcriptionFile = line
        .replace('Transcription File:', '')
        .trim();
    }

    // Extract description
    if (line.startsWith('Description:')) {
      metadata.description = line.replace('Description:', '').trim();
    }

    // Extract export date
    if (line.startsWith('Plain Text Exported From Aviary:')) {
      metadata.exportDate = line
        .replace('Plain Text Exported From Aviary:', '')
        .trim();
    }

    // Find transcription start
    if (line === 'TRANSCRIPTION BEGIN') {
      transcriptionStart = i + 1;
      break;
    }
  }

  return {metadata, transcriptionStart};
}

function cleanTranscription(content: string): string {
  return (
    content
      // Clean up speaker attribution but keep timestamps
      .replace(/^(.*?):\s*\[.*?\]\s*/gm, '$1: ')
      // Remove language indicators in brackets but keep timestamps
      .replace(/\[auf deutsch\]/g, '')
      .replace(/\[In English\]/g, '')
      // Remove editorial notes but keep timestamps
      .replace(/\[<em>.*?<\/em>\]/g, '')
      .replace(/\[unintelligible\]/g, '[?]')
      .replace(/\[\?\?\]/g, '[?]')
      // Clean up multiple spaces but preserve line structure
      .replace(/[ ]+/g, ' ')
      // Clean up excessive newlines but keep paragraph structure
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      // Remove "TRANSCRIPTION END" if present
      .replace(/TRANSCRIPTION END[\s\S]*$/, '')
      .trim()
  );
}

async function processTestimonyFile(filePath: string): Promise<void> {
  const filename = path.basename(filePath);
  logger.addBreadcrumb({
    message: 'Starting testimony file processing',
    level: 'info',
    data: {
      filename,
      filePath
    }
  });

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    const {metadata, transcriptionStart} = extractMetadata(content);

    if (transcriptionStart === -1) {
      logger.addBreadcrumb({
        message: 'Could not find transcription start in file',
        level: 'warning',
        data: {
          filename,
          filePath
        }
      });
      return;
    }

    // Extract the transcription content
    const lines = content.split('\n');
    const transcriptionLines = lines.slice(transcriptionStart);
    let transcriptionContent = transcriptionLines.join('\n');

    // Find and remove "TRANSCRIPTION END"
    const endIndex = transcriptionContent.indexOf('TRANSCRIPTION END');
    if (endIndex !== -1) {
      transcriptionContent = transcriptionContent.substring(0, endIndex);
    }

    // Clean the transcription
    const cleanedContent = cleanTranscription(transcriptionContent);

    // Extract the full metadata line from line 3 for the header
    const rawLines = content.split('\n');
    const metadataLine =
      rawLines[2]?.trim() ||
      metadata.title ||
      `David P. Boder Interviews ${metadata.interviewee || 'Unknown'}`;

    // Create header with the actual metadata line from the raw file

    // Create filename using interviewee's name
    const intervieweeName =
      metadata.interviewee || filename.replace('.txt', '');
    const safeFilename = intervieweeName
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Write processed testimony to txt directory
    const txtOutputPath = path.join(
      `${process.env.USER_DATA_PATH}/hf-custom-backup-processed/testimony/txt`,
      `${safeFilename}.txt`,
    );
    await fs.writeFile(txtOutputPath, cleanedContent);

    logger.addBreadcrumb({
      message: 'Successfully processed testimony file',
      level: 'info',
      data: {
        filename,
        safeFilename,
        outputPath: txtOutputPath,
        interviewee: metadata.interviewee,
        interviewer: metadata.interviewer,
        date: metadata.date,
        location: metadata.location
      }
    });
  } catch (error) {
    logger.captureException(error, {
      tags: {
        operation: 'process_testimony_file',
        filename
      },
      extra: {
        filePath,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

async function generateTestimonyJson(): Promise<void> {
  logger.addBreadcrumb({
    message: 'Starting testimony.json generation',
    level: 'info'
  });

  const txtDir = path.join(
    `${process.env.USER_DATA_PATH}/hf-custom-backup-processed/testimony/txt`,
  );

  try {
    const txtFiles = await fs.readdir(txtDir);
    const testimonyEntries: TestimonyEntry[] = [];

    for (const txtFile of txtFiles) {
      if (txtFile.endsWith('.txt')) {
        const title = txtFile.replace('.txt', '');
        const txtPath = path.join(txtDir, txtFile);
        const content = await fs.readFile(txtPath, 'utf-8');

        // Try to parse metadata from the original file to get better info
        const rawDir = path.join(
          `${process.env.USER_DATA_PATH}/hf-custom-backup/testimony/raw`,
        );

        let metadata: any = {};
        try {
          const rawFiles = await fs.readdir(rawDir);
          const matchingRawFile = rawFiles.find(
            f =>
              f.toLowerCase().includes(title.split(' ')[0].toLowerCase()) ||
              title.toLowerCase().includes(f.split('.')[0].toLowerCase()),
          );

          if (matchingRawFile) {
            const rawContent = await fs.readFile(
              path.join(rawDir, matchingRawFile),
              'utf-8',
            );
            const {metadata: extractedMetadata} = extractMetadata(rawContent);
            metadata = extractedMetadata;
          }
        } catch (error) {
          logger.addBreadcrumb({
            message: 'Could not find raw file for testimony entry',
            level: 'warning',
            data: {
              title,
              txtFile
            }
          });
        }

        // Create testimony entry
        const entry: TestimonyEntry = {
          title: metadata.title || title,
          interviewee: metadata.interviewee || 'Unknown',
          interviewer: metadata.interviewer || 'David P. Boder',
          date: metadata.date || 'Unknown',
          location: metadata.location || 'Unknown',
          content: content.trim(),
          txtFile: `sources/processed/testimony/txt/${txtFile}`,
          ...(metadata.url && {url: metadata.url}),
          ...(metadata.mediaFile && {mediaFile: metadata.mediaFile}),
          ...(metadata.transcriptionFile && {
            transcriptionFile: metadata.transcriptionFile,
          }),
          ...(metadata.description && {description: metadata.description}),
          ...(metadata.exportDate && {exportDate: metadata.exportDate}),
        };

        testimonyEntries.push(entry);
      }
    }

    // Sort entries alphabetically by interviewee name
    testimonyEntries.sort((a, b) => a.interviewee.localeCompare(b.interviewee));

    // Write testimony.json
    const testimonyPath = path.join(
      `${process.env.USER_DATA_PATH}/hf-custom-backup/testimony`,
      'testimony.json',
    );

    const testimonyData = {
      generated: new Date().toISOString(),
      totalEntries: testimonyEntries.length,
      entries: testimonyEntries,
    };

    await fs.writeFile(testimonyPath, JSON.stringify(testimonyData, null, 2));
    logger.addBreadcrumb({
      message: 'Successfully generated testimony.json',
      level: 'info',
      data: {
        totalEntries: testimonyEntries.length,
        outputPath: testimonyPath,
        generatedAt: testimonyData.generated
      }
    });
  } catch (error) {
    logger.captureException(error, {
      tags: {
        operation: 'generate_testimony_json'
      },
      extra: {
        txtDir,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

async function deleteProcessedTestimonyFiles(): Promise<void> {
  const txtDir = path.join(
    `${process.env.USER_DATA_PATH}/hf-custom-backup-processed/testimony/txt`,
  );

  try {
    const txtFiles = await fs.readdir(txtDir);
    for (const file of txtFiles) {
      const filePath = path.join(txtDir, file);
      await fs.unlink(filePath);
      logger.addBreadcrumb({
        message: 'Deleted testimony file',
        level: 'info',
        data: {
          filename: file,
          filePath
        }
      });
    }
  } catch (error) {
    logger.addBreadcrumb({
      message: 'No testimony files to delete or directory does not exist',
      level: 'info',
      data: {
        txtDir,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

async function main() {
  // Get all txt files in sources/raw/testimony directory
  const testimonyDir = path.join(
    `${process.env.USER_DATA_PATH}/hf-custom-backup/testimony/raw`,
  );
  const processedTxtDir = path.join(
    `${process.env.USER_DATA_PATH}/hf-custom-backup-processed/testimony/txt`,
  );

  // Ensure processed directory exists
  await fs.mkdir(processedTxtDir, {recursive: true});

  try {
    const testimonyFiles = await fs.readdir(testimonyDir);

    for (const file of testimonyFiles) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(testimonyDir, file);
        await processTestimonyFile(filePath);
      } else {
        logger.addBreadcrumb({
          message: 'Skipping non-txt file',
          level: 'info',
          data: {
            filename: file,
            directory: testimonyDir
          }
        });
      }
    }

    // Generate testimony.json after processing all files
    await generateTestimonyJson();
  } catch (error) {
    logger.captureException(error, {
      tags: {
        operation: 'process_testimony_main'
      },
      extra: {
        testimonyDir,
        processedTxtDir,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--delete') || args.includes('-d')) {
  deleteProcessedTestimonyFiles().catch(error => {
    logger.captureException(error, {
      tags: {
        operation: 'delete_testimony_files'
      },
      extra: {
        args,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
  });
} else {
  main().catch(error => {
    logger.captureException(error, {
      tags: {
        operation: 'testimony_processor_main'
      },
      extra: {
        args,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
  });
}
