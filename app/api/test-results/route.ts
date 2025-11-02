import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const resultsDir = path.join(process.cwd(), "tmp", "test-results");

    // Check if directory exists
    if (!fs.existsSync(resultsDir)) {
      return NextResponse.json({ results: [] });
    }

    // Get all JSON files
    const files = fs.readdirSync(resultsDir)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(resultsDir, a));
        const statB = fs.statSync(path.join(resultsDir, b));
        return statB.mtimeMs - statA.mtimeMs; // Most recent first
      });

    if (files.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Read the most recent batch file, or aggregate single tests
    const latestFile = files[0];
    const filePath = path.join(resultsDir, latestFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Check if it's a batch file (array) or single test (object)
    if (Array.isArray(data)) {
      return NextResponse.json({
        results: data,
        source: latestFile
      });
    } else {
      // Single test - get all single tests
      const singleTests = files
        .filter(f => f.startsWith('single-test-'))
        .slice(0, 10) // Limit to 10 most recent
        .map(file => {
          const content = fs.readFileSync(path.join(resultsDir, file), 'utf-8');
          return JSON.parse(content);
        });

      return NextResponse.json({
        results: singleTests,
        source: 'single-tests'
      });
    }
  } catch (error) {
    console.error("Error reading test results:", error);
    return NextResponse.json(
      { error: "Failed to load test results", results: [] },
      { status: 500 }
    );
  }
}
