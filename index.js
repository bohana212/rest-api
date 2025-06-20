const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/src', express.static('src'));

const apiConfig = require('./src/web-set.json');

const baseDir = path.resolve('api-setting', 'Scrape');
const scrapers = {};
const endpointConfigs = {};

// Load endpoint config dari web-set.json
apiConfig.categories.forEach(category => {
  category.items.forEach(item => {
    const cleanPath = item.path.split('?')[0];
    endpointConfigs[cleanPath] = {
      requireKey: item.requireKey ?? apiConfig.apiSettings.defaultRequireKey,
      path: item.path
    };
  });
});

// Auto-scan semua file .js dari folder Scrape
const walkDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.js')) {
      const relativePath = path.relative(baseDir, fullPath);
      const routePath = '/' + relativePath.replace(/\\/g, '/').replace('.js', '').toLowerCase();

      const config = endpointConfigs[routePath] || {
        requireKey: apiConfig.apiSettings.defaultRequireKey
      };

      scrapers[routePath] = {
        handler: require(fullPath),
        config
      };
    }
  });
};

walkDir(baseDir);

// Middleware API Key Checker
const checkApiKey = (req, res, next) => {
  const route = req.path;
  const endpoint = scrapers[route];
  if (!endpoint) return next();

  if (!endpoint.config.requireKey) return next();

  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  if (!apiKey) {
    return res.status(401).json({ status: false, message: 'API key diperlukan untuk endpoint ini' });
  }
  if (!apiConfig.apiSettings.globalKey.includes(apiKey)) {
    return res.status(403).json({ status: false, message: 'API key tidak valid' });
  }
  next();
};

// Generate route otomatis
Object.entries(scrapers).forEach(([route, { handler, config }]) => {
  app.get(route, checkApiKey, async (req, res) => {
    try {
      const params = Object.keys(req.query)
        .filter(k => k !== 'apikey')
        .map(k => req.query[k]);
      const result = await handler(...params);
      res.json({
        status: true,
        creator: apiConfig.apiSettings.creator,
        result
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: e.message
      });
    }
  });

  // Show example jika path butuh parameter
  if (config.path && config.path.includes('?')) {
    app.get(config.path.split('?')[0], checkApiKey, (req, res) => {
      res.status(400).json({
        status: false,
        message: 'Parameter diperlukan',
        example: `${req.protocol}://${req.get('host')}${config.path}param_value`
      });
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log('Endpoint yang tersedia:');
  Object.entries(scrapers).forEach(([path, { config }]) => {
    console.log(`- ${path} (Require Key: ${config.requireKey ? 'Ya' : 'Tidak'})`);
  });
});

module.exports = app;