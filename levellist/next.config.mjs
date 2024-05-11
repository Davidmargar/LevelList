/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
            source: '/games',
            destination: 'https://api.igdb.com/v4/games/',
        },
        {
            source: '/covers',
            destination: 'https://api.igdb.com/v4/covers'
        }
      ];
    }
  };
  
  export default nextConfig;
