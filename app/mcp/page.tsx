import * as motion from "motion/react-client";
import { ArrowUpRight, Code, Terminal } from "lucide-react";
import Link from "next/link";
import { ANIMATION_CONFIG, PAGE_STYLING, sectionVariants } from "./config";

const DevelopersPage = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <div className={PAGE_STYLING.container}>
      <div className={PAGE_STYLING.spacing}>
        <motion.div
          className={PAGE_STYLING.sectionSpacing}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold">Zekher's MCP Server</h2>
            <p className="mt-4 text-lg">
              Zekher provides a Model Context Protocol (MCP) server that enables
              access to Yad Vashem's Holocaust Lexicon content through any
              MCP-compatible AI client, including Anthropic's{" "}
              <Link
                className="underline"
                href="https://claude.ai/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Claude
              </Link>
              <ArrowUpRight className="inline w-4 h-4" />, OpenAI's{" "}
              <Link
                className="underline"
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                ChatGPT
              </Link>
              <ArrowUpRight className="inline w-4 h-4" />, and custom
              applications. The server provides structured access to historical
              information with proper citations and usage guidelines.
              Unfortunately, no major AI apps support MCP free of charge. Once
              there is an option, this will cease being simply a developer
              feature.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold">Claude Setup</h2>
            <p className="mt-4 text-lg">
              To add Zekher's MCP server to Claude, you need to configure a
              Custom Connector.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Configuration Steps
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-lg">
                  <li>
                    Find{" "}
                    <Link
                      className="underline"
                      href="https://claude.ai/settings/connectors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Connectors
                    </Link>
                    <ArrowUpRight className="inline w-4 h-4" /> in Settings
                  </li>
                  <li>Tap "Add custom connector"</li>
                  <li>Enter the server URL and name the connector</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Server Configuration
                </h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Server URL:</span>
                      <br />
                      <code className="text-foreground">{baseUrl}/sse</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Protocol:</span>
                      <br />
                      <code className="text-foreground">
                        SSE (Server-Sent Events)
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold">Other Clients</h2>
            <p className="mt-4 text-lg">
              Other MCP-compatible clients may have variations in their spec
              compliance. If{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                {baseUrl}/sse
              </code>{" "}
              doesn't work, try{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                {baseUrl}handler/mcp
              </code>{" "}
              as the server URL. The implementation differences across clients
              can affect which endpoint responds correctly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold">Available Capabilities</h2>
            <p className="mt-4 text-lg">
              Once connected, the MCP server provides access to these
              capabilities:
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Tools</h3>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    yad_vashem_holocaust_lexicon
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Search Yad Vashem's Holocaust Lexicon for historical
                    information and terminology. Returns up to 6 sources with
                    proper citations and usage guidelines.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Parameters:</strong> Search terms to query the
                    Holocaust Lexicon (maximum 6 terms)
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Prompts</h3>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    holocaust_education_context
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Provides context and guidelines for using the Yad Vashem
                    Holocaust Lexicon responsibly and effectively in AI
                    applications.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Type:</strong> Prompt template for proper Holocaust
                    education context
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold">Developer Interest</h2>
            <p className="mt-4 text-lg">
              If you're interested in using Zekher's MCP server for your
              applications or have questions about integration, please reach out
              to{" "}
              <Link href="mailto:support@zekher.com" className="underline">
                support@zekher.com
              </Link>
              . We're gauging developer interest and would love to hear about
              your use case.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DevelopersPage;
