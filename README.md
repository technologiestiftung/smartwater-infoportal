![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Smartwater Infoportal

This repository contains the source code for the Smartwater flood information portal, an interactive website on which Berlin citizens can find out about heavy rainfall and flooding and have their individual risks and dangers checked.

This Next.js application is being developed as part of the [Smart Water project](https://gemeinsamdigital.berlin.de/de/smart-water/) and thus is part of the state of Berlin's digital strategy.

The application uses the [Berlin UI Library](https://github.com/technologiestiftung/berlin-ui-library) for consistent design components and user interface elements.

## Prerequisites

- Node.js (v20 or later recommended)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/technologiestiftung/smartwater-infoportal.git
   cd smartwater-infoportal
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

   **Note:** The Berlin UI Library is installed automatically via the `install-lib` script when running `dev`, `build`, or `start` commands. If you need to install it separately:
   ```bash
   npm run install-lib
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration values.

## GeoServer Setup

The application requires a GeoServer instance for map data. You can run GeoServer using Docker Compose:

### Prerequisites for GeoServer
- Docker and Docker Compose
- Map data files stored in the `./maps` directory

### Running GeoServer
```bash
docker-compose up geoserver
```

The GeoServer data will be mounted from `./maps:/opt/geoserver_data/data/maps`, so make sure to place your map files in the `./maps` directory before starting the container.

### Environment Variables for GeoServer
Update your `.env` file with the GeoServer configuration:

```env
# GeoServer Configuration
GEOSERVER_BASE_URL=http://localhost:8080/geoserver
GEOSERVER_WORKSPACE=your_workspace_name
GEOSERVER_BUILDING_LAYER=your_building_layer_name
GEOSERVER_FLOOD_LAYER=your_flood_layer_name
```

## Usage or Deployment

To build the application for production:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm start
# or
yarn start
```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quick Start Summary

1. **Clone and install:**
   ```bash
   git clone https://github.com/technologiestiftung/smartwater-infoportal.git
   cd smartwater-infoportal
   npm install
   # Berlin UI Library will be installed automatically when running dev/build commands
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start GeoServer (optional, for full functionality):**
   ```bash
   # Place your map files in ./maps directory
   docker-compose up geoserver
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

## Environment Variables

The application requires several environment variables to be configured. Copy `.env.example` to `.env` and update the values:

```env
# Nominatim API Configuration
NOMINATIM_USER_AGENT=your_application_name

# GeoServer Configuration
GEOSERVER_BASE_URL=http://localhost:8080/geoserver
GEOSERVER_WORKSPACE=smartwater-infoportal
GEOSERVER_BUILDING_LAYER=ALKIS_Gebaeude_Gefaehrdung_SR_HW_0624
GEOSERVER_FLOOD_LAYER=HW_Gefaehrdung_clip_
```

### Environment Variable Descriptions

- `NOMINATIM_USER_AGENT`: Used for geocoding address searches
- `GEOSERVER_BASE_URL`: Base URL of your GeoServer instance
- `GEOSERVER_WORKSPACE`: GeoServer workspace containing your layers
- `GEOSERVER_BUILDING_LAYER`: Layer name for building hazard data
- `GEOSERVER_FLOOD_LAYER`: Layer name for flood zone data (used for GRAY_INDEX)

## Tests

Run the test suite:

```bash
npm test
# or
yarn test
```

Run tests in watch mode:
```bash
npm run test:watch
# or  
yarn test:watch
```

### Test Environment Setup
The tests automatically load environment variables from the `.env` file. Make sure you have:
1. Copied `.env.example` to `.env`
2. Configured your environment variables properly

### Test Types
The test suite includes:
- **Unit tests**: Hazard data processing, risk calculations
- **Integration tests**: GeoServer connectivity (requires running GeoServer instance)

**Note:** Integration tests require a running GeoServer instance. Start GeoServer with `docker-compose up geoserver` before running tests for full coverage.

## Contributing

Before you create a pull request, write an issue so we can discuss your changes.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JonathanHaudenschild-TsB"><img src="https://avatars.githubusercontent.com/u/201598680?v=4?s=64" width="64px;" alt="Jonathan Haudenschild"/><br /><sub><b>Jonathan Haudenschild</b></sub></a><br /><a href="https://github.com/technologiestiftung/template-default/commits?author=JonathanHaudenschild-TsB" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Content Licensing

Texts and content available as [CC BY](https://creativecommons.org/licenses/by/3.0/de/).

## Credits

<table>
  <tr>
    <td>
      Made by  <a href="https://www.technologiestiftung-berlin.de/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-technologiestiftung-berlin-de.svg" />
      </a>
    </td>
    <td>
      Supported by <a href="https://www.berlin.de/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-berlin.svg" />
      </a>
    </td>
  </tr>
  <tr>
  <td colspan="2">
  <img src="./public/logo.svg" alt="Logo">
</td>
</tr>
</table>
