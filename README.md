# Kontent.ai Kickstart Sample React App

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Discord][discord-shield]][discord-url]

This repository contains the solution for the Kontent.ai Kickstart Sample React App. It serves as a learning resource for those starting new projects with Kontent.ai, providing a foundational template to build upon.

If you'd like to explore a fully set up Kontent.ai project, you can import content from one of the backups located in the `./scripts/backups` folder.

```bash
npm run model:import --filename="<path-to-the-script>"
```

## Contributing

### How to Contribute

- **Report Issues**: Use the [GitHub Issues](https://github.com/kontent-ai/kickstart-react-app/issues) to report bugs or request features.
- **Fork the Repository**: Create a personal fork of the repository on GitHub.
- **Create a Feature Branch**: Use a descriptive name for your branch.
- **Submit a Pull Request**: Submit your changes for review.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

### Code of Conduct

This project adheres to a [Code of Conduct](https://github.com/kontent-ai/.github/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Getting Started with Development

- Run `npm ci` to install packages.
- Create a `.env` file from `.env.template` and fill out all necessary variables.
- Run `npm run dev` to run the application in developer mode.

### Regenerating model
After updating the Kickstart application's content model, the TypeScript models must also be regenerated. We've provided a script to automate this process using the [Kontent.ai Model Generator](https://github.com/kontent-ai/model-generator-js).

```bash
npm run model:generate
```
> [!NOTE]
> Ensure that the `.env` file contains the `VITE_ENVIRONMENT_ID` and `VITE_MANAGEMENT_API_KEY` variables for proper model generation.


## Microsite / Multi-Channel Preview

This application supports rendering **Landing Page** content items as standalone microsites. Microsites are ideal for promoting events, campaigns, or services on separate domains with their own navigation and design.

### How It Works

The microsite preview uses the `landing_page` content type with the following structure:
- **Headline** - The main title displayed in the hero section
- **Subheadline** - Supporting text in the hero
- **Hero Image** - Background image or video for the hero section
- **Body Copy** - Rich text content for the main body
- **Featured Content** - Linked events, articles, or CTAs to highlight
- **Subpages** - Linked `page` items that become the microsite navigation

### Setting Up a Microsite in Kontent.ai

1. **Create a Landing Page item**
   - Go to your Kontent.ai project
   - Create a new content item of type `Landing Page`
   - Fill in the headline, subheadline, and hero image

2. **Add Subpages for Navigation**
   - In the `Subpages` element, link existing `Page` content items
   - These pages will automatically appear as navigation items in the microsite
   - The order of linked pages determines the navigation order

3. **Configure the Preview URL**
   - Go to **Project settings** > **Preview URLs**
   - Add a new preview URL for the `Landing Page` content type:
   ```
   https://your-domain.com/microsite-preview/{Codename}?preview=true
   ```
   - For local development:
   ```
   http://localhost:3000/microsite-preview/{Codename}?preview=true
   ```

4. **Optional: Add Featured Content**
   - Link events, articles, or call-to-action items to display in a featured section

### Accessing the Microsite Preview

The microsite preview is available at:
```
/microsite-preview/:slug
```

Where `:slug` is the codename of your Landing Page content item.

**Example URL:**
```
http://your-domain.com/microsite-preview/wellness_summit_2026?preview=true
```

### Design Differences from Main Site

| Feature | Main Site | Microsite |
|---------|-----------|-----------|
| Header | Full navigation with logo | Compact header with microsite title |
| Navigation | Global site navigation | Built from subpages linked to the Landing Page |
| Hero | Side-by-side layout | Full-width with gradient overlay |
| Footer | Full navigation | Minimal with copyright |
| Layout | Shared header/footer | Standalone, isolated design |

### Multi-Channel Use Cases

- **Event Promotion** - Create dedicated microsites for conferences, webinars, or workshops
- **Campaign Landing Pages** - Launch marketing campaigns with focused content
- **Product Launches** - Build standalone sites for new product announcements
- **Regional Sites** - Create localized microsites for different markets (use the `lang` query parameter)

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.

---

## Support

If you have any questions or need assistance, please reach out:

- **Kontent.ai Support**: [Contact Support](https://kontent.ai/support/)

---

## Additional Resources

- **Kontent.ai Official Documentation**: [Learn more about Kontent.ai](https://kontent.ai/learn/)

---

[contributors-shield]: https://img.shields.io/github/contributors/kontent-ai/kickstart-react-app?style=for-the-badge
[contributors-url]: https://github.com/kontent-ai/kickstart-react-app/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/kontent-ai/kickstart-react-app.svg?style=for-the-badge
[forks-url]: https://github.com/kontent-ai/kickstart-react-app/network/members
[stars-shield]: https://img.shields.io/github/stars/kontent-ai/kickstart-react-app.svg?style=for-the-badge
[stars-url]: https://github.com/kontent-ai/kickstart-react-app/stargazers
[issues-shield]: https://img.shields.io/github/issues/kontent-ai/kickstart-react-app.svg?style=for-the-badge
[issues-url]: https://github.com/kontent-ai/kickstart-react-app/issues
[license-shield]: https://img.shields.io/github/license/kontent-ai/kickstart-react-app.svg?style=for-the-badge
[license-url]: https://github.com/kontent-ai/kickstart-react-app/blob/master/LICENSE.md
[discord-shield]: https://img.shields.io/discord/821885171984891914?color=%237289DA&label=Kontent.ai%20Discord&logo=discord&style=for-the-badge
[discord-url]: https://discord.com/invite/SKCxwPtevJ

