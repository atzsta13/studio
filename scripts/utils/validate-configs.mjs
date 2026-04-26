import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const SCHEMA_FILE = path.join(process.cwd(), 'festivals', 'festival-config.schema.json');
const FESTIVALS_DIR = path.join(process.cwd(), 'festivals');

export function validateAllConfigs() {
  console.log('🔍 Validating all festival configurations...');

  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error('❌ Schema file not found!');
    process.exit(1);
  }

  const schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  const validate = ajv.compile(schema);

  const festivals = fs.readdirSync(FESTIVALS_DIR).filter(f => 
    fs.statSync(path.join(FESTIVALS_DIR, f)).isDirectory() && f !== 'assets' && f !== 'data'
  );

  let hasErrors = false;

  for (const festivalId of festivals) {
    const configPath = path.join(FESTIVALS_DIR, festivalId, 'config.json');
    if (!fs.existsSync(configPath)) continue;

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const valid = validate(config);

    if (!valid) {
      console.error(`❌ [${festivalId}] Invalid config.json:`);
      validate.errors.forEach(err => {
        console.error(`   - ${err.instancePath || 'root'} ${err.message} (${JSON.stringify(err.params)})`);
      });
      hasErrors = true;
    } else {
      console.log(`✅ [${festivalId}] Config is valid.`);
    }
  }

  if (hasErrors) {
    console.error('💥 Sync aborted due to config validation errors.');
    process.exit(1);
  }
}

// Allow running as a standalone script
if (import.meta.url.endsWith(process.argv[1])) {
  validateAllConfigs();
}
