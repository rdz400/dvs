/**
 * Lijst maken van recente dagdoelen
 */


console.log(input.begindatum);

const beginDatum = input.begindatum ? input.begindatum : dv.date("2010-12-01");
const eindDatum = input.einddatum ? input.einddatum : dv.date("2050-01-01");

function filterDatums(el) {
    return (el.date >= beginDatum) && (el.date <= eindDatum)
}


const queryPagesFocus = `
    "0-workspace/0-doen"
    and
    -"0-workspace/0-doen/speciaal"
    and
    -"0-workspace/0-doen/oud"
    `.trim();


const focusPages = dv.pages(queryPagesFocus).sort(el => el.date, 'desc').filter(filterDatums);
const lijst = focusPages.file.lists.filter(el => (el.parent === undefined));


for (const page of focusPages) {
    dv.paragraph('----');
    dv.header(2, dv.fileLink(page.file.name));
    const items = page.file.lists.groupBy(el => el.section)
    for (const section of items) {
        dv.header(3, section.key.subpath);
        const rijen = section.rows.filter(el=> (el.parent === undefined)).sort(el => el.completed ? 1 : 0).map(el => `- [${el.completed ? "x" : " "}] ${el.text}`);
        const content = rijen.join('\n');
        dv.paragraph(content);
    }
}
