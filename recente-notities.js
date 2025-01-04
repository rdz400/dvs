/**
 * Toon recent gemaakte notities uit de vault.
 * @param { string } input.folder - Beperk resultaten tot folder
 */


// Accepteer folder als filter
const folder = input.folder ? `"${input.folder}"` : '';
const vandaag = dv.date('today');
const aantalDagen = 15;
const aantalDagenDuration = dv.duration(`${aantalDagen} days`);
const ondergrens = vandaag - aantalDagenDuration;

// Zoek pagina's gemaakt na ondergrens
let pages = dv
    .pages(folder)
    .filter(p => (p.date >= ondergrens));

// Transformeer
function transform(pagina){
    return {
        'naam': dv.fileLink(pagina.file.name),
        'datum': pagina.date,
        'tags': pagina.file.etags.join(', '),
        'path': pagina.file.path.slice(0,pagina.file.path.lastIndexOf('/'))
    }
}
pages = pages.map(transform);


// Sorteer
pages = pages.sort((p => p.datum), 'desc');


// Toon
dv.table(['naam', 'datum', 'tags', 'path'], pages.map(p => [p.naam, p.datum, p.tags, p.path]));
