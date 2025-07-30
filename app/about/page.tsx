import * as motion from "motion/react-client";
import { ArrowUpRight, MessagesSquare, Server, Database } from "lucide-react";
import Link from "next/link";
import { ANIMATION_CONFIG, PAGE_STYLING, sectionVariant } from "./config";

const AboutPage = () => {
  return (
    <div className={PAGE_STYLING.container}>
      <div className={PAGE_STYLING.spacing}>
        <motion.div
          className={PAGE_STYLING.sectionSpacing}
          initial="hidden"
          animate="visible"
          variants={sectionVariant}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold">Mission</h2>
            <p className={PAGE_STYLING.paragraphClasses}>
              Zekher (זכר, "remembrance" in Hebrew) is an open-source project
              that integrates high-quality sources about the Holocaust into the
              generative artificial intelligence answer pipeline. The goal is to
              preserve Holocaust memory with AI—both by mitigating Holocaust
              denial in large language models’ answers and by connecting users
              with verified information and survivor testimonies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold ">Problem</h2>
            <p className={PAGE_STYLING.paragraphClasses}>
              Even before users encountered{" "}
              <Link
                href="https://www.theguardian.com/technology/2025/may/18/musks-ai-bot-grok-blames-its-holocaust-scepticism-on-programming-error"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Holocaust denial content from xAI's Grok
              </Link>
              <ArrowUpRight className="inline w-4 h-4" />, a{" "}
              <Link
                href="https://www.unesco.org/en/articles/unesco-and-world-jewish-congress-report-shows-holocaust-denial-and-distortion-proliferating-social"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                UNESCO report
              </Link>
              <ArrowUpRight className="inline w-4 h-4" /> warned of risks to
              Holocaust memory both embedded in the technology and possible with
              bad actors. LLMs have invented survivor quotes and “hallucinated”
              about less-documented history. Generative AI is so ubiquitous that
              not confronting these challenges risks mass-disinformation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold">Resources</h2>
            <p className={PAGE_STYLING.paragraphClasses}>
              Zekher processes, stores, and utilizes documents from{" "}
              <Link
                href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Yad Vashem's Holocaust Lexicon
              </Link>
              <ArrowUpRight className="inline w-4 h-4" /> and{" "}
              <Link
                href="https://voices.library.iit.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Dr. David P. Boder's survivor interviews
              </Link>
              <ArrowUpRight className="inline w-4 h-4" />. There is no chunking
              or AI summary as part of the ingestion process, just PDF to text
              conversion and cleanup. Post-ingestion, Zekher’s technology does
              not strain museum or university servers.
            </p>
            <p className={PAGE_STYLING.paragraphClasses}>
              That information powers a familiar{" "}
              <Link href="/chat" className="underline">
                Chat
              </Link>
              <MessagesSquare className="inline w-4 h-4 ml-1" /> experience. The
              system uses Lexicon content to answer user’s queries before
              offering real interview audio snippets as a supplement. The system
              is agentic, meaning that the LLM has access to tools that query
              the data sources and enable citations. Zekher’s system prompt
              tells the model to acknowledge if information is missing in the
              Lexicon and prohibits summarizing survivor testimony. Users can
              read and listen to the sources once the model sees them.
            </p>
            <p className={PAGE_STYLING.paragraphClasses}>
              A{" "}
              <Link href="/mcp" className="underline">
                Model Context Protocol (MCP)
              </Link>
              <Server className="inline w-4 h-4 ml-1" /> server that can be used
              to add Zekher's Lexicon functionality into{" "}
              <Link
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Anthropic's Claude
              </Link>
              <ArrowUpRight className="inline w-4 h-4" />,{" "}
              <Link
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                OpenAI's ChatGPT
              </Link>
              <ArrowUpRight className="inline w-4 h-4" />, etc. But it could
              perhaps be more useful for developers of other agentic chatbots
              who would like to prevent Holocaust denial in their applications.
            </p>
            <p className={PAGE_STYLING.paragraphClasses}>
              A unified{" "}
              <Link href="/sources" className="underline">
                source library
              </Link>
              <Database className="inline w-4 h-4 ml-1" /> that is the landing
              page for citations from both Chat and MCP.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold">Acknowledgements</h2>
            <p className={PAGE_STYLING.paragraphClasses}>
              Thank you to the many people who have advised and supported me
              since I started working on this project in 2023. Every
              conversation has led to a feature in V3.
            </p>
            <p className={PAGE_STYLING.paragraphClasses}></p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
