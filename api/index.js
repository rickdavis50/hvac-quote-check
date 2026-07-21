// Vercel serverless entry. `npm run build` (the vercel.json buildCommand) compiles
// the server to dist/server via tsc; this re-exports that compiled Express app as
// the function handler. Importing compiled JS (not the .ts source) keeps Vercel's
// bundler out of the project's NodeNext ".js"-specifier resolution entirely.
export { default } from '../dist/server/server/app.js';
