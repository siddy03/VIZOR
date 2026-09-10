const fs = require('fs');
const files = [
  'c:/react-projects/VIZOR/VIZOR/frontend-next/src/app/(app)/surveys/add/AddSurveyForm.jsx',
  'c:/react-projects/VIZOR/VIZOR/frontend-next/src/components/shared/Table1.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/ binary /g, ' ');
  newContent = newContent.replace(/\s+binary\n/g, '\n');
  newContent = newContent.replace(/\s+binary>/g, '>');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
});
