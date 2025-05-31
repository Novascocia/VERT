import fs from 'fs';
import path from 'path';

const traitsFile = path.join(process.cwd(), 'traits', 'verticals_with_charactercolor.json');

function flattenTraitList(categoryObj: any): any[] {
  if (Array.isArray(categoryObj)) return categoryObj;
  return Object.values(categoryObj).flat();
}

export function getRandomTraits(): Record<string, any> {
  const traitsData = JSON.parse(fs.readFileSync(traitsFile, 'utf8'));
  const selectedTraits: Record<string, any> = {};

  for (const category of Object.keys(traitsData)) {
    const categoryData = traitsData[category];
    const traitList = flattenTraitList(categoryData);
    if (traitList.length > 0) {
      const randomIndex = Math.floor(Math.random() * traitList.length);
      selectedTraits[category] = traitList[randomIndex];
    }
  }
  return selectedTraits;
} 