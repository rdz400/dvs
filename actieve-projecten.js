/**
 * Toon actieve projecten met wat metadata
 */

const projectenFolder = '"01-projects"';
let pages = dv.pages(`${projectenFolder}`).filter(p => p.type === 'project')


// Transformeer
function transform(p) {

    // Toon laatste dailies
    let dailyLinks = p
        .file
        .inlinks
        .filter(l => l.path.startsWith('00-daily'))
        .map(l => fileName(l.path))
        .sort(null, 'desc')
        .slice(0, 2)
        .map(t => `[[${t}]]`)
        .join(', ');

    return {
        'naam': dv.fileLink(p.file.name),
        'start': p.start,
        'inlinks': p.file.inlinks.filter(l => l.path.startsWith('00-daily')).length,
        'laatste_daily': dailyLinks
    }
}
let pagesTransformed = pages.map(transform)

// Toon
dv.table(['naam', 'start', 'inlinks', 'laatste_daily'], pagesTransformed.map(p => [p.naam, p.start, p.inlinks, p.laatste_daily]));


// Hulp-functie
function fileName(path){
    const regex = /([^/]+)\.([^/.]+)$/; // Match filename and extension
    const match = path.match(regex);
    
    if (match) {
        const filename = match[1]; // Extracted filename without extension
        return filename
    }
}
