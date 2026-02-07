import 'dotenv/config';
console.log('--- Environment Check ---');
console.log('CWD:', process.cwd());
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  const key = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY start:', key.substring(0, 7));
  console.log('GEMINI_API_KEY end:', key.substring(key.length - 4));
} else {
  console.log('GEMINI_API_KEY is MISSING or EMPTY');
}
console.log('PORT:', process.env.PORT);
console.log('-------------------------');
