/**
 * Statistieken m.b.t. aanwezigheid project in dagelijkse focus 
 * 
 */


const beginDatum = input.begindatum ? input.begindatum : dv.date("2010-12-01");
const eindDatum = input.einddatum ? input.einddatum : dv.date("2013-01-01");

function filterDatums(el) {
    return (el.date >= beginDatum) && (el.date <= eindDatum)
}

const queryPagesFocus = `"0-workspace/0-doen" and -"0-workspace/0-doen/speciaal"`;
const focusPages = dv.pages(queryPagesFocus).sort(el => el.date, 'desc').filter(filterDatums);
const lijst = focusPages.file.lists.filter(el => (el.parent === undefined));

class EnrichedOutlink {
    constructor(bullet, outlink) {
        this.bullet = bullet;
        this.filePath = bullet.path;
        this.linkPath = outlink.path;
        this.linkSubPath = outlink.subpath;  // verwijst naar block code
        this.linkPage = dv.page(outlink.path);
        this.type = this.linkPage.type;
        this.isTask = bullet.task;
        this.done = bullet.task ? bullet.completed : false;
    }
}

const enrichedLinks = [];
for (const bullet of lijst){
    for (const outlink of bullet.outlinks){
        enrichedLinks.push(new EnrichedOutlink(bullet, outlink))
    }
}

const dvLinks = dv.array(enrichedLinks);
const agg = dvLinks.filter(el => el.type === 'project').groupBy(el => el.linkPath).map(el => [el.key, el.rows.length, el.rows.filter(x => x.done).length]);
const totalen = dvLinks.length;

dv.paragraph(`In totaal zijn er ${totalen} flattened links`);
dv.paragraph(`In totaal zijn er ${lijst.length} root bullets`);
dv.table(['key', 'aantal', 'gedaan'], agg);


const projectItems = dvLinks.filter(el => el.type === 'project');

const reFileName = /.+\/(?<file_name>[^\.]+)\.\w+/

dv.paragraph("Details per project:");
for (const project of projectItems.groupBy(el => el.linkPath)) {
    dv.paragraph(`----`);
    dv.header(2, dv.fileLink(project.key));
    const itemsString = [];
    for (const rij of project.rows) {
        const result = reFileName.exec(rij.filePath);
        itemsString.push(`- [${rij.done ? 'x' : ' '}] [[${result.groups.file_name}]]: ${rij.bullet.text}\n`);
    }
    dv.paragraph(itemsString.join(`\n`));
}