import fs from 'node:fs';

const pen = JSON.parse(fs.readFileSync('02-desktop-studio.pen', 'utf8'));

pen.children.slice(0, 6).forEach((f) => {
  console.log('=============================');
  console.log('FRAME:', f.id, f.name);
  if (f.children) {
    f.children.forEach((c) => {
      console.log(
        '  CHILD:',
        c.type,
        c.id,
        c.name || '',
        c.text ? JSON.stringify(c.text.substring(0, 50)) : '',
      );
      if (c.children) {
        c.children.slice(0, 5).forEach((gc) => {
          console.log(
            '    SUB:',
            gc.type,
            gc.id,
            gc.name || '',
            gc.text ? JSON.stringify(gc.text.substring(0, 40)) : '',
          );
        });
      }
    });
  }
});
