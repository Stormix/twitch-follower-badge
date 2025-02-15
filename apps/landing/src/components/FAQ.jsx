import { motion } from "framer-motion";
import { useState } from "react";

const FAQData = [
  {
    question: "How do I use Twitch Follower Badge?",
    answer: "After installing the extension, click the icon and log in with your Twitch account. The extension will automatically show you who follows you across Twitch - in chat, on profiles, and in stream previews.",
  },
  {
    question: "Is my information secure?",
    answer: "Yes, your privacy is our priority. We only use your Twitch OAuth token to check follower relationships, and we don't store any data on our servers. All follower information is fetched in real-time.",
  },
  {
    question: "Where can I see the follower badge?",
    answer: "The follower badge appears in multiple places: user profiles, chat user cards, stream pages, and stream thumbnails. It will show 'Follows you' whenever you encounter someone who follows your channel.",
  },
  {
    question: "Is Twitch Follower Badge free to use?",
    answer: "Yes, Twitch Follower Badge is completely free! Enhance your Twitch experience without any cost.",
  },
  {
    question: "How do I report issues or provide feedback?",
    answer: <p>We welcome your feedback! Feel free to submit any issues or suggestions on our GitHub page: <a target="_blank" className="text-twitch" href="https://github.com/Stormix/twitch-follower-badge/issues/new/choose">here</a></p>,
  },
  {
    question: "Does it work with other Twitch extensions?",
    answer: "Yes! Twitch Follower Badge is compatible with other Twitch extensions, including popular ones like 7TV, BTTV, and FFZ.",
  },
  {
    question: "Does it work on mobile devices?",
    answer: "Currently, Twitch Follower Badge is designed for desktop browsers (Chrome). Mobile support may be added in future updates.",
  },
  {
    question: "How often is the follower information updated?",
    answer: "Follower information is checked in real-time whenever you encounter a user on Twitch, ensuring you always have the most up-to-date information.",
  },
  {
    question: "What permissions does the extension require?",
    answer: "The extension only requires necessary Twitch permissions to check follower relationships. We use official Twitch OAuth for secure authentication.",
  }
];

export const FAQ = () => (
  <section className="relative pt-48 pb-16 bg-blueGray-50 overflow-hidden ">
    <div className="absolute -top-10" id="FAQ" />
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative z-10 container px-2 sm:px-8 lg:px-4 mx-auto w-11/12 sm:w-full">
        <div className="md:max-w-4xl mx-auto">
          <p className="mb-7 custom-block-subtitle text-center">
            Have any questions?
          </p>
          <h2 className="mb-16 custom-block-big-title text-center">
            Frequently Asked Questions
          </h2>
          <div className="mb-11 flex flex-wrap -m-1">
            {FAQData.map((item, index) => (
              <div className="w-full p-1">
                <FAQBox
                  title={item.question}
                  content={item.answer}
                  key={`${item.question}-${item.answer}`}
                  defaultOpen={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  </section>
);

const FAQBox = ({ defaultOpen, title, content }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="pt-2 sm:pt-6 pb-2 px-3 sm:px-8  rounded-3xl bg-customDarkBg3 custom-border-gray-darker mb-4 relative hover:bg-customDarkBg3Hover cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex flex-col p-2  justify-center items-start">
        <h3 className=" custom-content-title pt-3 sm:pt-0 pr-8 sm:pr-0">
          {title}
        </h3>
        <p
          className={`text-customGrayText pt-4 transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          {content}
        </p>
      </div>
      <div className="absolute top-6 right-4 sm:top-8 sm:right-8">
        <svg
          width="28px"
          height="30px"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-all duration-500  ${
            isOpen ? "rotate-[180deg]" : "rotate-[270deg]"
          }`}
        >
          <path
            d="M4.16732 12.5L10.0007 6.66667L15.834 12.5"
            stroke="#9147ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>
    </div>
  );
};
