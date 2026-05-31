// Generates idempotent INSERT SQL for the seed questions, importing the array
// from seed.ts (no DB connection). Output → tmp-seed.sql
require('ts-node/register/transpile-only');
const path = require('path');
const fs = require('fs');
const { questions } = require(path.join(__dirname, 'packages/db/prisma/seed.ts'));

const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const arr = (a) => 'ARRAY[' + a.map((x) => q(x)).join(',') + ']::text[]';

const rows = questions.map((item, i) => {
  const id = `seed-${item.topic.replace(/\s+/g, '-').toLowerCase()}-${item.year ?? 'na'}-${i}`;
  const explanation = 'explanation' in item && item.explanation != null ? q(item.explanation) : 'NULL';
  const year = item.year != null ? item.year : 'NULL';
  return `(${q(id)}, ${q(item.latexQuestion)}, ${arr(item.options)}, ${item.correctOption}, ${q(item.subject)}::"Subject", ${q(item.topic)}, ${q(item.difficulty)}::"Difficulty", ${year}, ${q(item.source)}::"QuestionSource", ${explanation}, true)`;
});

const sql =
  'INSERT INTO "Question" ("id","latexQuestion","options","correctOption","subject","topic","difficulty","year","source","explanation","isActive") VALUES\n' +
  rows.join(',\n') +
  '\nON CONFLICT ("id") DO NOTHING;\n';

fs.writeFileSync(path.join(__dirname, 'tmp-seed.sql'), sql);
console.log(`Generated ${questions.length} question rows → tmp-seed.sql (${sql.length} bytes)`);
