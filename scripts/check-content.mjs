// "npm run check": reports problems in content/ and customization/ without changing anything.
import { buildContent } from './content-lib.mjs';

const { errors } = await buildContent({ write: false });
process.exit(errors.length > 0 ? 1 : 0);
