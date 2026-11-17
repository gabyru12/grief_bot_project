// "npm run content": rebuilds public/generated/ from content/ and customization/.
// (The dev server and "npm run build" already do this automatically.)
import { buildContent } from './content-lib.mjs';

const { errors } = await buildContent({ write: true });
process.exit(errors.length > 0 ? 1 : 0);
