module.exports = {
  siteMetadata: {
    title: `OrnateLabyrinth`,
    name: `Deepak`,
    siteUrl: `https://deepakgouda.netlify.app/`,
    description: `This is my description`,
    hero: {
      heading: `Welcome to OrnateLabyrinth, my personal space`,
      maxWidth: 652,
    },
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/deepakgouda_`,
      },
      {
        name: `github`,
        url: `https://github.com/deepakgouda`,
      },
      {
        name: `instagram`,
        url: `https://instagram.com/deepak.gouda_`,
      },
      {
        name: `linkedin`,
        url: `https://www.linkedin.com/in/deepakgouda/`,
      },
    ],
  },
  plugins: [
    {
      resolve: "@narative/gatsby-theme-novela",
      options: {
        contentPosts: "content/posts",
        contentAuthors: "content/authors",
        basePath: "/",
        authorsPage: true,
        sources: {
          local: true,
          // contentful: true,
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Novela by Narative`,
        short_name: `Novela`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#fff`,
        display: `standalone`,
        icon: `src/assets/favicon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-netlify-cms`,
      options: {
      },
    },
  ],
};
