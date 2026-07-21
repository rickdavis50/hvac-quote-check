// pdf-parse ships types for its package root only. We import the lib entry to
// avoid an import-time side effect (see extraction.ts); reuse the root's type.
declare module 'pdf-parse/lib/pdf-parse.js' {
  import pdf from 'pdf-parse';
  export default pdf;
}
