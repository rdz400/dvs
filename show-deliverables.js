/**
 * Toon deliverables relatief tot de huidige folder.
 * 
 * @description: `await dv.view('scripts/show-deliverables')`
 */


// Setup en hulpfuncties
function basename(path) { return path.split('/').pop() };
const page = dv.current()
const folder = page.file.folder;


// Selecteer pagina's
let pages = dv.pages(`"${folder}/deliverables"`);


// Definieer transformatie
function transform(page) {
    return {
        'naam': dv.fileLink(page.file.name),
        'datum': page.date,
        'samenvatting': page.samenvatting,
        'status': basename(page.file.folder)}
}


// Transformeer data
let data = pages.map(transform);


// Geef data weer
let headers = ['naam', 'datum', 'samenvatting'];
for (group of data.groupBy(p => p.status)){ // groepeer naar status
    dv.header(2, group.key);
    dv.table(headers, group.rows.map(p => [p.naam, p.datum, p.samenvatting]));
}
