import logo from "../assets/images/icon.png";

const footerData = [
  {
    title: "Important Links",
    items: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Github", href: "https://github.com/Stormix/twitch-follower-badge" },
      { name: 'Stormix\'s Website', href: 'https://stormix.co' },
      { name: 'Discord', href: 'https://discord.gg/RpPHDHZmqx' },
      { name: 'Twitch stream', href: 'https://www.twitch.tv/stormix_dev' },
    ],
  },
];

export const Footer = () => {
  return (
    <footer>
      <div className="pt-10  lg:pt-20 lg:pb-12 bg-customDarkBg1 radius-for-skewed ">
        <div className="container mx-auto px-4 w-4/5 md:w-11/12 lg:w-10/12 xl:w-4/5 2xl:w-2/3">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-1/3 mb-16 lg:mb-0">
              <div className="flex justify-center lg:justify-start items-center grow basis-0">
                <div className="text-white mr-2 text-6xl">
                  <img src={logo} alt="Twitch Follower Badge Logo" className="w-10 h-10" />
                </div>
                <div className="text-white font-['Inter'] font-bold text-xl">
                  Twitch Follower Badge
                </div>
              </div>
              <p className="mb-10 mt-4 sm:w-[22rem] lg:w-[20rem] xl:w-[24rem] text-gray-400 leading-loose text-center lg:text-left mx-auto lg:mx-0">
                Know your community better than ever before. See who follows you anywhere on Twitch.
              </p>
            </div>
            <div className="w-full lg:w-2/3  lg:pl-16 hidden lg:flex flex-wrap justify-end">
              <div className="w-full md:w-1/3 lg:w-auto mb-16 md:mb-0">
                <h3 className="mb-6 text-2xl font-bold text-white">
                  Important Links
                </h3>
                <ul>
                  {footerData[0].items.map((item, i) => (
                    <li key={i} className="mb-4">
                      <a
                        className="text-gray-400 hover:text-gray-300"
                        href={item.href}
                        target="_blank"
                        aria-label={item.name}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-10 text-center text-sm leading-5 text-zinc-500">
            © <b>{new Date().getFullYear()}</b> Twitch Follower Badge, a project by <a href="https://github.com/Stormix/" target="_blank" rel="noopener noreferrer" className="text-twitch">
              Stormix</a>
            .<br />Twitch, and all associated properties are trademarks or registered trademarks of Twitch Interactive, Inc.</p>
        </div>
      </div>
    </footer>
  );
};
